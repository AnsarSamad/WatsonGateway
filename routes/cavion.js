var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    
    
    var watson = require('watson-developer-cloud');

    var conversation = watson.conversation({

    });

    conversation.message({
    workspace_id: '2164b471-3806-4da2-8411-dc2ff0b24832',
    input: {'text': 'Hello'}
    },  function(err, response) {
        if (err){
            console.log('error:', err);
            res.send('Error Occured');
        } else{
            console.log(JSON.stringify(response, null, 2));
            res.send(response.output.text[0]);
        }
        
    });
        
    
});

module.exports = router;
