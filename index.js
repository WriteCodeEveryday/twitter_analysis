require('dotenv').config();
var express = require('express');
var app = express();
var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));
app.use("", express.static(__dirname + '/'))

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.post('/analyze',function(req, res){
	res.send('{"status":200, "handle":"' + req.body.twitter_handle + '"}')
})

app.listen(8080)