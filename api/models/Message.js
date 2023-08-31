const mongoose = require('mongoose');

mongoose.connect("mongodb://127.0.0.1:27017", {
    dbName: "Backend",
}).then(() => console.log("Message Database connected"));
const schema = new mongoose.Schema({
    sender: {type: mongoose.Schema.Types.ObjectId, ref: 'db'},
    recipient: {type: mongoose.Schema.Types.ObjectId, ref: 'db'},
    text: String,
    file: String,
}, {timestamps: true});

const MessageModel = mongoose.model("Message", schema);
module.exports = MessageModel;
