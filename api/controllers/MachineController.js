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

				//Extract text from tweets
				var batch = []
				for(var i = 0; i < tweets.length; i++) {
    			var obj = tweets[i];
    			batch.push(obj.text);
    		}
    		indico.analyzeText(batch, {apis: ['sentiment','emotion','political','people','places','organizations','personality','personas']
    		}).then(function(response){
    			//INDICO IS STINGY... 120 calls charged for one API call agains these 8 APIs (Write code before doing this.)

    			//Simple average -> "sentiment": [0.14037664245921297, 0.3164196509073868, 0.9664673923843579, 0.8337666948490955, 0.5449177397554756, 0.9074327848540709, 0.5706372458875328, 0.8746659836118568, 0.07633844270069493, 0.36066941236175987, 0.6638820254660671, 0.96041208453625, 0.812558825455778, 0.4885676755252121, 0.9740979188139095, 0.9354258685317967, 0.31058486990211964, 0.8538086037210768, 0.7060874727622812, 0.26267473345460673],
    			var sentiment = response.sentiment
    			
    			//Average of 5 emotions -> "emotion": [{"anger": 0.5022690296173096,"joy": 0.05221380293369293,"sadness": 0.35626864433288574,"fear": 0.054352909326553345,"surprise": 0.03489557281136513}, {"anger": 0.5022690296173096,"joy": 0.05221380293369293,"sadness": 0.35626864433288574,"fear": 0.054352909326553345,"surprise": 0.03489557281136513}, ... ]
    			var emotion = response.emotion

    			//Average of 4 categories -> "political": [{"Libertarian": 0.2628689885091469,"Green": 0.048484506748901146,"Liberal": 0.21199788591701155,"Conservative": 0.4766486188249404}, {"Libertarian": 0.2628689885091469,"Green": 0.048484506748901146,"Liberal": 0.21199788591701155,"Conservative": 0.4766486188249404}, ...]
    			var political = response.political

    			//Top 3 by confidence -> "people": [ [{"text": "Carson", "confidence": 0.575975239276886, "position": [79, 85]}, {"text": "Ben Carson","confidence": 0.49414870142936707,"position": [75, 85]}] ... ]
    			var people = response.people

    			//Top 3 by confidence -> "places": [ [{"text": "miami", "confidence": 0.6325511336326599, "position": [8, 13]}, ... ] ... ]
    			var places = response.places

    			//Top 3 by confidence -> "organizations": [ [{"text": "Bitstop","confidence": 0.42235177755355835, "position": [23, 30]}, ... ] ... ]
    			var organizations = response.organizations

    			//Average of 4 categories -> "personality": [{ "openness": 0.4158035377475702, "extraversion": 0.4952443598185555, "agreeableness": 0.4191624982315197, "conscientiousness": 0.5285710682129038 }, ... ]
    			var personality = response.personality

    			//Top 4 personas -> UNKNOWN FORMAT, SERVER OFFLINE DURING REQUEST.
    			var personas = response.personas

    			res.send('{"status": 200, "handle": "' + req.body.twitter_handle + '", "tweets": "' + JSON.stringify(response) + '"}');
    		}).catch(function(error){
    				res.send('{"status": 500, "handle": "' + req.body.twitter_handle + '", "error": "' + JSON.stringify(error) + '"}')
    		});
  		}else
  		{
  			res.send('{"status": 500, "handle": "' + req.body.twitter_handle + '", "error": "' + JSON.stringify(error) + '"}')
  		}
		});
	}

};

