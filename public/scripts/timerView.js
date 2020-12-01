// Update variables every so often to not make too many monday queries on DOM updates
var globalData = undefined;
setInterval(function () {
    updateData();
}, 30000);

async function updateData() {
    globalData = await getBoardsItemsAndGroups();
}

function editDateCallback(editDate) {
    $('#start-date-edit span').html(editDate.format('MMMM D, YYYY'));
    globalEditDate = editDate;
}

var globalEditDate = moment();

$('#start-date-edit').daterangepicker({
    "singleDatePicker": true,
    "startDate": "11/23/2020",
    "opens": "center",
    "applyButtonClasses": "monday-primary-btn",
    "cancelButtonClasses": "monday-tertiary-btn"
}, editDateCallback);

editDateCallback(globalEditDate);

// Variables for updating timer duration while running
var timeDurationUpdateFunc = undefined;
var timeDuration = 0;

/*** TIMER TAB INIT AND LOAD FUNCTION ***/
// This function will load the timer tab with no information given
async function initTimerTab() {
    globalData = await getBoardsItemsAndGroups();
    const currentTimeEntry = await getCurrentTimeEntry();
    if (currentTimeEntry) {
        // Load Running Task Bar if there is a current time entry running
        await loadRunningTimerBar(currentTimeEntry);
    } else {
        // If no task is running autoload first found item on first found board as selected
        if (globalData.boards.length < 1) {
            // console.log("TODO: YOU DONT HAVE ANY BOARDS")
        } else {
            var selectedItem = undefined;
            var selectedBoard = undefined;
            for (const boardId in globalData.boards) {
                if (globalData.boards[boardId].items.length > 0) {
                    selectedBoard = globalData.boards[boardId];
                    selectedItem = globalData.boards[boardId].items[0];
                    break;
                }
            }
            if (selectedItem === undefined) {
                // console.log("TODO: YOU DONT HAVE ANY ITEMS")
            } else {
                await loadPausedTimerBar(selectedBoard, selectedItem);
            }
        }
    }
    await loadTimerEntries();
}

// This function can be called to intialize the full timer tab with specific information
async function loadTimerTab(itemId, running, hourMode) {
    // if(running){

    // }else{
    //     loadRunningTmeBar
    // }
}

/******************** DOM SPECIFIC HTML LOADING ********************/

/********** PAUSED ITEM BAR ***********/

// Needs selected board ID, selected board Name and list of all board id's and name's
async function loadPausedTimerBoardSelect(selectedBoardId, selectedBoardName, boards) {
    // Change selected board value
    $("#board-select").val(selectedBoardId);
    $("#board-select").text(selectedBoardName);

    // Generate board options
    var boardOptionsHtml = '';
    for (const boardId in boards) {
        if (boards[boardId].id === selectedBoardId) {
            boardOptionsHtml += '<button class="dropdown-item monday-dropdown-menu-item active dropdown-board-option" value="' + boards[boardId].id + '">' + boards[boardId].name + '</button>';
        } else {
            boardOptionsHtml += '<button class="dropdown-item monday-dropdown-menu-item dropdown-board-option" value="' + boards[boardId].id + '">' + boards[boardId].name + '</button>';
        }
    }
    $("#board-options").html(boardOptionsHtml);

    // Add callback to board select options
    $('.dropdown-board-option').each(function (index) {
        $(this).click(function () {
            boardOptionBtnClick($(this).val());
        });
    });
}

