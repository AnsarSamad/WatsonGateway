var watson = require('watson-developer-cloud');

var conversation = watson.conversation({
username: 'ce4418be-0dc5-4301-8374-5a37c680c68b',
password: '7TEAfp4bo0Vv',
version: 'v1',
version_date: '2017-05-26'
});

var getResponse = (userInput)=>{

    return new Promise((resolve,reject)=>{
        conversation.message({
            workspace_id: '2164b471-3806-4da2-8411-dc2ff0b24832',
            input: {'text': userInput}
            },  function(err, response) {
                if (err){
                    console.log('error:', err);
                    reject('Error Occured..'+err);
                } else{
                    console.log(JSON.stringify(response, null, 2));
                    resolve(response.output.text[0]);
                }
                
            });
    })

}
    

module.exports.getWatsonResponse = getResponse;