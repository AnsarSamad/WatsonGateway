var express = require('express');
var router = express.Router();
var request = require('request')

/* GET home page. */
router.post('/addnewcase', function(req, res, next) {
  issue_title = req.body.issue_title;
  issue_desc = issue_title;
  console.log('issue_title:'+issue_title);
  request({
    url:`http://localhost/hack/Service1.svc/test/${issue_title}/${issue_desc}`,
    json:true
    },(err,response,body)=>{
      console.log('addnewcase response is  :'+body)
      if(err){
          console.log('Error Occured :'+err)
          reject('Error Occured..'+err);
      }else{
        res.json(body);
      }      
  });

});

module.exports = router;
