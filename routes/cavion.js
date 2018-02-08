var express = require('express');
var router = express.Router();
var request = require('request')
var conversation = require('../watsonConversation');
var myCache = require('../watsonConversation').getCache;



router.post('/', function(req, res, next) {
    const action  = req.body.action;
    const data  = req.body.data;
    const member  = data.member;
    console.log('got cavion request from app, action is:'+action+' data:'+JSON.stringify(data))
    if(action ==  'do_pinvalidation'){
        isValidMember(member)
        .then((cavionresponse)=>{
            res.json(cavionresponse);
        })
    }else if(action == 'do_verify_mfa'){
       conversation.getWatsonResponse(action)
       .then((mfavalidationresponse)=>{
        res.json(mfavalidationresponse);
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
                    isValidMemberNumber = "false";
                    if(body != 'false'){
                        isValidMemberNumber="true"
                        previous_context = myCache.get( "previous-context" );   
                        previous_context.isValidMemberNumber=isValidMemberNumber;   
                        previous_context.membername=body; 
                        myCache.set( "previous-context" ,previous_context);
                        getMfa(memberNumber)
                        .then((usermfa)=>{
                            var mfa = usermfa.split("|");
                            cavionresponse = " \n "+mfa[0]
                            previous_context.usermfa_question=mfa[0];
                            previous_context.usermfa_answer=mfa[1];
                            myCache.set( "previous-context" ,previous_context);

                            conversation.getWatsonResponse("ask_mfa")
                            .then((watsonmfaresponse)=>{
                                resolve(watsonmfaresponse);
                            })
                        })
                        // resolve({"output":[cavionresponse],"action":action,"data":{"member":memberNumber}});
                    }

                                      
                       
                    
                }else{
                    console.log('cannot communicate with cavion:'+err)
                    reject(err);
                }
                
            }
    )})
} 

var getMfa  = (memberNumber)=>{
    var options = {
        url:'http://localhost:8080/userdata/getsecquestion',
        method: 'POST',
        contentType:'application/json' ,
        form: {'memberNumber': memberNumber}
    }
    return new Promise((resolve,reject)=>{
        request.post(options,(err,httpResponse,body)=>{
                if(!err){
                    console.log('cavion return user mfa:'+JSON.stringify(httpResponse));
                    //cache the mfa object and send mfa question back
                    myCache.set("usermfa",body,(err,success)=>{
                        if(err){
                            console.log('error occured while caching user mfa  response');
                        }else{
                            console.log('user mfa stored in cache successfully');
                        }
                    }) 
                   
                    resolve(body);
                }else{
                    console.log('cannot communicate with cavion:'+err)
                    reject(err);
                }
                
            }
    )})
} 


module.exports = router;
