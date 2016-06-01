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

		var params = { screen_name: req.body.twitter_handle, count: 200};
		client.get('statuses/user_timeline', params, function(error, tweets, response){
  		if (!error) {
  			var indico = require('indico.io');
				indico.apiKey =  process.env.INDICO_API_KEY;

				//Extract text from tweets
				var value = ""
				for(var i = 0; i < tweets.length; i++) {
    			var obj = tweets[i];
    			value += obj.text + "."
    		}

    		indico.analyzeText(value, {apis: ['sentiment','emotion','political','people','places','organizations','personality']
    		}).then(function(response){

    			//Simple 0.7060874727622812
    			var sentiment = response.sentiment
    			
    			//5 emotions -> "emotion": [{"anger": 0.5022690296173096,"joy": 0.05221380293369293,"sadness": 0.35626864433288574,"fear": 0.054352909326553345,"surprise": 0.03489557281136513}, {"anger": 0.5022690296173096,"joy": 0.05221380293369293,"sadness": 0.35626864433288574,"fear": 0.054352909326553345,"surprise": 0.03489557281136513}, ... ]
    			var emotion = response.emotion

    			//4 categories -> "political": [{"Libertarian": 0.2628689885091469,"Green": 0.048484506748901146,"Liberal": 0.21199788591701155,"Conservative": 0.4766486188249404}, {"Libertarian": 0.2628689885091469,"Green": 0.048484506748901146,"Liberal": 0.21199788591701155,"Conservative": 0.4766486188249404}, ...]
    			var political = response.political

    			//4 categories -> "personality": [{ "openness": 0.4158035377475702, "extraversion": 0.4952443598185555, "agreeableness": 0.4191624982315197, "conscientiousness": 0.5285710682129038 }, ... ]
    			var personality = response.personality

    			//Top 3 by confidence -> "people": [ [{"text": "Carson", "confidence": 0.575975239276886, "position": [79, 85]}, {"text": "Ben Carson","confidence": 0.49414870142936707,"position": [75, 85]}] ... ]
    			var people = response.people
    			var people_final = []

    			try {
    				var current_value = 0;
    				while (people_final.length < 3){
    					var failed = false;
    					for (var i = 0; i < people_final.length; i++){
    						if (people[current_value].text.indexOf(people_final[i]) != -1 || people_final[i].indexOf(people[current_value].text) != -1){
 									failed = true;
    						}
    					}
    					if (!failed){
    						people_final.push(people[current_value].text);
    					}
    					current_value++;
    				}
    			} catch (e) {
    				people_final = ["ERROR","ERROR","ERROR"]
    			}

    			//Top 3 by confidence -> "places": [ [{"text": "miami", "confidence": 0.6325511336326599, "position": [8, 13]}, ... ] ... ]
    			var places = response.places
    			var places_final = []

    			try {
    				var current_value = 0;
    				while (places_final.length < 3){
    					var failed = false;
    					for (var i = 0; i < places_final.length; i++){
    						if (places[current_value].text.indexOf(places_final[i]) != -1 || places_final[i].indexOf(places[current_value].text) != -1){
    							failed = true
    						}
    					}
    					if (!failed){
    						places_final.push(places[current_value].text);
    					}
    					current_value++;
    				}
    			} catch (e) {
    				places_final = ["ERROR","ERROR","ERROR"]
    			}

    			//Top 3 by confidence -> "organizations": [ [{"text": "Bitstop","confidence": 0.42235177755355835, "position": [23, 30]}, ... ] ... ]
    			var organizations = response.organizations
    			var organizations_final = []

    			try {
    				var current_value = 0;
    				while (organizations_final.length < 3){
    					var failed = false;
    					for (var i = 0; i < organizations_final.length; i++){
    						if (organizations[current_value].text.indexOf(organizations_final[i]) != -1 || organizations_final[i].indexOf(organizations[current_value].text) != -1){
    							failed = true;
    						}
    					}
    					if (!failed){
    						organizations_final.push(organizations[current_value].text);
    					}
    					current_value++;
    				}
    			} catch (e) {
    				organizations_final = ["ERROR","ERROR","ERROR"]
    			}


    			var returns = {
    				sentiment: sentiment,
    				emotion: emotion,
    				political: political,
    				personality : personality,
    				people: people_final,
    				places: places_final,
    				organizations: organizations_final
    			}


    			res.send('{"status": 200, "handle": "' + req.body.twitter_handle + '", "tweets": ' + JSON.stringify(returns) + ', "raw": ' + JSON.stringify(value) + '}');
    		}).catch(function(error){
    				res.send('{"status": 500, "handle": "' + req.body.twitter_handle + '", "error": ' + JSON.stringify(error) + '}')
    		});
  		}else
  		{
  			res.send('{"status": 500, "handle": "' + req.body.twitter_handle + '", "error": ' + JSON.stringify(error) + '}')
  		}
		});
	}

};


