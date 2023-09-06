const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tradeSchema = new Schema(
{
    name: {type: String, required: [true, 'title is required']},
    author: {type: Schema.Types.ObjectId, ref:'User'},
    genre: {type: String, required: [true, 'genre is required']},
    details: {type: String, required: [true, 'details required'], minLength: [10, 'the details should at least have 10 characters']},
    year: {type: Date, required: [true, 'release year is required']},
    singer: {type: String, required: [true, 'Singer Title is required']},
    status: {type:String, required: [true,'Status is required'],enum:['Available','Offer pending','Traded']},
    offerName: { type:String },
    Offered:{type:Boolean},
    Watchlist: { type: Boolean },
},
{timestamps: true}
);

module.exports = mongoose.model('trades',tradeSchema);