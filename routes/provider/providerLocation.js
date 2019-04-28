var express     = require('express');
var bodyParser  = require('body-parser');

// custom modules
var providerLocationModel   = require('../../models/providersLocation');
var authenticate    = require('../../middlewares/provider_passport');

// provider Location route settings
var providerLocationRouter = express.Router();
providerLocationRouter.use(bodyParser.json());

//get nearby providers

providerLocationRouter.get("/providerLocation", function(req, res, next){
	providerLocationModel.find({
			"coordinate":{
				"$near":{
					"$geometry":{
						"type":"Point",
						"coordinates": [ parseFloat(req.query.longitude), parseFloat(req.query.latitude) ]
					},
					"$maxDistance":20000
				}
			}
		}, function(err, location){
			if(err){
				res.send(err);
			}else{
				res.send(location);
			}
	});
});


//Get Single provider and emit track by customer to provider

providerLocationRouter.get("/providerLocation/:id", function(req, res, next){
	var io = req.app.io;
    providerLocationModel.findOne({providerId: req.params.id},function(err, location){
        if (err){
            res.json({ success: false, message: 'unable to get providers location', error: err});
        }
        res.json({ success: true, message: 'provider location got successfully', data: location})
    });
});


module.exports = providerLocationRouter;