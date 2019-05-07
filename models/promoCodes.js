// requirements
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const promoCodesSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Name of the Promo code should be mentioned']
    },
    code: {
        type: String,
        required: [true, 'Code of Promo Code is not provided'],
        unique: true
    },
    discount_type: {
        type: String,
        required: [true, 'Discount Type should be provided']
    },
    discount_amount: {
        type: String,
        required: [true, 'Discount Amount should be provided for the Promo Code']
    },
    start_date: {
        type: Date,
        required: [true, 'Promo Code starting date should be provided'],
        min: Date.now(),
        default: Date.now()
    },
    expiration_date: {
        type: Date,
        required: [true, 'Promo Code expiration date should be provided']
    },
    max_discount: {
        type: Number
    }
}, {
        timestamps: true
    });

promoCodesSchema.methods.returnFinalPrice = async function (code, total_amount) {
    let final_price = 0,
        discount_amount = 0,
        promo = await this.model('promocodes').findOne({ code: new RegExp(code, 'i') }).select("max_discount discount_type discount_amount promo_code").lean();
    if (promo.discount_type == 'fixed') {
        final_price = total_amount - Number(promo.discount_amount);
        return final_price;
    } else {
        let percentage_amount = promo.discount_amount.split('%')[0];
        discount_amount = (Number(percentage_amount) / 100) * total_amount;
        if (discount_amount > promo.max_discount) {
            return final_price = total_amount - promo.max_discount;
        } else {
            return final_price = total_amount - discount_amount;
        }
    }
};
const promoCodesModel = mongoose.model('promocodes', promoCodesSchema);

module.exports = promoCodesModel;