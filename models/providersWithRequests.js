// requirements
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const providersWithRequestSchema = new Schema({
    providerId: {
        type: Schema.Types.ObjectId,
        required: true,
        unique: true
    }
}, {
    timestamps: true
});

providersWithRequestSchema.index({createdAt: 1},{expireAfterSeconds: 30});

const providersWithRequestModel = mongoose.model('requestedProviders', providersWithRequestSchema);

module.exports = providersWithRequestModel;
