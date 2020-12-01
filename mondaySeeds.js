var mongoose = require("mongoose");
var User = require("./models/user");
var TimeEntry = require("./models/timeEntry");

var userIds = [17051326, 17413831, 17413911, 17413942]
var days = 365;
var itemIds= [841989603, 841989604, 841989605, 841989606, 841989607, 882367678, 869431353,
    869431357, 869431359, 869431361, 869431362, 869431566, 869431568, 869431570];

function getRandomIndex(length) {
    return Math.floor(Math.random() * Math.floor(length));
}

async function generateTimeEntries() {
    console.log("Seeding Database");
    // Remove all users
    await User.deleteMany({}).exec();
    // Remove all time entries
    await TimeEntry.deleteMany({}).exec();

    const today = Date.now();
    // Make time entries for every userId in userId list above
    for (let i = 0; i < userIds.length; i++) {
        const mondayUserId = userIds[i];

        // Check if User doc exists and create one if not
        const user = await User.findOne({mondayUserId: mondayUserId}).exec();
        var dbId = undefined;
        if(user){
            dbId = user._id;
        }else{
            const newUser = new User({
                mondayUserId: mondayUserId
            })
            await newUser.save();
            dbId = newUser._id;
        }

        // For every day, make 8 hour long time entries starting at 8 AM
        for(let day = 0; day < days; day++) {
            var generatedDayMs = today - (day * 24 * 60 * 60 * 1000); // Subtract day in milliseconds
            var generatedDay = new Date(generatedDayMs);
            for (let hour = 0; hour < 8; hour++) {
                var startDay = new Date(Date.UTC(generatedDay.getFullYear(), generatedDay.getMonth(), generatedDay.getDate(), 8, 0, 0));
                var startHour = new Date(startDay.getTime() + hour * 60 * 60 * 1000);
                var itemId = itemIds[getRandomIndex(itemIds.length)];
                var timeEntry = {
                    startTime: startHour.getTime()/1000,
                    endTime: startHour.getTime()/1000 + 60*60,
                    duration: 60*60,
                    itemId: itemId,
                    user: {
                        id: dbId,
                        mondayUserId: mondayUserId
                    }
                };
                const newTimeEntry = new TimeEntry(timeEntry);
                await newTimeEntry.save();
            }
        }
    }
    console.log("Done Seeding Database");
}

module.exports = generateTimeEntries;