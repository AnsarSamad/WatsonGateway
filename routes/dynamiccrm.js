var express = require('express');
var router = express.Router();
var request = require('request')
var conversation = require('../watsonConversation');

/* GET home page. */
router.post('/addnewcase', function(req, res, next) {
  issue_title = req.body.issue_title;
  issue_desc = issue_title;
  console.log('got call from client to add new case in CRM');
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