//SAMPLE INDICO PAYLOAD
/*{
	"status": 200,
	"handle": "@lazherrera",
	"tweets": {
		"emotion": [{
			"anger": 0.5022690296173096,
			"joy": 0.05221380293369293,
			"sadness": 0.35626864433288574,
			"fear": 0.054352909326553345,
			"surprise": 0.03489557281136513
		}, {
			"anger": 0.1699855625629425,
			"joy": 0.13292531669139862,
			"sadness": 0.3560853898525238,
			"fear": 0.2871917486190796,
			"surprise": 0.05381205677986145
		}, {
			"anger": 0.24986818432807922,
			"joy": 0.15643098950386047,
			"sadness": 0.36364680528640747,
			"fear": 0.20235633850097656,
			"surprise": 0.027697697281837463
		}, {
			"anger": 0.06200756877660751,
			"joy": 0.16526030004024506,
			"sadness": 0.41158318519592285,
			"fear": 0.2619168162345886,
			"surprise": 0.09923208504915237
		}, {
			"anger": 0.07317692786455154,
			"joy": 0.43534883856773376,
			"sadness": 0.23632600903511047,
			"fear": 0.11825107038021088,
			"surprise": 0.13689714670181274
		}, {
			"anger": 0.05979093164205551,
			"joy": 0.46942636370658875,
			"fear": 0.19984932243824005,
			"sadness": 0.14168934524059296,
			"surprise": 0.12924407422542572
		}, {
			"anger": 0.14535532891750336,
			"joy": 0.3887072205543518,
			"sadness": 0.27264708280563354,
			"fear": 0.15086212754249573,
			"surprise": 0.04242828115820885
		}, {
			"anger": 0.16049331426620483,
			"joy": 0.1657661497592926,
			"fear": 0.3106161952018738,
			"sadness": 0.2752985656261444,
			"surprise": 0.08782577514648438
		}, {
			"anger": 0.05850077420473099,
			"joy": 0.0966569185256958,
			"fear": 0.5680117607116699,
			"sadness": 0.24954408407211304,
			"surprise": 0.027286430820822716
		}, {
			"anger": 0.11423473060131073,
			"joy": 0.14491334557533264,
			"sadness": 0.42563021183013916,
			"fear": 0.23814308643341064,
			"surprise": 0.07707861065864563
		}, {
			"anger": 0.14198105037212372,
			"joy": 0.1333678811788559,
			"fear": 0.3134452998638153,
			"sadness": 0.28340965509414673,
			"surprise": 0.12779605388641357
		}, {
			"anger": 0.1359541416168213,
			"joy": 0.21263355016708374,
			"sadness": 0.3643589913845062,
			"fear": 0.22831305861473083,
			"surprise": 0.0587402768433094
		}, {
			"anger": 0.1824818253517151,
			"joy": 0.199987530708313,
			"fear": 0.30492132902145386,
			"sadness": 0.27112868428230286,
			"surprise": 0.041480615735054016
		}, {
			"anger": 0.17725223302841187,
			"surprise": 0.3641880750656128,
			"fear": 0.19006600975990295,
			"sadness": 0.10922595858573914,
			"joy": 0.15926769375801086
		}, {
			"anger": 0.1723424643278122,
			"joy": 0.3024013638496399,
			"sadness": 0.2742193639278412,
			"fear": 0.10386605560779572,
			"surprise": 0.14717073738574982
		}, {
			"anger": 0.0874452292919159,
			"joy": 0.2625117003917694,
			"fear": 0.5740060806274414,
			"sadness": 0.044993601739406586,
			"surprise": 0.03104335442185402
		}, {
			"anger": 0.14616572856903076,
			"joy": 0.09470219165086746,
			"fear": 0.3780752420425415,
			"sadness": 0.35864871740341187,
			"surprise": 0.022408168762922287
		}, {
			"anger": 0.25359100103378296,
			"joy": 0.2976640462875366,
			"fear": 0.1799578070640564,
			"sadness": 0.17765673995018005,
			"surprise": 0.09113043546676636
		}, {
			"anger": 0.09825663268566132,
			"joy": 0.12265227735042572,
			"fear": 0.5192654728889465,
			"sadness": 0.2292240411043167,
			"surprise": 0.03060154616832733
		}, {
			"anger": 0.11249657720327377,
			"surprise": 0.3380276560783386,
			"sadness": 0.14743101596832275,
			"fear": 0.08289890736341476,
			"joy": 0.3191458284854889
		}],
		"organizations": [
			[{
				"text": "BernieSanders",
				"confidence": 0.053663019090890884,
				"position": [117, 130]
			}, {
				"text": "Republican",
				"confidence": 0.046292997896671295,
				"position": [45, 55]
			}],
			[{
				"text": "RT",
				"confidence": 0.21953243017196655,
				"position": [0, 2]
			}, {
				"text": "JmeMiller1974",
				"confidence": 0.18728524446487427,
				"position": [4, 17]
			}],
			[{
				"text": "Sci-Fi Ever",
				"confidence": 0.07125872373580933,
				"position": [9, 20]
			}, {
				"text": "Sci-Fi",
				"confidence": 0.021587014198303223,
				"position": [9, 15]
			}],
			[{
				"text": "Bitgo",
				"confidence": 0.29443758726119995,
				"position": [36, 41]
			}, {
				"text": "BitGo",
				"confidence": 0.030819157138466835,
				"position": [1, 6]
			}, {
				"text": "BitGo Anything",
				"confidence": 0.022435231134295464,
				"position": [1, 15]
			}],
			[{
				"text": "Bitstop",
				"confidence": 0.42235177755355835,
				"position": [23, 30]
			}, {
				"text": "jayd3e",
				"confidence": 0.03295227140188217,
				"position": [2, 8]
			}],
			[{
				"text": "miami",
				"confidence": 0.20509812235832214,
				"position": [8, 13]
			}, {
				"text": "miami @Bitcoin",
				"confidence": 0.1201438456773758,
				"position": [8, 22]
			}, {
				"text": "Bitcoin",
				"confidence": 0.03350836783647537,
				"position": [15, 22]
			}, {
				"text": "yay",
				"confidence": 0.0114375539124012,
				"position": [0, 3]
			}],
			[{
				"text": "Yes",
				"confidence": 0.032281238585710526,
				"position": [0, 3]
			}, {
				"text": "EAT24",
				"confidence": 0.027674829587340355,
				"position": [31, 36]
			}],
			[{
				"text": "bitcoin",
				"confidence": 0.02261747047305107,
				"position": [10, 17]
			}],
			[{
				"text": "DJI Phantom 3",
				"confidence": 0.13775517046451569,
				"position": [16, 29]
			}, {
				"text": "DJI",
				"confidence": 0.11717211455106735,
				"position": [16, 19]
			}, {
				"text": "DJIDrones",
				"confidence": 0.06912203133106232,
				"position": [45, 54]
			}, {
				"text": "DJIDrones_net",
				"confidence": 0.026542475447058678,
				"position": [45, 58]
			}, {
				"text": "DJI Phantom 3 Standard",
				"confidence": 0.016798362135887146,
				"position": [16, 38]
			}, {
				"text": "DJI Phantom",
				"confidence": 0.015179566107690334,
				"position": [16, 27]
			}],
			[{
				"text": "CoinATMRadar",
				"confidence": 0.10967756807804108,
				"position": [4, 16]
			}, {
				"text": "bitcoin",
				"confidence": 0.09474168717861176,
				"position": [47, 54]
			}, {
				"text": "LamassuBTC",
				"confidence": 0.09283129125833511,
				"position": [80, 90]
			}, {
				"text": "RT",
				"confidence": 0.03381878510117531,
				"position": [0, 2]
			}, {
				"text": "ATM",
				"confidence": 0.02181500755250454,
				"position": [55, 58]
			}, {
				"text": "CoinATMRadar: Buy bitcoin",
				"confidence": 0.0133312176913023,
				"position": [4, 29]
			}],
			[{
				"text": "wynwoodcafe",
				"confidence": 0.48625051975250244,
				"position": [46, 57]
			}, {
				"text": "BTM",
				"confidence": 0.2086709439754486,
				"position": [6, 9]
			}, {
				"text": "First BTM",
				"confidence": 0.04971509426832199,
				"position": [0, 9]
			}, {
				"text": "Miami",
				"confidence": 0.017916295677423477,
				"position": [13, 18]
			}],
			[{
				"text": "RT",
				"confidence": 0.03826227784156799,
				"position": [0, 2]
			}, {
				"text": "Bitstop",
				"confidence": 0.011180329136550426,
				"position": [29, 36]
			}],
			[{
				"text": "space",
				"confidence": 0.012977915816009045,
				"position": [30, 35]
			}],
			[{
				"text": "eht eruces",
				"confidence": 0.31179675459861755,
				"position": [10, 20]
			}, {
				"text": "eruces",
				"confidence": 0.03880086913704872,
				"position": [14, 20]
			}, {
				"text": "eht",
				"confidence": 0.023923784494400024,
				"position": [10, 13]
			}, {
				"text": "retupmoc eht eruces",
				"confidence": 0.010479474440217018,
				"position": [1, 20]
			}],
			[],
			[{
				"text": "EVERYTHING",
				"confidence": 0.1421160101890564,
				"position": [106, 116]
			}, {
				"text": "ThalmicDev",
				"confidence": 0.02321046032011509,
				"position": [1, 11]
			}],
			[{
				"text": "attdeveloper",
				"confidence": 0.024020353332161903,
				"position": [1, 13]
			}, {
				"text": "developerlove Nothing",
				"confidence": 0.01677282340824604,
				"position": [15, 36]
			}],
			[{
				"text": "leapmotion",
				"confidence": 0.12488299608230591,
				"position": [31, 41]
			}, {
				"text": "devs",
				"confidence": 0.11789288371801376,
				"position": [62, 66]
			}, {
				"text": "Rev 4",
				"confidence": 0.09331728518009186,
				"position": [72, 77]
			}, {
				"text": "Rev 6",
				"confidence": 0.027267757803201675,
				"position": [81, 86]
			}, {
				"text": "leapmotion",
				"confidence": 0.016764122992753983,
				"position": [1, 11]
			}],
			[{
				"text": "BB10Believe",
				"confidence": 0.0187948327511549,
				"position": [69, 80]
			}, {
				"text": "BlackBerry10",
				"confidence": 0.011166522279381752,
				"position": [42, 54]
			}],
			[{
				"text": "nice",
				"confidence": 0.0540035180747509,
				"position": [88, 92]
			}]
		],
		"places": [
			[{
				"text": "BernieSanders",
				"confidence": 0.03070300817489624,
				"position": [117, 130]
			}, {
				"text": "Ben Carson",
				"confidence": 0.021998319774866104,
				"position": [75, 85]
			}],
			[{
				"text": "RT @JmeMiller1974",
				"confidence": 0.027121398597955704,
				"position": [0, 17]
			}],
			[],
			[{
				"text": "Bitgo",
				"confidence": 0.3613572418689728,
				"position": [36, 41]
			}, {
				"text": "lamassu",
				"confidence": 0.05370660498738289,
				"position": [88, 95]
			}, {
				"text": "BitGo",
				"confidence": 0.016546882688999176,
				"position": [1, 6]
			}, {
				"text": "satoshi",
				"confidence": 0.011481605470180511,
				"position": [61, 68]
			}],
			[{
				"text": "Bitstop",
				"confidence": 0.12673325836658478,
				"position": [23, 30]
			}, {
				"text": "maketh",
				"confidence": 0.07295962423086166,
				"position": [86, 92]
			}],
			[{
				"text": "miami",
				"confidence": 0.6325511336326599,
				"position": [8, 13]
			}, {
				"text": "Bitcoin",
				"confidence": 0.07647649198770523,
				"position": [15, 22]
			}, {
				"text": "miami @Bitcoin",
				"confidence": 0.043598249554634094,
				"position": [8, 22]
			}, {
				"text": "yay",
				"confidence": 0.016298893839120865,
				"position": [0, 3]
			}, {
				"text": "miami @",
				"confidence": 0.012566935271024704,
				"position": [8, 15]
			}],
			[{
				"text": "EAT24",
				"confidence": 0.044518791139125824,
				"position": [31, 36]
			}],
			[{
				"text": "fintech",
				"confidence": 0.031139329075813293,
				"position": [40, 47]
			}],
			[{
				"text": "DJIDrones",
				"confidence": 0.013280860148370266,
				"position": [45, 54]
			}],
			[{
				"text": "Miami",
				"confidence": 0.23161551356315613,
				"position": [34, 39]
			}, {
				"text": "RT @CoinATMRadar",
				"confidence": 0.20503933727741241,
				"position": [0, 16]
			}, {
				"text": "LamassuBTC",
				"confidence": 0.09992067515850067,
				"position": [80, 90]
			}, {
				"text": "bitcoin",
				"confidence": 0.0816488191485405,
				"position": [22, 29]
			}, {
				"text": "CoinATMRadar",
				"confidence": 0.04511210322380066,
				"position": [4, 16]
			}, {
				"text": "new bitcoin ATM",
				"confidence": 0.03691748529672623,
				"position": [43, 58]
			}, {
				"text": "new bitcoin",
				"confidence": 0.010945784859359264,
				"position": [43, 54]
			}, {
				"text": "bitstopofficial @LamassuBTC",
				"confidence": 0.01017546746879816,
				"position": [63, 90]
			}],
			[{
				"text": "Miami",
				"confidence": 0.8471776247024536,
				"position": [13, 18]
			}, {
				"text": "wynwoodcafe",
				"confidence": 0.09550989419221878,
				"position": [46, 57]
			}, {
				"text": "First BTM",
				"confidence": 0.043609220534563065,
				"position": [0, 9]
			}],
			[{
				"text": "Bitstop",
				"confidence": 0.1991342455148697,
				"position": [29, 36]
			}, {
				"text": "bitcoin",
				"confidence": 0.04299425333738327,
				"position": [46, 53]
			}, {
				"text": "RT @",
				"confidence": 0.017782213166356087,
				"position": [0, 4]
			}, {
				"text": "RT @bitstopofficial",
				"confidence": 0.014109128154814243,
				"position": [0, 19]
			}],
			[],
			[{
				"text": "eruces",
				"confidence": 0.06694933772087097,
				"position": [14, 20]
			}, {
				"text": "retupmoc",
				"confidence": 0.017975449562072754,
				"position": [1, 9]
			}, {
				"text": "eht",
				"confidence": 0.014014927670359612,
				"position": [10, 13]
			}],
			[{
				"text": "awesomeness",
				"confidence": 0.1794039011001587,
				"position": [52, 63]
			}],
			[{
				"text": "TELL US EVERYTHING",
				"confidence": 0.0830259919166565,
				"position": [98, 116]
			}, {
				"text": "US EVERYTHING",
				"confidence": 0.07135952264070511,
				"position": [103, 116]
			}, {
				"text": "ThalmicDev",
				"confidence": 0.045498326420784,
				"position": [1, 11]
			}, {
				"text": "TELL",
				"confidence": 0.03795967251062393,
				"position": [98, 102]
			}, {
				"text": "PLEASE!",
				"confidence": 0.027711372822523117,
				"position": [118, 125]
			}, {
				"text": "EVERYTHING",
				"confidence": 0.01472113560885191,
				"position": [106, 116]
			}, {
				"text": "PLEASE",
				"confidence": 0.014366661198437214,
				"position": [118, 124]
			}],
			[{
				"text": "attdeveloper",
				"confidence": 0.010792968794703484,
				"position": [1, 13]
			}],
			[{
				"text": "leapmotion",
				"confidence": 0.3101259469985962,
				"position": [31, 41]
			}, {
				"text": "devs",
				"confidence": 0.18368420004844666,
				"position": [62, 66]
			}, {
				"text": "leapmotion",
				"confidence": 0.01220938004553318,
				"position": [1, 11]
			}],
			[{
				"text": "BB10Believe",
				"confidence": 0.01732814870774746,
				"position": [69, 80]
			}],
			[{
				"text": "nice",
				"confidence": 0.45687413215637207,
				"position": [88, 92]
			}]
		],
		"sentiment": [0.14037664245921297, 0.3164196509073868, 0.9664673923843579, 0.8337666948490955, 0.5449177397554756, 0.9074327848540709, 0.5706372458875328, 0.8746659836118568, 0.07633844270069493, 0.36066941236175987, 0.6638820254660671, 0.96041208453625, 0.812558825455778, 0.4885676755252121, 0.9740979188139095, 0.9354258685317967, 0.31058486990211964, 0.8538086037210768, 0.7060874727622812, 0.26267473345460673],
		"people": [
			[{
				"text": "Carson",
				"confidence": 0.575975239276886,
				"position": [79, 85]
			}, {
				"text": "Ben Carson",
				"confidence": 0.49414870142936707,
				"position": [75, 85]
			}, {
				"text": "Ben",
				"confidence": 0.04608171433210373,
				"position": [75, 78]
			}, {
				"text": "BernieSanders",
				"confidence": 0.0254899263381958,
				"position": [117, 130]
			}],
			[],
			[],
			[{
				"text": "Bitgo",
				"confidence": 0.5404155254364014,
				"position": [36, 41]
			}, {
				"text": "BitGo",
				"confidence": 0.3632565140724182,
				"position": [1, 6]
			}, {
				"text": "lamassu",
				"confidence": 0.04685608297586441,
				"position": [88, 95]
			}],
			[{
				"text": "Bitstop",
				"confidence": 0.1313447654247284,
				"position": [23, 30]
			}, {
				"text": "rules",
				"confidence": 0.018527954816818237,
				"position": [80, 85]
			}, {
				"text": "Sure",
				"confidence": 0.012537875212728977,
				"position": [9, 13]
			}],
			[{
				"text": "yay",
				"confidence": 0.5716589689254761,
				"position": [0, 3]
			}, {
				"text": "Bitcoin",
				"confidence": 0.019683709368109703,
				"position": [15, 22]
			}],
			[],
			[{
				"text": "#fintech",
				"confidence": 0.04605447128415108,
				"position": [39, 47]
			}, {
				"text": "fintech",
				"confidence": 0.03205431252717972,
				"position": [40, 47]
			}, {
				"text": "blockchain",
				"confidence": 0.028332998976111412,
				"position": [28, 38]
			}, {
				"text": "bitcoin",
				"confidence": 0.019400933757424355,
				"position": [19, 26]
			}, {
				"text": "bitcoin",
				"confidence": 0.011065375059843063,
				"position": [10, 17]
			}, {
				"text": "blockchain #fintech",
				"confidence": 0.010821743868291378,
				"position": [28, 47]
			}],
			[{
				"text": "Phantom",
				"confidence": 0.5392051339149475,
				"position": [20, 27]
			}, {
				"text": "DJIDrones",
				"confidence": 0.1599876582622528,
				"position": [45, 54]
			}, {
				"text": "DJI Phantom",
				"confidence": 0.1495523303747177,
				"position": [16, 27]
			}, {
				"text": "Hope",
				"confidence": 0.02055705152451992,
				"position": [0, 4]
			}],
			[{
				"text": "Buy bitcoin",
				"confidence": 0.2041400969028473,
				"position": [18, 29]
			}, {
				"text": "bitcoin",
				"confidence": 0.1849651038646698,
				"position": [22, 29]
			}, {
				"text": "CoinATMRadar",
				"confidence": 0.14008782804012299,
				"position": [4, 16]
			}, {
				"text": "LamassuBTC",
				"confidence": 0.09928076714277267,
				"position": [80, 90]
			}, {
				"text": "@LamassuBTC",
				"confidence": 0.014728274196386337,
				"position": [79, 90]
			}, {
				"text": "RT @CoinATMRadar",
				"confidence": 0.011123036034405231,
				"position": [0, 16]
			}],
			[{
				"text": "BTM",
				"confidence": 0.01721375063061714,
				"position": [6, 9]
			}],
			[{
				"text": "Bitstop",
				"confidence": 0.029289036989212036,
				"position": [29, 36]
			}],
			[{
				"text": "code",
				"confidence": 0.013208998367190361,
				"position": [6, 10]
			}],
			[{
				"text": "eht eruces",
				"confidence": 0.6044347882270813,
				"position": [10, 20]
			}, {
				"text": "eruces",
				"confidence": 0.13898028433322906,
				"position": [14, 20]
			}, {
				"text": "eht",
				"confidence": 0.03689439594745636,
				"position": [10, 13]
			}, {
				"text": "retupmoc",
				"confidence": 0.023874932900071144,
				"position": [1, 9]
			}],
			[{
				"text": "Book",
				"confidence": 0.02374921925365925,
				"position": [5, 9]
			}],
			[{
				"text": "ThalmicDev",
				"confidence": 0.055626850575208664,
				"position": [1, 11]
			}, {
				"text": "TELL",
				"confidence": 0.047966841608285904,
				"position": [98, 102]
			}, {
				"text": "EVERYTHING",
				"confidence": 0.02528500370681286,
				"position": [106, 116]
			}],
			[],
			[{
				"text": "devs",
				"confidence": 0.10606785118579865,
				"position": [62, 66]
			}, {
				"text": "Rev",
				"confidence": 0.06100069358944893,
				"position": [81, 84]
			}, {
				"text": "leapmotion",
				"confidence": 0.03063386306166649,
				"position": [31, 41]
			}, {
				"text": "Rev",
				"confidence": 0.029726998880505562,
				"position": [72, 75]
			}],
			[{
				"text": "BlackBerry10",
				"confidence": 0.0591418482363224,
				"position": [42, 54]
			}, {
				"text": "BB10Believe",
				"confidence": 0.015204806812107563,
				"position": [69, 80]
			}],
			[{
				"text": "BB10Believe",
				"confidence": 0.08945835381746292,
				"position": [1, 12]
			}]
		],
		"political": [{
			"Libertarian": 0.2628689885091469,
			"Green": 0.048484506748901146,
			"Liberal": 0.21199788591701155,
			"Conservative": 0.4766486188249404
		}, {
			"Libertarian": 0.38027569993670823,
			"Green": 0.1794445864425665,
			"Liberal": 0.4131140622571138,
			"Conservative": 0.027165651363611473
		}, {
			"Libertarian": 0.3579161069960899,
			"Green": 0.22765368295126423,
			"Liberal": 0.322524886426867,
			"Conservative": 0.09190532362577877
		}, {
			"Libertarian": 0.3544778958754424,
			"Green": 0.08499586300252909,
			"Liberal": 0.3548060779394903,
			"Conservative": 0.20572016318253825
		}, {
			"Libertarian": 0.3089584511873273,
			"Green": 0.11434522037253143,
			"Liberal": 0.37209905649806096,
			"Conservative": 0.2045972719420803
		}, {
			"Libertarian": 0.44819266529288915,
			"Green": 0.13441117721206805,
			"Liberal": 0.3572799723217456,
			"Conservative": 0.06011618517329723
		}, {
			"Libertarian": 0.23536084257320028,
			"Green": 0.2397855390989836,
			"Liberal": 0.24898135034942132,
			"Conservative": 0.27587226797839487
		}, {
			"Libertarian": 0.8380582453319028,
			"Green": 0.030233495045735855,
			"Liberal": 0.08197511710272631,
			"Conservative": 0.049733142519635176
		}, {
			"Libertarian": 0.2948084821200364,
			"Liberal": 0.2610123330427559,
			"Green": 0.27583098288573593,
			"Conservative": 0.16834820195147177
		}, {
			"Libertarian": 0.6652057509403679,
			"Green": 0.10298942793959454,
			"Liberal": 0.2042998957409343,
			"Conservative": 0.02750492537910316
		}, {
			"Libertarian": 0.551530422712861,
			"Green": 0.14308452738166452,
			"Liberal": 0.2698743592496257,
			"Conservative": 0.03551069065584872
		}, {
			"Libertarian": 0.7827893514533145,
			"Liberal": 0.08560229881553935,
			"Green": 0.09150873302224069,
			"Conservative": 0.04009961670890553
		}, {
			"Libertarian": 0.3267834008746733,
			"Green": 0.2530787951556212,
			"Liberal": 0.35211809134642114,
			"Conservative": 0.06801971262328448
		}, {
			"Libertarian": 0.3012557448230185,
			"Green": 0.2331939501178818,
			"Liberal": 0.24343096063301545,
			"Conservative": 0.2221193444260843
		}, {
			"Libertarian": 0.35007679157611626,
			"Green": 0.15211852442779508,
			"Liberal": 0.42473424672016363,
			"Conservative": 0.07307043727592502
		}, {
			"Libertarian": 0.13359761839346623,
			"Liberal": 0.06727553333256717,
			"Green": 0.4755679943206931,
			"Conservative": 0.3235588539532734
		}, {
			"Libertarian": 0.14748017958447787,
			"Liberal": 0.319993813691337,
			"Green": 0.44241618598785687,
			"Conservative": 0.0901098207363283
		}, {
			"Libertarian": 0.25824709165070514,
			"Green": 0.15560774995015458,
			"Liberal": 0.2254886450554452,
			"Conservative": 0.3606565133436951
		}, {
			"Libertarian": 0.2497715374855008,
			"Liberal": 0.20678127844965463,
			"Green": 0.3679569774284008,
			"Conservative": 0.1754902066364438
		}, {
			"Libertarian": 0.2879512057254614,
			"Liberal": 0.16769896121606076,
			"Green": 0.3552358031533171,
			"Conservative": 0.18911402990516077
		}],
		"personas": {
			"status": 503,
			"error": "Sorry, all of our servers seem to be busy right now!"
		},
		"personality": [{
			"openness": 0.4158035377475702,
			"extraversion": 0.4952443598185555,
			"agreeableness": 0.4191624982315197,
			"conscientiousness": 0.5285710682129038
		}, {
			"openness": 0.4903465670959971,
			"extraversion": 0.4109757391072937,
			"agreeableness": 0.4812972221458166,
			"conscientiousness": 0.5392866881414391
		}, {
			"openness": 0.5638120608909107,
			"extraversion": 0.4269348877971455,
			"agreeableness": 0.5189210218295716,
			"conscientiousness": 0.46649036530790655
		}, {
			"openness": 0.5432172643247051,
			"extraversion": 0.455862983303555,
			"agreeableness": 0.3614468035990731,
			"conscientiousness": 0.46231655314050873
		}, {
			"openness": 0.5911274552345275,
			"extraversion": 0.5248577316938821,
			"agreeableness": 0.5115785483728374,
			"conscientiousness": 0.4878532448034177
		}, {
			"openness": 0.6169117026239911,
			"extraversion": 0.536519164756193,
			"agreeableness": 0.3883860895508214,
			"conscientiousness": 0.4955547671208436
		}, {
			"openness": 0.4987453843388601,
			"extraversion": 0.40482840800689435,
			"agreeableness": 0.49130568640273903,
			"conscientiousness": 0.5361141096586468
		}, {
			"openness": 0.7954789124359593,
			"extraversion": 0.4606432348994886,
			"agreeableness": 0.29874145304947564,
			"conscientiousness": 0.4337822565402108
		}, {
			"openness": 0.5099968734745667,
			"extraversion": 0.43155428262080175,
			"agreeableness": 0.3827636864101677,
			"conscientiousness": 0.5216913065691104
		}, {
			"openness": 0.6543454327315926,
			"extraversion": 0.46751607373609383,
			"agreeableness": 0.33790831084836986,
			"conscientiousness": 0.5029975306028607
		}, {
			"openness": 0.60849073334275,
			"extraversion": 0.489216433238175,
			"agreeableness": 0.35510182798954476,
			"conscientiousness": 0.505314617321409
		}, {
			"openness": 0.6175254132146032,
			"extraversion": 0.5478664550740842,
			"agreeableness": 0.4398023716190404,
			"conscientiousness": 0.4912796188359973
		}, {
			"openness": 0.5495973772534701,
			"extraversion": 0.4151528063466994,
			"agreeableness": 0.4645342319680933,
			"conscientiousness": 0.4751412906180853
		}, {
			"openness": 0.43843729000225246,
			"extraversion": 0.4615455133430029,
			"agreeableness": 0.490474230887597,
			"conscientiousness": 0.5506633348848627
		}, {
			"openness": 0.5580468901963991,
			"extraversion": 0.4849927167771227,
			"agreeableness": 0.5188108598976805,
			"conscientiousness": 0.49161728874020194
		}, {
			"openness": 0.5590342149556239,
			"extraversion": 0.4874249312837246,
			"agreeableness": 0.4642569370437086,
			"conscientiousness": 0.5027258450957551
		}, {
			"openness": 0.4481271591699012,
			"extraversion": 0.3886491749751366,
			"agreeableness": 0.409735701063223,
			"conscientiousness": 0.5440068597766174
		}, {
			"openness": 0.5252439666574246,
			"extraversion": 0.4044685666843996,
			"agreeableness": 0.40757969335505834,
			"conscientiousness": 0.5335729934018234
		}, {
			"openness": 0.4868729947326339,
			"extraversion": 0.49575573256460276,
			"agreeableness": 0.5340385212187181,
			"conscientiousness": 0.5035047976449988
		}, {
			"openness": 0.5313271729745597,
			"extraversion": 0.5271305313049737,
			"agreeableness": 0.5966176212879648,
			"conscientiousness": 0.4590678081430237
		}]
	}
}*/
