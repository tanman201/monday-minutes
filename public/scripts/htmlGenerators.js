
// Generates list of cards for time Entries
async function generateTimeEntryHtml(timeEntries){
    var timeEntryListHtml = '';
    var dayIndex = 0;
    var timeGroupIndex = 0;
    var timeEntryIndex = 0;
    timeEntries.forEach(function(timeEntryDate){
        dayIndex++;
        
        // Day Headers
        timeEntryListHtml += '<div class="row justify-content-center time-entry-day">';
        timeEntryListHtml += '<button class="col-12 time-entry-day-header" type="button" data-toggle="collapse" data-target="#day-' + dayIndex + '" aria-expanded="true" aria-controls="collapseExample">';
        timeEntryListHtml += '<div class="d-flex justify-content-between">';
        timeEntryListHtml += '<div class="py-2 time-entry-date-str">' + timeEntryDate.timeEntryStartStr + '</div>';
        timeEntryListHtml += '<div class="py-2 time-entry-date-time">' + timeEntryDate.totalTimeStr + '</div>';
        timeEntryListHtml += '</div>';
        timeEntryListHtml += '</button>';

        timeEntryListHtml += '<div class="row justify-content-center collapse show time-entry-day-body" id="day-' + dayIndex + '">';
        // Column Headers
        timeEntryListHtml += '<div class="col-10 col-md-6 p-0 mb-2 time-entry-column-header"></div>';
        timeEntryListHtml += '<div class="d-none d-md-block col-2 p-0 mb-2 time-entry-column-header">Group</div>';
        timeEntryListHtml += '<div class="d-none d-md-block col-2 p-0 mb-2 time-entry-column-header">Board</div>';
        timeEntryListHtml += '<div class="col-2 col-md-1 p-0 mb-2 time-entry-column-header">Total Time</div>';
        timeEntryListHtml += '<div class="d-none d-md-block col-1 p-0 mb-2 time-entry-column-header">Options</div>';
        timeEntryDate.timeEntryGroups.forEach(function(timeEntryGroup){
            timeGroupIndex++;
            // Time Entry Groups
            timeEntryListHtml += '<div class="row justify-content-center align-items-center time-entry-group">';

            timeEntryListHtml += '<div class="col-10 col-md-6 p-0">';
            timeEntryListHtml += '<div class="d-flex align-items-center time-entry-group-section" style="border-left: 6px solid ' + timeEntryGroup.parentGroupColor + ';">';
            timeEntryListHtml += '<button class="d-flex align-items-center time-entry-group-expand-btn" type="button" data-toggle="collapse" data-target="#time-group-' + timeGroupIndex + '" aria-expanded="false" aria-controls="collapseExample">';
            timeEntryListHtml += '<span class="numberCircle time-entry-group-length" style="color: ' + timeEntryGroup.parentGroupColor + '; border-color: ' + timeEntryGroup.parentGroupColor + ';">' + (timeEntryGroup.timeEntries.length < 1000 ? timeEntryGroup.timeEntries.length : 999) + '</span>';
            timeEntryListHtml += '<span class="time-entry-group-item-name">' + timeEntryGroup.itemName + '</span>';
            timeEntryListHtml += '</button>';
            timeEntryListHtml += '</div>';
            timeEntryListHtml += '</div>';

            timeEntryListHtml += '<div class="d-none d-md-block col-2 p-0">';
            timeEntryListHtml += '<div class="d-none d-md-flex d-lg-flex justify-content-center align-items-center time-entry-group-section">';
            timeEntryListHtml += '<span class="time-entry-group-parent-group" style="color: ' + timeEntryGroup.parentGroupColor + ';">' + timeEntryGroup.parentGroupName + '</span>';
            timeEntryListHtml += '</div>';
            timeEntryListHtml += '</div>';

            timeEntryListHtml += '<div class="d-none d-md-block col-2 p-0">';
            timeEntryListHtml += '<div class="d-none d-md-flex d-lg-flex justify-content-center align-items-center time-entry-group-section">';
            timeEntryListHtml += '<span class="time-entry-group-parent-board">' + timeEntryGroup.parentBoardName + '</span>';
            timeEntryListHtml += '</div>';
            timeEntryListHtml += '</div>';

            timeEntryListHtml += '<div class="col-2 col-md-1 p-0">';
            timeEntryListHtml += '<div class="d-flex justify-content-center align-items-center time-entry-group-section">';
            timeEntryListHtml += '<span class="time-entry-group-total-time">' + timeEntryGroup.totalTimeStr + '</span>';
            timeEntryListHtml += '</div>';
            timeEntryListHtml += '</div>';

            timeEntryListHtml += '<div class="d-none d-md-block col-1 p-0">';
            timeEntryListHtml += '<div class="d-none d-md-flex justify-content-center align-items-center time-entry-group-section">';
            timeEntryListHtml += '<span class="time-entry-group-quick-play" id="quick-play-' + timeEntryGroup.itemId + '"><i class="fas fa-play-circle"></i></span>';
            timeEntryListHtml += '</div>';
            timeEntryListHtml += '</div>';
            
            timeEntryListHtml += '</div>';
            timeEntryListHtml += '<div class="row justify-content-center collapse time-entry-group-body" id="time-group-' + timeGroupIndex + '">';
            timeEntryGroup.timeEntries.forEach(function(timeEntry){
                timeEntryIndex++;
                timeEntryListHtml += '<div class="row justify-content-center align-items-center time-entry">';

                timeEntryListHtml += '<div class="col-10 col-md-6 p-0">';
                timeEntryListHtml += '<div class="d-flex align-items-center time-entry-section">';
                timeEntryListHtml += '<span class="time-entry-item-name">' + timeEntry.attributes.name + '</span>';
                timeEntryListHtml += '</div>';
                timeEntryListHtml += '</div>';
    
                timeEntryListHtml += '<div class="d-none d-md-block col-2 p-0">';
                timeEntryListHtml += '<div class="d-none d-md-flex d-lg-flex justify-content-center align-items-center time-entry-section">';
                timeEntryListHtml += '<span class="time-entry-group-name" style="color: ' + timeEntry.attributes.group.color + ';">' + timeEntry.attributes.group.title + '</span>';
                timeEntryListHtml += '</div>';
                timeEntryListHtml += '</div>';
    
                timeEntryListHtml += '<div class="d-none d-md-block col-2 p-0">';
                timeEntryListHtml += '<div class="d-none d-md-flex d-lg-flex justify-content-center align-items-center time-entry-section">';
                timeEntryListHtml += '<span class="time-entry-board-name">' + timeEntry.attributes.board.name + '</span>';
                timeEntryListHtml += '</div>';
                timeEntryListHtml += '</div>';
    
                timeEntryListHtml += '<div class="col-2 col-md-1 p-0">';
                timeEntryListHtml += '<div class="d-flex justify-content-center align-items-center time-entry-section">';
                timeEntryListHtml += '<span class="time-entry-total-time">' + timeEntry.totalTimeStr + '</span>';
                timeEntryListHtml += '</div>';
                timeEntryListHtml += '</div>';
                
                timeEntryListHtml += '<div class="d-none d-md-block col-1 p-0">';
                timeEntryListHtml += '<div class="d-none d-md-flex d-lg-flex justify-content-around align-items-center time-entry-section">';
                timeEntryListHtml += '<span class="time-entry-edit" id="edit-' + timeEntry._id + '" data-toggle="modal" data-target="#modal-edit-time-entry"><i class="fas fa-edit"></i></span>';
                timeEntryListHtml += '<span class="time-entry-delete" id="delete-' + timeEntry._id + '" data-toggle="modal" data-target="#modal-delete-time-entry"><i class="fas fa-trash-alt"></i></span>';
                timeEntryListHtml += '</div>';
                timeEntryListHtml += '</div>';
                
                timeEntryListHtml += '</div>';
            });
            timeEntryListHtml += '</div>';
        });
        timeEntryListHtml += '</div>';
        timeEntryListHtml += '</div>';
    });
    return timeEntryListHtml;
}

