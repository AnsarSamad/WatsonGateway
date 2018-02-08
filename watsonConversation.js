var watson = require('watson-developer-cloud');
const NodeCache = require( "node-cache" );



const myCache = new NodeCache();

var conversation = watson.conversation({
username: 'ce4418be-0dc5-4301-8374-5a37c680c68b',
password: '7TEAfp4bo0Vv',
version: 'v1',
version_date: '2017-05-26'
});

var getResponse = (userInput)=>{
    //if user input is conversation_start , means user entered in the chat window , reset cache
    if(userInput ==  'conversation_start'){
        value = myCache.del( "previous-context" );
    }
    return new Promise((resolve,reject)=>{
        //try sychronous mode
        previous_context = myCache.get( "previous-context" );
        if(previous_context ==  undefined){
            previous_context={}
        }
        console.log('previous context:'+JSON.stringify(previous_context));
        conversation.message({
            workspace_id : '2164b471-3806-4da2-8411-dc2ff0b24832',
            input : {'text': userInput},
            context : previous_context
            },  (err, response)=> {
                if (err){
                    console.log('error:', err);
                    reject('Error Occured..'+err);
                } else{

                    myCache.set("previous-context",response.context,(err,success)=>{
                        if(err){
                            console.log('error occured while caching response');
                        }else{
                            console.log('watson context stored in cache successfully');
                        }
                    })
                    
                    resolve({"output":response.output.text,"action":response.output.action,"data":{"member":response.output.member}});
                }
                
            });
    })

}
    

module.exports.getWatsonResponse = getResponse;
module.exports.getCache = myCache;