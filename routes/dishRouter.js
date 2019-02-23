// dependencies
const express       = require('express');
const bodyParser    = require('body-parser');
const Dishes        = require('../models/dishesmodel');
const authenticate  = require('../middlewares/user_passport');

// constants 
const dishRouter = express.Router();
dishRouter.use(bodyParser.json());

dishRouter.route('/', (req, res, next) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.statusMessage = 'dishes route';
        next();
    })
    .get(authenticate.verifyUser, (req, res, next) => {
        Dishes.find({}).then((result)=>{
            console.log("no result found");
        }, (err)=>{
            console.log(err);
        });
        res.statusCode = 200;
        res.end('You will get all dishes info');
    })
    .post((req, res, next) => {
        Dishes.create(req.body)
        .then((result) => {
            console.log(result);
        }, (err) => console.log(err))
        .catch((err) => console.log(err));
        res.statusCode = 403;
        res.end('post operation is not allowed without ID');
    });

// Endpoints that use dishes id
dishRouter.route('/:dishId', (req, res, next) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.statusMessage = 'dishes route';
        next();
    })
    .post((req, res, next) => {
        res.statusCode = 200;
        console.log(req.body);
        res.write('you have posted information for dishId ' + req.params.dishId);
        res.end(' Info posted for dish with name ' + req.body.name + ' and description ' + req.body.description);
    })
    .put((req, res, next) => {
        Dishes.findByIdAndUpdate(req.params.dishId, {
            $set : req.body
        }, {new : true}).then((result) => {
            res.json(result);
            console.log(result);
        }, (err)=> { console.log(err); }).catch( (err) => console.log(err));
    })
    .delete((req, res, next) => {
        res.end('deleted dish with id ' + req.params.dishId);
    });


module.exports = dishRouter;