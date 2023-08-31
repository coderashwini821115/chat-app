const mongoose = require('mongoose');

mongoose.connect("mongodb://127.0.0.1:27017", {
    dbName: "Backend",
}).then(() => console.log("Database connected"));
const schema = new mongoose.Schema({
    username: {type: String, unique: true, sparse: true},
    password: String,
}, {timestamps: true});

const Model = mongoose.model("ChatApp", schema);
module.exports = Model;
