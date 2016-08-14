var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var QuoteSchema = new Schema({
    quote: {type: String, required: true},
    quoter: {type: String, required: true},
    quoter_image: {type: {}, required: true},
    created_at: {type: Date, default: Date.now}
});

module.exports = QuoteSchema;