// Needs selected item ID, selected item Name and a list of groups with their child items
async function loadPausedTimerItemSelect(selectedItemId, selectedItemName, groups) {
    // Generate selected item value
    $("#item-select").val(selectedItemId);
    $("#item-select").text(selectedItemName);

    // Gerneate item options
    var itemOptionsHtml = '';
    const groupIds = Object.keys(groups);
    for (let i = 0; i < groupIds.length; i++) {
        const groupId = groupIds[i];
        const group = groups[groupId];
        itemOptionsHtml += '<h6 class="dropdown-header monday-dropdown-menu-header" style="color: ' + group.color + ';">' + group.title + '</h6>';
        group.items.forEach(function (item) {
            if (item.id === selectedItemId) {
                itemOptionsHtml += '<button class="dropdown-item monday-dropdown-menu-item active dropdown-item-option" value="' + item.id + '">' + item.name + '</button>';
            } else {
                itemOptionsHtml += '<button class="dropdown-item monday-dropdown-menu-item dropdown-item-option" value="' + item.id + '">' + item.name + '</button>';
            }
        });
        if (i < groupIds.length - 1) {
            itemOptionsHtml += '<div class="dropdown-divider"></div>';
        }
    }
    $("#item-options").html(itemOptionsHtml);

    // Add callback to item selection options
    $('.dropdown-item-option').each(function (index) {
        $(this).click(function () {
            itemOptionBtnClick($(this).val(), $(this).text(), $("#board-select").val());
        });
    });
}

// Loads paused bar with selected board and item
async function loadPausedTimerBar(selectedBoard, selectedItem) {
    // Load HTML
    var boards = globalData.boards;
    var groups = globalData.boards[selectedBoard.id].groups;

    loadPausedTimerBoardSelect(selectedBoard.id, selectedBoard.name, boards);
    loadPausedTimerItemSelect(selectedItem.id, selectedItem.name, groups);

    // Remove timer if coming from running timer bar
    clearInterval(timeDurationUpdateFunc);

    $("#reports-select-bar").removeClass("active");
    $("#timer-not-running-bar").removeClass("active");
    $("#timer-hour-mode-bar").removeClass("active");
    $("#timer-running-bar").addClass("active");
}

/********** RUNNING ITEM BAR ***********/

async function loadRunningItemName(itemName) {
    $("#running-item-name").text(itemName);
}

async function loadRunningItemTime(duration) {
    const currentTimeStr = convertSecondsToTimeEntryTotalTimeStr(duration);
    $("#running-item-time").text(currentTimeStr);
}

// Loads timer bar with current time entry
async function loadRunningTimerBar(currentTimeEntry) {
    // Load HTML
    const item = globalData.items[currentTimeEntry.itemId];
    const duration = Date.now() / 1000 - currentTimeEntry.startTime;

    loadRunningItemName(item.name);
    loadRunningItemTime(duration);

    // Set time duration count and set interval function
    timeDuration = duration;

    clearInterval(timeDurationUpdateFunc);
    timeDurationUpdateFunc = setInterval(updateTimeDuration, 1000);

    $("#reports-select-bar").removeClass("active");
    $("#timer-running-bar").removeClass("active");
    $("#timer-hour-mode-bar").removeClass("active");
    $("#timer-not-running-bar").addClass("active");
}

/********** TIMER ENTRIES ***********/

async function loadTimerEntries() {
    // Only get time entries from the last two weeks
    var endTime = Date.now() / 1000;
    var startTime = endTime - (endTime % 24 * 60 * 60) - (14 * 24 * 60 * 60); // Get start of day of end time and subtract two weeks
    var timeEntries = await getSortedTimeEntries(startTime, endTime);

    if (timeEntries.length > 0) {
        var timeEntryHtml = await generateTimeEntryHtml(timeEntries);

        $('#timer-display').html(timeEntryHtml);

        // Add listeners to edit buttons
        $('.time-entry-edit').each(function (index) {
            $(this).click(function () {
                const timeEntryId = $(this).attr('id').split('-')[1];
                $('#modal-edit-time-entry-btn').val(timeEntryId);
                loadEditModalSelect(timeEntryId);
            });
        });

        // Add listeners to delete buttons
        $('.time-entry-delete').each(function (index) {
            $(this).click(function () {
                const timeEntryId = $(this).attr('id').split('-')[1];
                $('#modal-delete-time-entry-btn').val(timeEntryId);
            });
        });

        // Add listeners to quickplay buttons
        $('.time-entry-group-quick-play').each(function (index) {
            $(this).click(function () {
                const itemId = $(this).attr('id').split('-')[2];
                quickPlay(itemId);
            });
        });

        $('#timer-blank-display').hide();
        $('#timer-display').show();
    } else {
        $('#timer-display').hide();
        $('#timer-blank-display').show();
    }
}

