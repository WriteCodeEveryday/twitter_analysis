/**
 * MachineController
 *
 * @description :: Server-side logic for managing machines
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

	analyze: function (req, res) {
		require('dotenv').config();
		var Twitter = require('twitter');
 
		var client = new Twitter({
  		consumer_key: process.env.TWITTER_CONSUMER_KEY,
  		consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  		access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  		access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
		});

		var params = {screen_name: req.body.twitter_handle};
		client.get('statuses/user_timeline', params, function(error, tweets, response){
  		if (!error) {
  			var indico = require('indico.io');
				indico.apiKey =  process.env.INDICO_API_KEY;

				//Process tweets in a future update (Extract text into array and feed it to INDICO.)
				res.send('{"status": 200, "handle": "' + req.body.twitter_handle + '", "tweets": "' + JSON.stringify(tweets) + '"}');
  		}else
  		{
  			res.send('{"status": 500, "handle": "' + req.body.twitter_handle + '", "error": "' + JSON.stringify(error) + '"}')
  		}
		});
	}

};
