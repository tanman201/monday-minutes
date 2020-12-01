// Gets time entry with databse id
async function getTimeEntry(timeEntryId){
    const requestRoute = "/timeEntry/" + timeEntryId;
    var timeEntry = await $.getJSON(requestRoute);
    return timeEntry;
}

// Gets all time entries within a certain time frame
// Start time and end time are in seconds based in the JS Date object
async function getTimeEntriesFromFilter(filter){
    const requestRoute = "/timeEntry/";
    var timeEntries = await $.getJSON(requestRoute, filter);
    return timeEntries;
}

// Gets time entries within certain filter parameters
async function getTimeEntries(startTime, endTime){
    const requestRoute = "/timeEntry/" + startTime + "/" + endTime;
    var timeEntries = await $.getJSON(requestRoute);
    return timeEntries;
}

// Gets sorted time entries within a certain time frame
// Start time and end time are in seconds based in the JS Date object
async function getSortedTimeEntries(startTime, endTime){
    const requestRoute = "/timeEntry/" + startTime + "/" + endTime;
    var timeEntries = await $.getJSON(requestRoute);
    return await sortTimeEntries(timeEntries);
}

async function getCurrentTimeEntry(){
    const requestRoute = "/timeEntry/current";
    var timeEntry = await $.getJSON(requestRoute);
    return timeEntry;
}

// Start timer on item
async function startTime(itemId){
    const startRoute = "/timeEntry/" + itemId + "/start";
    const timeEntry = await $.post(startRoute);
    return timeEntry;
}

// Stop timer on item
async function stopTime(itemId){
    const stopRoute = "/timeEntry/" + itemId + "/stop";
    const timeEntry = await $.post(stopRoute);
    return timeEntry;
}

// Edit time Entry 
async function editTimeEntry(timeEntryId, itemId, startTime, duration){
    const editRoute = "/timeEntry/" + timeEntryId;
    const result = await $.ajax({
        url: editRoute,
        type: 'PUT',
        data: {
            itemId: itemId,
            startTime: startTime,
            duration: duration
        },
        success: function(result) {
            // console.log("EDITED TIME ENTRY ")
        }
    });
    return result;
}

// Delete time Entry on item
async function deleteTimeEntry(timeEntryId){
    const deleteRoute = "/timeEntry/" + timeEntryId;
    const result = await $.ajax({
        url: deleteRoute,
        type: 'DELETE',
        success: function(result) {
            // console.log("DELETED TIME ENTRY ")
        }
    });
    return result;
}

// HELPER FUNCTIONS //

// Sorts time entries into days and parses times into Strings
async function sortTimeEntries(timeEntries){
    // Sort passed in timeEntries by start time
    timeEntries.sort(function(timeEntry1, timeEntry2){
        return timeEntry2.startTime - timeEntry1.startTime;
    });

    // Go through time entries and sort them by day
    var sortedTimeEntries = [];
    var itemIds = await getItems();

    for(let i = 0; i < timeEntries.length; i++){
        var timeEntry = timeEntries[i];
        var itemAtrributes = itemIds.find(element => parseInt(element.id) === timeEntry.itemId);
        timeEntry.attributes = itemAtrributes;
        // Don't parse current running tasks. Current running tasks have a negative duration.
        if(timeEntry.duration < 0){
            continue;
        }
        // Check if date group already exists for this timeEntry
        var timeEntryStartObj = new Date(timeEntry.startTime*1000);
        var timeEntryStartStr = getDateString(timeEntryStartObj);
        var foundDate = false;
        var foundDateIdx = 0;
        for(let j = 0; j < sortedTimeEntries.length; j++){
            if(timeEntryStartStr === sortedTimeEntries[j].timeEntryStartStr){
                foundDate = true;
                foundDateIdx = j;
                break;
            }
        }
        if(!foundDate){
            sortedTimeEntries.push({timeEntryStartStr: timeEntryStartStr,
                                    totalTimeSec: 0,
                                    totalTimeStr: "0:00 min",
                                    timeEntryGroups: []});
            foundDateIdx = sortedTimeEntries.length -1;
        }
        // Check if item Id time Entry already exists for this day
        var timeEntryItemId = timeEntry.itemId;
        var timeEntryGroups = sortedTimeEntries[foundDateIdx].timeEntryGroups;
        var foundItemId = false;
        var foundItemIdIdx = 0;
        for(let j = 0; j < timeEntryGroups.length; j++){
            if(timeEntryItemId === timeEntryGroups[j].itemId){
                foundItemId = true;
                foundItemIdIdx = j;
                break;
            }
        }
        if(!foundItemId){
            timeEntryGroups.push({itemId: timeEntryItemId,
                                  itemName: timeEntry.attributes.name,
                                  totalTimeSec: 0,
                                  totalTimeStr: "0:00:00",
                                  parentBoardName: timeEntry.attributes.board.name,
                                  parentGroupName: timeEntry.attributes.group.title,
                                  parentGroupColor: timeEntry.attributes.group.color,
                                  timeEntries: []});
            foundItemIdIdx = timeEntryGroups.length -1;
        }
        // Add time entry
        var durationSec = timeEntry.duration;
        timeEntry.totalTimeStr = convertSecondsToTimeEntryTotalTimeStr(durationSec);
        sortedTimeEntries[foundDateIdx].totalTimeSec += durationSec;
        sortedTimeEntries[foundDateIdx].totalTimeStr = convertSecondsToDateTotalTimeStr(sortedTimeEntries[foundDateIdx].totalTimeSec);
        sortedTimeEntries[foundDateIdx].timeEntryGroups[foundItemIdIdx].totalTimeSec += durationSec;
        sortedTimeEntries[foundDateIdx].timeEntryGroups[foundItemIdIdx].totalTimeStr = convertSecondsToTimeEntryTotalTimeStr(sortedTimeEntries[foundDateIdx].timeEntryGroups[foundItemIdIdx].totalTimeSec);
        sortedTimeEntries[foundDateIdx].timeEntryGroups[foundItemIdIdx].timeEntries.push(timeEntry);
    }
    return sortedTimeEntries;
}

// Check if two dates (day, month, year) are equal
function datesEqual(date1, date2){
    return date1.getDate() == date2.getDate() &&
    date1.getMonth() == date2.getMonth() &&
    date1.getFullYear() == date2.getFullYear();
}

function getDateString(date){
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if(datesEqual(date, today)){
        return "Today";
    }else if(datesEqual(date, yesterday)){
        return "Yesterday";
    }else{
        return weekDays[date.getDay()] + ", " + date.getDate() + " " + months[date.getMonth()];
    }
}

// Seconds to Date Time String converter
function convertSecondsToDateTotalTimeStr(seconds){
    var hours = Math.floor(seconds / (60 * 60));
    var minutes = Math.floor((seconds % (60 * 60)) / (60));
    return hours.toString().padStart(2, '0') + " h " + minutes.toString().padStart(2, '0') + " min";
}

// Seconds to Time Entry String converter
function convertSecondsToTimeEntryTotalTimeStr(seconds){
    var hours = Math.floor(seconds / (60 * 60));
    var minutes = Math.floor((seconds % (60 * 60)) / (60));
    var seconds = Math.floor(seconds % 60);
    return hours.toString().padStart(2, '0') + ":" + minutes.toString().padStart(2, '0') + ":" + seconds.toString().padStart(2, '0');
}

function convertSecondsToMilitaryTime(seconds){
    const date = new Date(seconds*1000);
    return date.getHours().toString().padStart(2, '0') + ":" + date.getMinutes().toString().padStart(2, '0');
}