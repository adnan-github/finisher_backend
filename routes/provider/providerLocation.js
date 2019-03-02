// requirements for user model
var express     = require('express');
var bodyParser  = require('body-parser');

// custom modules
var providerLocationModel   = require('../../models/providersLocation');
var Validate      = require('../../validators/userValidation');
var authenticate = require('../../middlewares/provider_passport');

// user route settings
var providerLocationRouter = express.Router();
providerLocationRouter.use(bodyParser.json());



providerLocationRouter.put("/providerLocationSocket/:id", function(req, res, next){
	var io = req.app.io;
	if(!req.body){
		res.status(400);
		res.json({
			"error":"Bad data"
		});
	}else{
		providerLocationModel.update({_id: req.params.id}, 
			{$set: {socketId:req.body.socketId}}, function(err, updateDetails){
				if(err){
					res.send(err);
				}else{
					res.send(updateDetails);
				}
        });
    }
});

//get nearby providers

providerLocationRouter.get("/providerLocation", function(req, res, next){
	providerLocationModel.ensureIndex({"coordinate":"2dsphere"});
	providerLocationModel.find({
			"coordinate":{
				"$near":{
					"$geometry":{
						"type":"Point",
						"coordinates": [parseFloat(req.query.longitude), parseFloat(req.query.latitude)]
					},
					"$maxDistance":10000
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


//Get Single provider and emit track by user to provider

providerLocationRouter.get("/providerLocation/:id", function(req, res, next){
	var io = req.app.io;
    providerLocationModel.findOne({providerId: req.params.id},function(err, location){
        if (err){
            res.send(err);
        }
        res.send(location);
        io.emit("provider", location);
    });
});

//Update Location by provider to user
providerLocationRouter.put("/providerLocation/:id", function(req, res, next){
    var io = req.app.io;
    var location = req.body;
    var latitude = parseFloat(location.latitude);
    var longitude = parseFloat(location.longitude);
    if (!location){
        res.status(400);
        res.json({
            "error":"Bad Data"
        });
    } else {
        providerLocationModel.update({_id: (req.params.id)},{ $set: {
        	socketId:location.socketId,
        	coordinate:{
                "type": "Point",
        		coordinates:[
                    longitude,
        			latitude
    			]
    		}
    	}}, function(err, updateDetails){
        if (err){
            console.log(updateDetails);
            res.send(err);
        }
        if (updateDetails){

            //Get updated location
            providerLocationModel.findOne({_id: (req.params.id)},function(error, updatedLocation){
                if (error){
                    res.send(error);
                }
                res.send(updatedLocation);
                io.emit("action", {
                    type:"UPDATE_PROVIDER_LOCATION",
                    payload:updatedLocation
                });
            });
        }
    });
    }
});

module.exports = providerLocationRouter;