//Sample
/*
{
	"emotion": {
		"anger": 0.10770119726657867,
		"joy": 0.21969309449195862,
		"sadness": 0.44901037216186523,
		"fear": 0.13291281461715698,
		"surprise": 0.0906825065612793
	},
	"organizations": [{
		"text": "Bitstop",
		"confidence": 0.4549730718135834,
		"position": [278, 285]
	}, {
		"text": "Bitgo",
		"confidence": 0.3852015733718872,
		"position": [193, 198]
	}, {
		"text": "miami",
		"confidence": 0.22250382602214813,
		"position": [360, 365]
	}, {
		"text": "leapmotion",
		"confidence": 0.20667169988155365,
		"position": [1085, 1095]
	}, {
		"text": "devs",
		"confidence": 0.12341558933258057,
		"position": [1116, 1120]
	}, {
		"text": "EVERYTHING",
		"confidence": 0.10746971517801285,
		"position": [982, 992]
	}, {
		"text": "Rev 4",
		"confidence": 0.09331728518009186,
		"position": [1126, 1131]
	}, {
		"text": "bitcoin",
		"confidence": 0.08895915746688843,
		"position": [576, 583]
	}, {
		"text": "DJI",
		"confidence": 0.07156150788068771,
		"position": [488, 491]
	}, {
		"text": "BernieSandersRT",
		"confidence": 0.06632579118013382,
		"position": [117, 132]
	}, {
		"text": "DJIDrones",
		"confidence": 0.062020834535360336,
		"position": [517, 526]
	}, {
		"text": "CoinATMRadar",
		"confidence": 0.060129936784505844,
		"position": [533, 545]
	}, {
		"text": "LamassuBTC",
		"confidence": 0.05949519947171211,
		"position": [609, 619]
	}, {
		"text": "nice",
		"confidence": 0.0540035180747509,
		"position": [1344, 1348]
	}, {
		"text": "DJI Phantom 3",
		"confidence": 0.053356416523456573,
		"position": [488, 501]
	}, {
		"text": "Republican",
		"confidence": 0.031810685992240906,
		"position": [45, 55]
	}, {
		"text": "attdeveloper",
		"confidence": 0.029412856325507164,
		"position": [1002, 1014]
	}, {
		"text": "Rev 6",
		"confidence": 0.027267757803201675,
		"position": [1135, 1140]
	}, {
		"text": "LamassuBTC   BTM",
		"confidence": 0.02629099413752556,
		"position": [609, 625]
	}, {
		"text": "miami @Bitcoin",
		"confidence": 0.02316461317241192,
		"position": [360, 374]
	}, {
		"text": "ATM",
		"confidence": 0.016733722761273384,
		"position": [584, 587]
	}, {
		"text": "bitcoin",
		"confidence": 0.0166330486536026,
		"position": [438, 445]
	}, {
		"text": "gusta",
		"confidence": 0.013479468412697315,
		"position": [431, 436]
	}, {
		"text": "eht",
		"confidence": 0.012415293604135513,
		"position": [790, 793]
	}, {
		"text": "JmeMiller1974",
		"confidence": 0.011233899742364883,
		"position": [134, 147]
	}, {
		"text": "jayd3e",
		"confidence": 0.011154712177813053,
		"position": [257, 263]
	}],
	"places": [{
		"text": "Miami",
		"confidence": 0.7948465943336487,
		"position": [629, 634]
	}, {
		"text": "miami",
		"confidence": 0.5961987376213074,
		"position": [360, 365]
	}, {
		"text": "nice",
		"confidence": 0.45687413215637207,
		"position": [1344, 1348]
	}, {
		"text": "devs",
		"confidence": 0.1895751804113388,
		"position": [1116, 1120]
	}, {
		"text": "Bitstop",
		"confidence": 0.17578363418579102,
		"position": [701, 708]
	}, {
		"text": "awesomeness",
		"confidence": 0.16931836307048798,
		"position": [852, 863]
	}, {
		"text": "leapmotion",
		"confidence": 0.1657329648733139,
		"position": [1085, 1095]
	}, {
		"text": "Bitstop",
		"confidence": 0.13360166549682617,
		"position": [278, 285]
	}, {
		"text": "Bitgo",
		"confidence": 0.11490237712860107,
		"position": [193, 198]
	}, {
		"text": "LamassuBTC   BTM",
		"confidence": 0.11476407945156097,
		"position": [609, 625]
	}, {
		"text": "BernieSandersRT",
		"confidence": 0.11122340708971024,
		"position": [117, 132]
	}, {
		"text": "miami @Bitcoin",
		"confidence": 0.08233713358640671,
		"position": [360, 374]
	}, {
		"text": "bitcoin",
		"confidence": 0.06296229362487793,
		"position": [551, 558]
	}, {
		"text": "TELL US EVERYTHING",
		"confidence": 0.06094905734062195,
		"position": [974, 992]
	}, {
		"text": "US EVERYTHING",
		"confidence": 0.052938081324100494,
		"position": [979, 992]
	}, {
		"text": "Miami",
		"confidence": 0.04854694381356239,
		"position": [563, 568]
	}, {
		"text": "bitcoin",
		"confidence": 0.04260127991437912,
		"position": [718, 725]
	}, {
		"text": "miami @",
		"confidence": 0.04104752466082573,
		"position": [360, 367]
	}, {
		"text": "CoinATMRadar",
		"confidence": 0.03381305932998657,
		"position": [533, 545]
	}, {
		"text": "lamassu",
		"confidence": 0.03047831729054451,
		"position": [245, 252]
	}, {
		"text": "maketh",
		"confidence": 0.030459903180599213,
		"position": [341, 347]
	}, {
		"text": "TELL",
		"confidence": 0.029530540108680725,
		"position": [974, 978]
	}, {
		"text": "Ben Carson",
		"confidence": 0.021998319774866104,
		"position": [75, 85]
	}, {
		"text": "gusta @",
		"confidence": 0.019559720531105995,
		"position": [431, 438]
	}, {
		"text": "new bitcoin ATM",
		"confidence": 0.019034327939152718,
		"position": [572, 587]
	}, {
		"text": "EAT24",
		"confidence": 0.016539013013243675,
		"position": [404, 409]
	}, {
		"text": "EVERYTHING",
		"confidence": 0.014451091177761555,
		"position": [982, 992]
	}, {
		"text": "PLEASE!@",
		"confidence": 0.014393669553101063,
		"position": [994, 1002]
	}, {
		"text": "Bitcoin",
		"confidence": 0.013913417235016823,
		"position": [367, 374]
	}, {
		"text": "PLEASE",
		"confidence": 0.012766469269990921,
		"position": [994, 1000]
	}, {
		"text": "satoshi",
		"confidence": 0.011481605470180511,
		"position": [218, 225]
	}, {
		"text": "net  @CoinATMRadar",
		"confidence": 0.01091388612985611,
		"position": [527, 545]
	}],
	"sentiment": 0.9614922100133455, 
	"people": [{
		"text": "Carson",
		"confidence": 0.575975239276886,
		"position": [79, 85]
	}, {
		"text": "Ben Carson",
		"confidence": 0.49414870142936707,
		"position": [75, 85]
	}, {
		"text": "Bitgo",
		"confidence": 0.48030149936676025,
		"position": [193, 198]
	}, {
		"text": "eht",
		"confidence": 0.3464406430721283,
		"position": [790, 793]
	}, {
		"text": "Phantom",
		"confidence": 0.2858090400695801,
		"position": [492, 499]
	}, {
		"text": "DJIDrones",
		"confidence": 0.19223704934120178,
		"position": [517, 526]
	}, {
		"text": "BernieSandersRT",
		"confidence": 0.1368894726037979,
		"position": [117, 132]
	}, {
		"text": "CoinATMRadar",
		"confidence": 0.13571564853191376,
		"position": [533, 545]
	}, {
		"text": "Buy bitcoin",
		"confidence": 0.12312901020050049,
		"position": [547, 558]
	}, {
		"text": "bitcoin",
		"confidence": 0.10911515355110168,
		"position": [551, 558]
	}, {
		"text": "DJI Phantom",
		"confidence": 0.10448290407657623,
		"position": [488, 499]
	}, {
		"text": "devs",
		"confidence": 0.10427922755479813,
		"position": [1116, 1120]
	}, {
		"text": "Bitstop",
		"confidence": 0.09767981618642807,
		"position": [278, 285]
	}, {
		"text": "BTM",
		"confidence": 0.07543426752090454,
		"position": [622, 625]
	}, {
		"text": "LamassuBTC   BTM",
		"confidence": 0.07096323370933533,
		"position": [609, 625]
	}, {
		"text": "Rev",
		"confidence": 0.06100069358944893,
		"position": [1135, 1138]
	}, {
		"text": "BB10Believe",
		"confidence": 0.0579497329890728,
		"position": [1257, 1268]
	}, {
		"text": "yay",
		"confidence": 0.048388268798589706,
		"position": [352, 355]
	}, {
		"text": "Ben",
		"confidence": 0.04608171433210373,
		"position": [75, 78]
	}, {
		"text": "BlackBerry10",
		"confidence": 0.03785024210810661,
		"position": [1218, 1230]
	}, {
		"text": "TELL",
		"confidence": 0.03778965026140213,
		"position": [974, 978]
	}, {
		"text": "Rev",
		"confidence": 0.029726998880505562,
		"position": [1126, 1129]
	}, {
		"text": "lamassu",
		"confidence": 0.02732711471617222,
		"position": [245, 252]
	}, {
		"text": "Bitcoin",
		"confidence": 0.02235521748661995,
		"position": [367, 374]
	}, {
		"text": "EVERYTHING",
		"confidence": 0.021854141727089882,
		"position": [982, 992]
	}, {
		"text": "gusta",
		"confidence": 0.019904054701328278,
		"position": [431, 436]
	}, {
		"text": "erucesThis",
		"confidence": 0.01954161375761032,
		"position": [794, 804]
	}, {
		"text": "eht erucesThis",
		"confidence": 0.01910296082496643,
		"position": [790, 804]
	}, {
		"text": "leapmotion",
		"confidence": 0.018520459532737732,
		"position": [1085, 1095]
	}, {
		"text": "Book",
		"confidence": 0.017551064491271973,
		"position": [805, 809]
	}, {
		"text": "rules",
		"confidence": 0.013656404800713062,
		"position": [335, 340]
	}, {
		"text": "Sure",
		"confidence": 0.010997829958796501,
		"position": [264, 268]
	}, {
		"text": "Bitstop",
		"confidence": 0.010324639268219471,
		"position": [701, 708]
	}, {
		"text": "@LamassuBTC   BTM",
		"confidence": 0.010004649870097637,
		"position": [608, 625]
	}],
	"political": {
		"Libertarian": 0.5406718252042177,
		"Green": 0.1265514861121883,
		"Liberal": 0.2515936997175016,
		"Conservative": 0.08118298896609229
	},
	"personas": {
		"status": 503,
		"error": "Sorry, all of our servers seem to be busy right now!"
	},
	"personality": {
		"openness": 0.5968871929935206,
		"extraversion": 0.4319745372917692,
		"agreeableness": 0.3916710343277245,
		"conscientiousness": 0.5058410112885223
	}
}

"}*/