/********** TIMER ENTRY EDIT MODAL ***********/

// Needs selected board ID, selected board Name and list of all board id's and name's
async function loadEditModalBoardSelect(selectedBoardId, selectedBoardName, boards) {
    // Change selected board value
    $("#time-entry-edit-board-select").val(selectedBoardId);
    $("#time-entry-edit-board-select").text(selectedBoardName);

    // Generate board options
    var boardOptionsHtml = '';
    for (const boardId in boards) {
        if (boards[boardId].id === selectedBoardId) {
            boardOptionsHtml += '<button class="dropdown-item monday-dropdown-menu-item active edit-modal-dropdown-board-option" value="' + boards[boardId].id + '">' + boards[boardId].name + '</button>';
        } else {
            boardOptionsHtml += '<button class="dropdown-item monday-dropdown-menu-item edit-modal-dropdown-board-option" value="' + boards[boardId].id + '">' + boards[boardId].name + '</button>';
        }
    }
    $("#time-entry-edit-board-options").html(boardOptionsHtml);

    // Add callback to board select options
    $('.edit-modal-dropdown-board-option').each(function (index) {
        $(this).click(function () {
            editModalBoardOptionBtnClick($(this).val());
        });
    });
}

// Needs selected item ID, selected item Name and a list of groups with their child items
async function loadEditModalItemSelect(selectedItemId, selectedItemName, groups) {
    // Generate selected item value
    $("#time-entry-edit-item-select").val(selectedItemId);
    $("#time-entry-edit-item-select").text(selectedItemName);

    // Gerneate item options
    var itemOptionsHtml = '';
    const groupIds = Object.keys(groups);
    for (let i = 0; i < groupIds.length; i++) {
        const groupId = groupIds[i];
        const group = groups[groupId];
        itemOptionsHtml += '<h6 class="dropdown-header monday-dropdown-menu-header" style="color: ' + group.color + ';">' + group.title + '</h6>';
        group.items.forEach(function (item) {
            if (item.id === selectedItemId) {
                itemOptionsHtml += '<button class="dropdown-item monday-dropdown-menu-item active edit-modal-dropdown-item-option" value="' + item.id + '">' + item.name + '</button>';
            } else {
                itemOptionsHtml += '<button class="dropdown-item monday-dropdown-menu-item edit-modal-dropdown-item-option" value="' + item.id + '">' + item.name + '</button>';
            }
        });
        if (i < groupIds.length - 1) {
            itemOptionsHtml += '<div class="dropdown-divider"></div>';
        }
    }
    $("#time-entry-edit-item-options").html(itemOptionsHtml);

    // Add callback to item selection options
    $('.edit-modal-dropdown-item-option').each(function (index) {
        $(this).click(function () {
            editModalItemOptionBtnClick($(this).val(), $(this).text(), $("#board-select").val());
        });
    });
}

// Needs time entries duration, start time, and end time
async function loadEditModalDuration(duration, startTime, endTime) {
    // Change duration input value
    formattedDuration.SetTotalSeconds(duration);
    $("#duration-edit").val(convertSecondsToTimeEntryTotalTimeStr(duration));

    // Change start time input value
    const startTimeStr = convertSecondsToMilitaryTime(startTime);
    $("#start-time-edit").val(startTimeStr);

    // Change end time input value
    const endTimeStr = convertSecondsToMilitaryTime(endTime);
    $("#end-time-edit").val(endTimeStr);

    // Change date input value
    const startDate = moment(startTime * 1000);
    $('#start-date-edit').data('daterangepicker').setStartDate(startDate);
    $('#start-date-edit').data('daterangepicker').setEndDate(startDate);
    editDateCallback(startDate);
}

