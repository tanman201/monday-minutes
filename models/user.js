const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
	mondayUserId: Number,
    togglApiToken: String
});

module.exports = mongoose.model("User", UserSchema);