// Generates list of cards for time Entries
async function generateReportChart(reportGroupData){
    var reportChartHtml = '';

    for (let reportGroupId in reportGroupData) {
        const reportGroup = reportGroupData[reportGroupId];
        // Overall Time Header
        reportChartHtml += '<div class="row" style="border-left: 6px solid ' + reportGroup.color + ';">';
        reportChartHtml += '<div class="col-8 col-md-10 col-xl-11 p-0">';
        reportChartHtml += '<div class="d-flex justify-content-start align-items-center time-entry-group-section">';
        reportChartHtml += '<span class="numberCircle time-entry-group-length" style="color: ' + reportGroup.color + '; border-color: ' + reportGroup.color + ';">' + (reportGroup.timeEntries.length < 1000 ? reportGroup.timeEntries.length : 999) + '</span>';
        reportChartHtml += '<div class="ml-3">' + reportGroup.label + '</div>';
        reportChartHtml += '</div>';
        reportChartHtml += '</div>';
        reportChartHtml += '<div class="col-4 col-md-2 col-xl-1 p-0">';
        reportChartHtml += '<div class="d-flex justify-content-center align-items-center time-entry-group-section">';
        reportChartHtml += '<div class="">' + convertSecondsToDateTotalTimeStr(reportGroup.totalTime) + '</div>';
        reportChartHtml += '</div>';
        reportChartHtml += '</div>';
        reportChartHtml += '</div>';
    };
    
    return reportChartHtml;
}

// unused tooltip code
//data-toggle="tooltip" data-placement="top" title="Quickplay" data-delay=\'{"show":"300", "hide":"100"}\'