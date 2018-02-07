var express = require('express');
var router = express.Router();

var conversation = require('../watsonConversation');

router.post('/', function(req, res, next) {
    const userInput  = req.body.userInput;
    conversation.getWatsonResponse(userInput)
    .then((response)=>{
        console.log('watson response is :'+response);
        res.json(response);
    })
});

module.exports = router;
