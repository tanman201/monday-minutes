var express = require("express");
var router = express.Router();
var TimeEntry = require("../models/timeEntry");
var middleware = require("../middlewares/authentication");

// GET ROUTE - get currently running time
router.get("/current", middleware.authenticate, function (req, res) {
    try {
        var user = req.session.user;
        // Get all time entries within start and end time
        var timeEntryFilter = {
            'user.mondayUserId': req.session.user.mondayUserId,
            endTime: 0
        }
        TimeEntry.findOne(timeEntryFilter, function (err, timeEntry) {
            if (err) {
                console.log(err);
            } else {
                res.json(timeEntry);
            }
        })
    } catch (err) {
        console.log("Error during the get current route ", err);
    }
});

// GET ROUTE - get time entry with certain id
router.get("/:id", middleware.authenticate, function (req, res) {
    try {
        TimeEntry.findById(req.params.id, function (err, foundTimeEntry) {
            if (err) {
                console.log("TODO ERROR FINDING TIME ENTRY");
                res.send("FAILED TO FIND TIME ENTRY");
            } else {
                res.send(foundTimeEntry);
            }
        });
    } catch (err) {
        console.log("Error during the get with id route ", err);
    }
});

// GET ROUTE - get all time entries between start and end time
router.get("/:startTime/:endTime", middleware.authenticate, function (req, res) {
    try {
        var user = req.session.user;
        // Get all time entries within start and end time
        var timeEntryFilter = {
            'user.mondayUserId': req.session.user.mondayUserId,
            startTime: { $gte: parseInt(req.params.startTime) },
            endTime: { $lte: parseInt(req.params.endTime) }
        }
        TimeEntry.find(timeEntryFilter, function (err, timeEntries) {
            if (err) {
                console.log(err);
            } else {
                res.json(timeEntries);
            }
        })
    } catch (err) {
        console.log("Error during the get start time/end time route ", err);
    }
});

// GET ROUTE - get all time entries from passed in filter
router.get("/", middleware.authenticate, function (req, res) {
    try {
        var user = req.session.user;
        // Get all time entries within start and end time
        var timeEntryFilter = {
            'user.mondayUserId': req.query.mondayUserId.map(Number),
            startTime: { $gte: parseInt(req.query.startTime) },
            endTime: { $lte: parseInt(req.query.endTime), $gt: 0 }
        }
        if (req.query.itemId) {
            timeEntryFilter.itemId = req.query.itemId.map(Number);
        }

        TimeEntry.find(timeEntryFilter, function (err, timeEntries) {
            if (err) {
                console.log(err);
            } else {
                res.json(timeEntries);
            }
        })
    } catch (err) {
        console.log("Error during the get with filter route ", err);
    }
});

// CREATE ROUTE - save a time entry
router.post("/:id/:startTime/:endTime", middleware.authenticate, function (req, res) {
    try {
        var newTimeEntry = {
            startTime: parseInt(req.params.startTime),
            endTime: parseInt(req.params.endTime),
            duration: parseInt(req.params.startTime) - parseInt(req.params.endTime),
            itemId: parseInt(req.params.id),
            user: {
                id: req.session.user._id,
                mondayUserId: req.session.user.mondayUserId
            }
        };
        TimeEntry.create(newTimeEntry, function (err, timeEntry) {
            if (err) {
                console.log(err);
            } else {
                res.json(timeEntry);
            }
        });
    } catch (err) {
        console.log("Error during the create route ", err);
    }
});

// START ROUTE - start a time entry
router.post("/:id/start/", middleware.authenticate, function (req, res) {
    try {
        var startTime = Math.floor(Date.now() / 1000);
        var endTime = 0;
        var newTimeEntry = {
            startTime: parseInt(startTime),
            endTime: parseInt(endTime),
            duration: parseInt(endTime) - parseInt(startTime),
            itemId: parseInt(req.params.id),
            user: {
                id: req.session.user._id,
                mondayUserId: req.session.user.mondayUserId
            }
        };
        TimeEntry.create(newTimeEntry, function (err, timeEntry) {
            if (err) {
                console.log(err);
            } else {
                res.json(timeEntry);
            }
        });
    } catch (err) {
        console.log("Error during the start route ", err);
    }
});

// STOP ROUTE - stop a time entry
router.post("/:id/stop", middleware.authenticate, function (req, res) {
    try {
        var itemFilter = {
            'user.mondayUserId': req.session.user.mondayUserId,
            itemId: parseInt(req.params.id),
            endTime: 0
        }
        TimeEntry.findOne(itemFilter, function (err, timeEntry) {
            if (err) {
                console.log(err);
            } else {
                if (timeEntry) {
                    timeEntry.endTime = Math.floor(Date.now() / 1000);
                    timeEntry.duration = timeEntry.endTime - timeEntry.startTime;
                    timeEntry.save();
                    res.json(timeEntry);
                } else {
                    console.log("TODO NO TIME ENTRY TO STOP");
                }
            }
        });
    } catch (err) {
        console.log("Error during the stop route ", err);
    }
});

// UPDATE ROUTE - update a time entry
router.put("/:id", middleware.authenticate, function (req, res) {
    try {
        // Find and update the correct time entry
        // redirect to the show page
        const editedTimeEntry = {
            itemId: parseInt(req.body.itemId),
            startTime: parseInt(req.body.startTime),
            endTime: parseInt(req.body.startTime) + parseInt(req.body.duration),
            duration: parseInt(req.body.duration),
        }
        TimeEntry.findByIdAndUpdate(req.params.id, editedTimeEntry, function (err, updatedTimeEntry) {
            if (err) {
                console.log("FAILED TO UPDATE TIME ENTRY ", err);
                res.send("FAILED TO UPDATE TIME ENTRY");
            } else {
                res.send(updatedTimeEntry)
            }
        });
    } catch (err) {
        console.log("Error during the update route ", err);
    }
});

// DESTROY ROUTE - delete a time entry
router.delete("/:id", middleware.authenticate, function (req, res) {
    try {
        TimeEntry.findByIdAndRemove(req.params.id, function (err) {
            if (err) {
                console.log("TODO ERROR DELETING TIME ENTRY");
                res.send("FAILED DELETED TIME ENTRY");
            } else {
                res.send("DELETED TIME ENTRY");
            }
        });
    } catch (err) {
        console.log("Error during the delete route ", err);
    }
});

module.exports = router;
