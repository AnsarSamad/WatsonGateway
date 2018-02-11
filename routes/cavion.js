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
    if(action ==  'do_validatepin'){
        isValidMember(member , 'false')
        .then((cavionresponse)=>{
           conversation.getWatsonResponse('trigger_ticket')
           .then((watsonresponse)=>{
            res.json(watsonresponse);
           })
        })
    }else if(action ==  'do_pinvalidation'){
        isValidMember(member,'true')
        .then((cavionresponse)=>{
            res.json(cavionresponse);
        })
    }else if(action == 'do_verify_mfa'){
        console.log('am in do_verify_mfa action :'+member);
        const usermfa_answer  = data.usermfa_answer;
        const user_entered_mfa  =  data.user_entered_mfa;
        console.log('usermfa_answer:'+usermfa_answer)
        console.log('user_entered_mfa:'+user_entered_mfa)
        resData = [];
        if(usermfa_answer == user_entered_mfa ){
            // cache mfa verification in previous_context
            // trigget pin reset
            console.log('mfa verified , doing pin reset');
            resData.push('You have successfully validated with Finbot');
            resetPinCount(member)
            .then((pinresetResponse)=>{
                console.log('resetpincount return:'+pinresetResponse)
                resData.push('We have reset the invalid login count for you ');
                resData.push('please try again with your internet banking login');
                res.json({"output":resData})
            })
        }else{
            res.json({"output":['Sorry you are not a valid member']})
        }
    }
});



var isValidMember  = (memberNumber,docheckmfa)=>{
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
                        if(docheckmfa == 'true'){
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
                        }else{
                            resolve(body)
                        }
                    
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

var resetPinCount = (member)=>{
    var options = {
        url:'http://localhost:8080/userdata/resetmemberinvalidlogincount',
        method: 'POST',
        contentType:'application/json' ,
        form: {'member': member}
    }
    console.log('calling reset bad pin count for memebr:'+member);
    return new Promise((resolve,reject)=>{
        request.post(options,(err,httpResponse,body)=>{
                if(!err){
                    console.log('cavion serive return for pin reset'+body);
                    resolve(body);
                }else{
                    console.log('cannot communicate with cavion:'+err)
                    reject(err);
                }                
            }
    )})
}

module.exports = router;