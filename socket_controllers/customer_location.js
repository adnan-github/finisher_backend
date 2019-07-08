var CustomersLocationModel = require('../models/customersLocation');
var ObjectId = require('mongoose').Types.ObjectId;
module.exports = {
    // it will continously update customer location via socket.io
    updateCustomerLocation: ( payload, _id ) => {
        var latitude = parseFloat(payload.geometry.lat);
        var longitude = parseFloat(payload.geometry.lng);
        CustomersLocationModel.findOneAndUpdate({ customer_id: ObjectId(payload.customer_id) }, {
            address     : payload.address,
            customer_id  : payload.customer_id,
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
    // it will set customer status to disconnected if he is not available
    updateCustomerStatus: ( socketId ) => {

        CustomersLocationModel.findOneAndUpdate({ socketId: socketId }, {
            status: 'disconnected'
        }, { upsert: false }, 
        ( err, doc ) => {
            if(err) {
                return { success: false, message: 'unable to update status' }
            } else {
                return { success: true, message: 'successfully changed the status', data: doc }
            }            
        })
    },
    populateCustomersRecord: async ( id ) => {
        var results = CustomersLocationModel.findOne({ customer_id: id } ).populate('customer_id');
        return results;
    },
    populateCustomerSocketId: async (id) => {
        var results = await CustomersLocationModel.findOne({ customer_id: id });
        return results;
    }
}