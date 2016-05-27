/**
 * MachineController
 *
 * @description :: Server-side logic for managing machines
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

	analyze: function (req, res) {
		res.send('{"status":200, "handle":"' + req.body.twitter_handle + '"}')
	}

};
