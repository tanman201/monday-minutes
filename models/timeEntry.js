const mongoose = require("mongoose");

const TimeEntrySchema = new mongoose.Schema({
	startTime: Number,
    endTime: Number,
    duration: Number,
    itemId: Number,
    user: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        mondayUserId: Number
    }
});

module.exports = mongoose.model("TimeEntry", TimeEntrySchema);