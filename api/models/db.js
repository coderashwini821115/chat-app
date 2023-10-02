const mongoose = require('mongoose');
const DB = 'mongodb+srv://pandeyash27:GkgHgurDKoxOwGva@cluster0.xkmpvwp.mongodb.net/?retryWrites=true&w=majority';
mongoose.connect(DB, {
    dbName: "Backend",
}).then(() => console.log("Database connected"))
.catch((e) => console.log('no connection'));
const schema = new mongoose.Schema({
    username: {type: String, unique: true, sparse: true},
    password: String,
}, {timestamps: true});

const Model = mongoose.model("ChatApp", schema);
module.exports = Model;