// Loads paused bar with selected board and item
async function loadEditModalSelect(timeEntryId) {
    const timeEntry = await getTimeEntry(timeEntryId);

    const selectedItem = globalData.items[timeEntry.itemId];
    const selectedBoard = globalData.items[timeEntry.itemId].board;
    var boards = globalData.boards;
    var groups = globalData.boards[selectedBoard.id].groups;

    // Load HTML
    loadEditModalBoardSelect(selectedBoard.id, selectedBoard.name, boards);
    loadEditModalItemSelect(selectedItem.id, selectedItem.name, groups);
    loadEditModalDuration(timeEntry.duration, timeEntry.startTime, timeEntry.endTime);
}


/********** DOM LISTENERS **********/

$('#timer-btn-play').click(function () {
    timerPlayBtnClick();
});
$('#timer-btn-pause').click(function () {
    timerPauseBtnClick();
});

$("#end-time-edit").change(function () {
    const endTime = $("#end-time-edit").val();
    const endDate = globalEditDate.format('YYYY-MM-DD');
    const endDateStr = endDate + "T" + endTime + ":00";
    const endDateObj = new Date(endDateStr);
    const startTime = $("#start-time-edit").val();
    const startDate = globalEditDate.format('YYYY-MM-DD');
    const startDateStr = startDate + "T" + startTime + ":00";
    const startDateObj = new Date(startDateStr);

    if (endDateObj.getTime() < startDateObj.getTime()) {
        endDateObj.setDate(endDateObj.getDate() + 1);
    }

    const duration = (endDateObj.getTime() - startDateObj.getTime()) / 1000;
    formattedDuration.SetTotalSeconds(duration);
    $("#duration-edit").val(convertSecondsToTimeEntryTotalTimeStr(duration));
});

$("#start-time-edit").change(function () {
    const endTime = $("#end-time-edit").val();
    const endDate = globalEditDate.format('YYYY-MM-DD');
    const endDateStr = endDate + "T" + endTime + ":00";
    const endDateObj = new Date(endDateStr);
    const startTime = $("#start-time-edit").val();
    const startDate = globalEditDate.format('YYYY-MM-DD');
    const startDateStr = startDate + "T" + startTime + ":00";
    const startDateObj = new Date(startDateStr);

    if (endDateObj.getTime() < startDateObj.getTime()) {
        endDateObj.setDate(endDateObj.getDate() + 1);
    }

    const duration = (endDateObj.getTime() - startDateObj.getTime()) / 1000;

    formattedDuration.SetTotalSeconds(duration);
    $("#duration-edit").val(convertSecondsToTimeEntryTotalTimeStr(duration));
});

// $("#start-time-edit").change(startTimeStr);

// $("#end-time-edit").change(endTimeStr);

// $("#start-date-edit").change(startDateStr);

/********** DOM Callbacks **********/

async function timerPlayBtnClick() {
    // Check if current task is already running
    const runningItem = await getCurrentTimeEntry();
    if (runningItem) {
        // console.log("TODO CANT START TIMER, ITEM ALREADY RUNNING");
    } else {
        const selectedItem = $('#item-select').val();
        const currentTimeEntry = await startTime(selectedItem);
        await loadRunningTimerBar(currentTimeEntry);
    }
}

async function timerPauseBtnClick() {
    // Check if a task is currently running
    const runningItem = await getCurrentTimeEntry();
    if (runningItem) {
        // Check if time entry has been running for more than a second to prevent spam
        if ((Date.now() / 1000 - runningItem.startTime) > 0) {
            const selectedItem = globalData.items[runningItem.itemId];
            await stopTime(selectedItem.id);
            await loadPausedTimerBar(selectedItem.board, selectedItem);
            await loadTimerEntries();
        }
    } else {
        // console.log("TODO CANT STOP TIMER, NO ITEM RUNNING");
    }
}

async function boardOptionBtnClick(selectedBoardId) {
    const board = globalData.boards[selectedBoardId];
    if (board.items.length > 0) {
        loadPausedTimerBar(board, board.items[0])
    } else {
        // console.log("TODO NO BOARD ITEMS")
    }
}

