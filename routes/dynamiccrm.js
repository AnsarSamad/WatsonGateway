var express = require('express');
var router = express.Router();
var request = require('request')
var conversation = require('../watsonConversation');
var myCache = require('../watsonConversation').getCache;

/* GET home page. */
router.post('/addnewcase', function(req, res, next) {
  issue_title = req.body.issue_title;
  issue_title = "FinBot - First Fiancial demo - "+issue_title
  issue_desc = issue_title;
  ticket_number = req.body.ticket_number;
  console.log('got call from client to add new case in CRM');
  
  //set the ticket number in the cache
  previous_context = myCache.get( "previous-context" );   
  previous_context.ticket_number = ticket_number;
  myCache.set( "previous-context" ,previous_context);

  //returnn watson respons then create crm case
  conversation.getWatsonResponse('ticket  created')
  .then((watsonresponse)=>{
    res.json(watsonresponse);
  })
  // add new case in CRM
  addNewCaseinCRM(issue_title,issue_desc)
  .then((resolve)=>{
    console.log('added case with title:'+issue_title+' in CRM');    
  })
});

var addNewCaseinCRM = (issue_title , issue_desc)=>{
    console.log('issue_title:'+issue_title);
    return new Promise((resolve,reject)=>{
      request({
        url:`http://localhost/hack/Service1.svc/test/${issue_title}/${issue_desc}`,
        json:true
        },(err,response,body)=>{
          console.log('addnewcase response is  :'+body)
          if(err){
              console.log('Error Occured :'+err)
              reject('Error Occured..'+err);
          }else{
            resolve(body);
          }      
      });
    })
}

module.exports = router;
