const mongoose = require('mongoose');
const DB = 'mongodb+srv://pandeyash27:GkgHgurDKoxOwGva@cluster0.xkmpvwp.mongodb.net/?retryWrites=true&w=majority';
mongoose.connect(DB, {
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