async function itemOptionBtnClick(selectedItemId, selectedItemName, selectedBoardId) {
    const groups = globalData.boards[selectedBoardId].groups;
    loadPausedTimerItemSelect(selectedItemId, selectedItemName, groups)
}

async function editModalBoardOptionBtnClick(selectedBoardId) {
    const board = globalData.boards[selectedBoardId];
    const groups = globalData.boards[selectedBoardId].groups;
    if (board.items.length > 0) {
        loadEditModalBoardSelect(board.id, board.name, globalData.boards);
        loadEditModalItemSelect(board.items[0].id, board.items[0].name, groups)
    } else {
        // console.log("TODO NO BOARD ITEMS")
    }
}

async function editModalItemOptionBtnClick(selectedItemId, selectedItemName, selectedBoardId) {
    const groups = globalData.boards[selectedBoardId].groups;
    loadEditModalItemSelect(selectedItemId, selectedItemName, groups)
}

async function updateTimeDuration() {
    timeDuration = timeDuration + 1;
    loadRunningItemTime(timeDuration);
}

async function quickPlay(itemId) {
    const runningItem = await getCurrentTimeEntry();
    if (runningItem) {
        // console.log("CAN NOT RUN TIME ON AN ITEM WHEN ONE IS ALREADY RUNNING");
    } else {
        const currentTimeEntry = await startTime(itemId);
        await loadRunningTimerBar(currentTimeEntry);
    }
}

async function deleteEntry(timeEntryId) {
    await deleteTimeEntry(timeEntryId);
    await loadTimerEntries();
}

async function editEntry(timeEntryId) {

    // Get new duration
    const duration = formattedDuration.ToTotalSeconds();

    // Get new start time
    const startTime = $("#start-time-edit").val();
    const startDate = globalEditDate.format('YYYY-MM-DD');
    const startDateStr = startDate + "T" + startTime + ":00";
    const startDateMoment = moment(startDateStr);

    // Get new item id if changed
    const itemId = $("#time-entry-edit-item-select").val();

    await editTimeEntry(timeEntryId, itemId, startDateMoment.valueOf() / 1000, duration);
    await loadTimerEntries();
}


/********** DURATION HANDLERS **********/

class DurationChangeHandler {
    constructor() {
    }

    setSecondsValue(seconds) {
        const newDuration = seconds;
        const startTime = $("#start-time-edit").val();
        const startDate = globalEditDate.format('YYYY-MM-DD');
        const startDateStr = startDate + "T" + startTime + ":00";
        const startDateObj = new Date(startDateStr);

        const newEndDate = new Date(startDateObj.getTime() + newDuration * 1000);
        const newEndTimeStr = convertSecondsToMilitaryTime(newEndDate / 1000);

        $("#end-time-edit").val(newEndTimeStr);
    }
}

let pickerElement = document.getElementById("duration-edit");
let durationChangeHandler = new DurationChangeHandler();

let formattedDuration = new FormattedDuration(config = {
    hoursUnitString: ":",
    minutesUnitString: ":",
    secondsUnitString: "",
});
let durationPickerMaker = new DurationPickerMaker(formattedDuration);

durationPickerMaker.AddSecondChangeObserver(durationChangeHandler);
durationPickerMaker.SetPickerElement(pickerElement, window, document);

// Add listener to modal delete button based on which item delete icon called the modal
$('#modal-delete-time-entry').one('show.bs.modal', function (e) {
    $('#modal-delete-time-entry-btn').on('click', function (event) {
        var timeEntryId = $(this).val();
        deleteEntry(timeEntryId);
    });
});

// Add listener to modal edit button based on which item delete icon called the modal
$('#modal-edit-time-entry').one('show.bs.modal', function (e) {
    $('#modal-edit-time-entry-btn').on('click', function (event) {
        // Get time entry ID to edit
        const timeEntryId = $(this).val();
        editEntry(timeEntryId)
    });
});