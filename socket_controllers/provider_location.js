var ProvidersLocationModel = require('../models/providersLocation');
var ObjectId = require('mongoose').Types.ObjectId;
module.exports = {
    // it will continously update provider location via socket.io
    updateProviderLocation: ( payload, _id ) => {

        console.log(payload.providerId, _id )
        var latitude = parseFloat(payload.location.coords.latitude);
        var longitude = parseFloat(payload.location.coords.longitude);
        ProvidersLocationModel.findOneAndUpdate({ providerId: ObjectId(payload.providerId) }, {
            providerId  : payload.providerId,
            socketId    : _id,
            status      : 'connected',
            coordinate  : {
                            "type"      :   "Point",
        		            coordinates :   [ longitude, latitude ]
    		              }
        }, { upsert: true }, 
        ( err, doc ) => {
            if( err ){
                return err;
            } else {
                return doc;
            }
        })
    },
    // it will set provider status to disconnected if he is not available
    updateProviderStatus: ( socketId ) => {

        ProvidersLocationModel.findOneAndUpdate({ socketId: socketId }, {
            status: 'disconnected'
        }, { upsert: false }, 
        ( err, doc ) => {
            if(err) {
                return { success: false, message: 'unable to update status' }
            } else {
                return { success: true, message: 'successfully changed the status', data: doc }
            }            
        })
    }
}