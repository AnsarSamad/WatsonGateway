var express = require('express');
var router = express.Router();
var request = require('request')




router.post('/', function(req, res, next) {
    const action  = req.body.action;
    const data  = req.body.data;
    console.log('got cavion request from app, action is:'+action+' data:'+JSON.stringify(data))
    if(action ==  'do_pinvalidation'){
        const member  = data.member;
        isValidMember(member)
        .then((cavionresponse)=>{
            res.json(cavionresponse)
        })
    }
});



var isValidMember  = (memberNumber)=>{
    var options = {
        url:'http://localhost:8080/userdata/isvalidmember',
        method: 'POST',
        form: {'memberNumber': memberNumber}
    }
    return new Promise((resolve,reject)=>{
        request.post(options,(err,httpResponse,body)=>{
                if(!err){
                    console.log('cavion gateway return:'+body);
                    cavionresponse="You have succesffully verified with cavion product ";
                    if(body ==  'false'){
                        cavionresponse="Sorry, you are not a valid member for cavion product";
                    }
                    resolve([cavionresponse]);
                }else{
                    console.log('cannot communicate with cavion:'+err)
                    reject(err);
                }
                
            }
    )})
} 


module.exports = router;
