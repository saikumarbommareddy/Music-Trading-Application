const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const saveSchema = new Schema({
  Name: { type: String, required: [true, "Name cannot be empty"] },
  Singer: { type: String, required: [true, "Singer cannot be empty"] },
  SavedBy: { type: Schema.Types.ObjectId, ref: "User" },
  Status: { type: String },
});

const saveItem = mongoose.model("wishlist", saveSchema);

module.exports = saveItem;
