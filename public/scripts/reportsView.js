var authenticated = false;
var currentlyLoadedTimeEntries = undefined;
var savingTimeEntries = false;

var userFilterList = undefined;
var boardFilterList = undefined;
var groupFilterList = undefined;
var itemFilterList = undefined;

const usersDataGroupOptionHtml = '<button class="dropdown-item dropdown-data-group-option monday-dropdown-menu-item">User</button>';
const boardsDataGroupOptionHtml = '<button class="dropdown-item dropdown-data-group-option monday-dropdown-menu-item">Board</button>';
const groupsDataGroupOptionHtml = '<button class="dropdown-item dropdown-data-group-option monday-dropdown-menu-item">Group</button>';
const itemsDataGroupOptionHtml = '<button class="dropdown-item dropdown-data-group-option monday-dropdown-menu-item">Item</button>';

const usersDataGroupOptionActiveHtml = '<button class="dropdown-item active dropdown-data-group-option monday-dropdown-menu-item">User</button>';
const boardsDataGroupOptionActiveHtml = '<button class="dropdown-item active dropdown-data-group-option monday-dropdown-menu-item">Board</button>';
const groupsDataGroupOptionActiveHtml = '<button class="dropdown-item active dropdown-data-group-option monday-dropdown-menu-item">Group</button>';
const itemsDataGroupOptionActiveHtml = '<button class="dropdown-item active dropdown-data-group-option monday-dropdown-menu-item">Item</button>';

const groupOptions = {
    "User": usersDataGroupOptionHtml,
    "Board": boardsDataGroupOptionHtml,
    "Group": groupsDataGroupOptionHtml,
    "Item": itemsDataGroupOptionHtml
}

const groupActiveOptions = {
    "User": usersDataGroupOptionActiveHtml,
    "Board": boardsDataGroupOptionActiveHtml,
    "Group": groupsDataGroupOptionActiveHtml,
    "Item": itemsDataGroupOptionActiveHtml
}

const dataSourceToGroupMap = {
    "Users": ["Board", "Group", "Item"],
    "Boards": ["User", "Board", "Group", "Item"],
    "Groups": ["User", "Group", "Item"],
    "Items": ["User", "Item"]
}

$('.dropdown-data-source-option').each(function () {
    $(this).click(function () {
        loadGroupOptionsDropdown($(this).text());
        loadReportsApp();
    })
});

// const mondayColors = ["#00C875", "#4ECCC6", "#7E3B8A", "#333333", "#7F5347", "#FAA1F1", 
//                       "#66CCFF", "#401694", "#784BD1", "#FFCB00", "#5559DF", "#579BFC", 
//                       "#225091", "#FDAB3D", "#FFADAD", "#68A1BD", "#225091", "#FF7575", 
//                       "#9AADBD"];

const mondayColors = ["#00C875", "#4ECCC6", "#7E3B8A", "#FAA1F1",
    "#66CCFF", "#784BD1", "#FFCB00", "#5559DF", "#579BFC",
    "#FDAB3D", "#FFADAD", "#68A1BD", "#FF7575",
    "#9AADBD"];

function filterDateRangeCallback(start, end) {
    $('#date-range-filter-select span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
    startTimeSelect = start;
    endTimeSelect = end;
    if (authenticated) {
        loadReportsApp();
    }
}

var startTimeSelect = moment().subtract(14, 'days');
var endTimeSelect = moment();

$('#date-range-filter-select').daterangepicker({
    ranges: {
        'Today': [moment(), moment()],
        'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
        'Last 7 Days': [moment().subtract(6, 'days'), moment()],
        'Last 30 Days': [moment().subtract(29, 'days'), moment()],
        'This Month': [moment().startOf('month'), moment().endOf('month')],
        'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
        // 'This Year': [moment().startOf('year'), moment().endOf('year')],
        // 'Last Year': [moment().subtract(1, 'year').startOf('year'), moment().subtract(1, 'year').endOf('year')]
    },
    "alwaysShowCalendars": true,
    "startDate": "11/22/2020",
    "endDate": "11/28/2020",
    "opens": "center",
    "applyButtonClasses": "monday-primary-btn",
    "cancelButtonClasses": "monday-tertiary-btn"
}, filterDateRangeCallback);

filterDateRangeCallback(startTimeSelect, endTimeSelect);

const pieChart = document.getElementById('pie-chart').getContext('2d');
const pieChartObj = new Chart(pieChart, {
    type: 'pie',
    data: {
        labels: [],
        datasets: []
    },
    options: {
        cutoutPercentage: 30,
        legend: {
            display: false,
            position: "right"
        },
        responsive: true,
        maintainAspectRatio: false
    }
});

const barChart = document.getElementById('bar-chart').getContext('2d');
const barChartObj = new Chart(barChart, {
    type: 'bar',
    data: {
        labels: [],
        datasets: []
    },
    options: {
        tooltips: {
            displayColors: true,
            callbacks: {
                mode: 'x',
            },
        },
        scales: {
            xAxes: [{
                stacked: true,
                gridLines: {
                    display: false,
                }
            }],
            yAxes: [{
                stacked: true,
                ticks: {
                    beginAtZero: true,
                },
                type: 'linear',
            }]
        },
        responsive: true,
        maintainAspectRatio: false,
        legend: {
            display: false,
            position: "right"
        }
    }
});

async function initReportsView() {
    authenticated = true;
    await loadFilterBar();
    loadReportsApp();
}

async function loadUserFilterSelect() {
    // Load Board filter dropdown
    const users = globalData.users;
    var userOptions = {
        valueNames: ['name', { attr: 'value', name: 'id' }, { attr: 'src', name: 'photoTiny' }],
        item: '<li class="text-truncate"><button type="button" class="dropdown-item monday-dropdown-menu-item dropdown-filter-user-option id"><img class="photoTiny user-photo-icon"><span class="name text"></span></button></li>'
    };
    var userValues = [];
    for (const userIdx in users) {
        const user = users[userIdx];
        userValues.push({
            name: user.name,
            id: user.id,
            photoTiny: user.photo_tiny
        })
    }
    if (userFilterList) {
        userFilterList.clear();
        userFilterList.add(userValues);
    } else {
        userFilterList = new List('user-filter-list', userOptions, userValues);
    }

    $('.dropdown-filter-user-option').each(function (index) {
        $(this).click(function () {
            toggleActive(this);
        });
    });
}

async function loadBoardFilterSelect() {
    // Load Board filter dropdown
    const boards = globalData.boards
    var boardOptions = {
        valueNames: ['name', { attr: 'value', name: 'id' }],
        item: '<li class="text-truncate"><button type="button" class="dropdown-item monday-dropdown-menu-item dropdown-filter-board-option id"><div class="name text"></div></button></li>'
    };
    var boardValues = [];
    for (const boardId in boards) {
        boardValues.push({
            name: boards[boardId].name,
            id: boards[boardId].id
        })
    }
    if (boardFilterList) {
        boardFilterList.clear();
        boardFilterList.add(boardValues);
    } else {
        boardFilterList = new List('board-filter-list', boardOptions, boardValues);
    }

    $('.dropdown-filter-board-option').each(function (index) {
        $(this).click(function () {
            toggleActive(this);
        });
    });
}

async function loadGroupFilterSelect() {
    // Load Groups filter dropdown
    const boards = globalData.boards
    var groupOptions = {
        valueNames: ['name', { attr: 'value', name: 'id' }, 'color', 'boardName', 'boardId'],
        item: '<li class="text-truncate"><button type="button" class="dropdown-item monday-dropdown-menu-item dropdown-filter-group-option id"><div class="name text"></div><span class="subtext">Board: </span><span class="boardName subtext"></span></button></li>'
    };
    var groupValues = [];
    for (const boardId in boards) {
        const board = boards[boardId];
        for (const groupId in board.groups) {
            groupValues.push({
                name: board.groups[groupId].title,
                id: board.groups[groupId].id,
                color: board.groups[groupId].color,
                boardName: board.name,
                boardId: board.id
            })
        }
    }
    if (groupFilterList) {
        groupFilterList.clear();
        groupFilterList.add(groupValues);
    } else {
        groupFilterList = new List('group-filter-list', groupOptions, groupValues);
    }

    $('.dropdown-filter-group-option').each(function (index) {
        $(this).click(function () {
            toggleActive(this);
        });
    });
}

async function loadItemFilterSelect() {
    // Load Items filter dropdown
    const items = globalData.items;
    var itemOptions = {
        valueNames: ['name', { attr: 'value', name: 'id' }, 'groupName', 'groupId', 'boardName', 'boardId'],
        item: '<li class="text-truncate"><button type="button" class="dropdown-item monday-dropdown-menu-item dropdown-filter-item-option id"><div class="name text"></div><div><span class="subtext">Board: </span><span class="boardName subtext"></span></div><div><span class="subtext">Group: </span><span class="groupName subtext"></span></div></button></li>'
    };
    var itemValues = [];
    for (const itemId in items) {
        const item = items[itemId];
        itemValues.push({
            name: item.name,
            id: item.id,
            groupName: item.group.title,
            groupId: item.group.id,
            boardName: item.board.name,
            boardId: item.board.id
        })
    }
    if (itemFilterList) {
        itemFilterList.clear();
        itemFilterList.add(itemValues);
    } else {
        itemFilterList = new List('item-filter-list', itemOptions, itemValues);
    }

    $('.dropdown-filter-item-option').each(function (index) {
        $(this).click(function () {
            toggleActive(this);
        });
    });
}

async function loadGroupOptionsDropdown(currentlySelectedDataSourceOption) {
    const currentlySelectedGroupOption = $('#data-group-select').val();

    var selectedGroupOption = undefined;

    if (dataSourceToGroupMap[currentlySelectedDataSourceOption].includes(currentlySelectedGroupOption)) {
        selectedGroupOption = currentlySelectedGroupOption;
    } else {
        selectedGroupOption = dataSourceToGroupMap[currentlySelectedDataSourceOption][0];
    }

    $('#data-source-select').val(currentlySelectedDataSourceOption);
    $('#data-source-select').text("Plot " + currentlySelectedDataSourceOption);
    $('.dropdown-data-source-option').each(function () {
        if ($(this).text() === currentlySelectedDataSourceOption) {
            $(this).addClass("active");
        } else {
            $(this).removeClass("active");
        }
    });

    var groupOptionsHtml = '';
    for (let i = 0; i < dataSourceToGroupMap[currentlySelectedDataSourceOption].length; i++) {
        const groupOption = dataSourceToGroupMap[currentlySelectedDataSourceOption][i];
        if (groupOption === selectedGroupOption) {
            groupOptionsHtml += groupActiveOptions[groupOption];
        } else {
            groupOptionsHtml += groupOptions[groupOption];
        }
    }

    $('#data-group-select').val(selectedGroupOption);
    $('#data-group-select').text("by " + selectedGroupOption);
    $('#data-group-options').html(groupOptionsHtml);
    $('.dropdown-data-group-option').each(function () {
        $(this).click(function () {
            $('#data-group-select').val($(this).text());
            $('#data-group-select').text("by " + $(this).text());
            loadGroupOptionsDropdown($('#data-source-select').val());
            loadReportsApp();
        })
    });
}

async function loadFilterBar() {
    loadUserFilterSelect();
    loadBoardFilterSelect();
    loadGroupFilterSelect();
    loadItemFilterSelect();

    loadGroupOptionsDropdown($('#data-source-select').val());

    $("#timer-not-running-bar").removeClass("active");
    $("#timer-hour-mode-bar").removeClass("active");
    $("#timer-running-bar").removeClass("active");
    $("#reports-select-bar").addClass("active");
}

async function loadReportsApp() {
    const filterData = await readFilterData();
    plotCharts(filterData[0], filterData[1], filterData[2], filterData[3]);
}

async function readFilterData() {
    // Get source and grouped data selections
    const dataSource = $('#data-source-select').val();
    const dataGroup = $('#data-group-select').val();

    // Find all filters
    var userFilter = [];
    await $('.dropdown-filter-user-option.active').each(function () {
        userFilter.push(parseInt($(this).val()));
    });
    if (userFilter.length < 1) {
        await $('.dropdown-filter-user-option').each(function () {
            userFilter.push(parseInt($(this).val()));
        });
    }

    var boardFilter = [];
    await $('.dropdown-filter-board-option.active').each(function () {
        boardFilter.push(parseInt($(this).val()));
    });
    if (boardFilter.length < 1) {
        await $('.dropdown-filter-board-option').each(function () {
            boardFilter.push(parseInt($(this).val()));
        });
    }

    var groupFilter = [];
    await $('.dropdown-filter-group-option.active').each(function () {
        groupFilter.push($(this).val());
    });
    if (groupFilter.length < 1) {
        await $('.dropdown-filter-group-option').each(function () {
            groupFilter.push($(this).val());
        });
    }

    var itemFilter = [];
    await $('.dropdown-filter-item-option.active').each(function () {
        itemFilter.push(parseInt($(this).val()));
    });
    if (itemFilter.length < 1) {
        await $('.dropdown-filter-item-option').each(function () {
            itemFilter.push(parseInt($(this).val()));
        });
    }

    // Get item ID time entries to be queried
    var dataSourceItemIds = [];
    switch (dataSource) {
        case 'Users':
            // Don't filter for any user Ids, just filter DB by user
            break;
        case 'Boards':
            for (let i = 0; i < boardFilter.length; i++) {
                const items = globalData.boards[boardFilter[i]].items;
                dataSourceItemIds.push.apply(dataSourceItemIds, items.map(item => item.id));
            }
            break;
        case 'Groups':
            for (let i = 0; i < boardFilter.length; i++) {
                const groups = globalData.boards[boardFilter[i]].groups;
                for (const groupId in groups) {
                    const items = groups[groupId].items;
                    dataSourceItemIds.push.apply(dataSourceItemIds, items.map(item => item.id));
                }
            }
            break;
        case 'Items':
            dataSourceItemIds.push.apply(dataSourceItemIds, itemFilter);
            break;
        default:
            //console.log(`Sorry, ${dataSource} ia not an option`);
            break;
    }

    return [dataSourceItemIds, userFilter, dataGroup, dataSource];
}

async function plotCharts(itemIds, users, dataGroup, dataSource) {
    const startTime = startTimeSelect.startOf("day").valueOf() / 1000;
    const endTime = endTimeSelect.endOf("day").valueOf() / 1000;

    var timeEntryFilter = undefined;
    if (itemIds.length > 0) {
        timeEntryFilter = {
            mondayUserId: users,
            itemId: itemIds,
            startTime: startTime,
            endTime: endTime
        }
    } else {
        timeEntryFilter = {
            mondayUserId: users,
            startTime: startTime,
            endTime: endTime
        }
    }

    var timeEntries = await getTimeEntriesFromFilter(timeEntryFilter);
    currentlyLoadedTimeEntries = timeEntries;

    var colorIndex = 0;

    // Filter time entries into groups
    var chartDataGroups = {}
    for (let i = 0; i < timeEntries.length; i++) {
        const timeEntry = timeEntries[i];
        const itemId = timeEntry.itemId;
        const userId = timeEntry.user.mondayUserId;
        const duration = timeEntry.duration;
        var chartDataGroupId = undefined;
        var chartDataGroupName = undefined;

        if (dataGroup === "User") {
            chartDataGroupId = userId;
            chartDataGroupName = globalData.users[userId].name;
        } else if (dataGroup === "Board") {
            chartDataGroupId = globalData.items[itemId].board.id;
            chartDataGroupName = globalData.items[itemId].board.name;
        } else if (dataGroup === "Group") {
            chartDataGroupId = globalData.items[itemId].group.id;
            chartDataGroupName = globalData.items[itemId].group.title;
        } else if (dataGroup === "Item") {
            chartDataGroupId = globalData.items[itemId].id;
            chartDataGroupName = globalData.items[itemId].name;
        }

        if (!chartDataGroups.hasOwnProperty(chartDataGroupId)) {
            const color = mondayColors[colorIndex];
            chartDataGroups[chartDataGroupId] = {
                label: chartDataGroupName,
                color: color,
                totalTime: 0,
                timeEntries: []
            };
            colorIndex = (colorIndex + 1) % mondayColors.length;
        }
        chartDataGroups[chartDataGroupId].totalTime += duration;
        chartDataGroups[chartDataGroupId].timeEntries.push(timeEntry);
    }

    // Clear previous data
    pieChartObj.data.labels.length = 0;
    pieChartObj.data.datasets.length = 0;
    pieChartObj.data.datasets[0] = {
        data: [],
        backgroundColor: [],
        borderColor: [],
        borderWidth: 1
    };

    barChartObj.data.labels.length = 0;
    barChartObj.data.datasets.length = 0;

    // Repopulate pie chart    
    var totalSeconds = 0;

    for (let chartGroupId in chartDataGroups) {
        const chartGroup = chartDataGroups[chartGroupId];
        pieChartObj.data.labels.push(chartGroup.label)
        pieChartObj.data.datasets[0].data.push(chartGroup.totalTime / 3600);
        pieChartObj.data.datasets[0].backgroundColor.push(chartGroup.color);
        pieChartObj.data.datasets[0].borderColor.push(chartGroup.color);

        totalSeconds += chartGroup.totalTime;
    }

    // Filter data into spans of time for bar graph
    var columnSize = undefined;
    // Less than a month, bar graph by days
    if ((endTime.valueOf() - startTime.valueOf()) < (32 * 24 * 60 * 60)) {
        columnSize = "day";
        // Less than 14 weeks, bar graph by weeks
    } else if ((endTime.valueOf() - startTime.valueOf()) < (14 * 7 * 24 * 60 * 60)) {
        columnSize = "week";
        // Less than 14 months, bar graph by months
    } else if ((endTime.valueOf() - startTime.valueOf()) < (14 * 4 * 7 * 24 * 60 * 60)) {
        columnSize = "month";
    } else {
        columnSize = "year";
    }

    var start = moment(startTime * 1000).startOf(columnSize);
    var end = moment(endTime * 1000).endOf(columnSize);

    var bars = [start];

    while (end >= start) {
        start = moment(start.valueOf()).add(1, columnSize + "s");
        bars.push(start);
    }

    // Fill labels
    for (let i = 0; i < bars.length; i++) {
        const start = bars[i];
        var end = undefined;
        if (i < (bars.length - 1)) {
            end = bars[i + 1];
        }
        if (end) {
            switch (columnSize) {
                case "day":
                    barChartObj.data.labels.push(start.format('ddd M/D'));
                    break;
                case "week":
                    barChartObj.data.labels.push(start.format('M/D') + " - " + end.format('M/D'));
                    break;
                case "month":
                    barChartObj.data.labels.push(start.format('MMM YYYY'));
                    break;
                case "year":
                    barChartObj.data.labels.push(start.format('YYYY'));
                    break;
                default:
                    barChartObj.data.labels.push(start.format('YYYY'));
                    break;
            }
        }
    }

    // Fill datasets
    for (let chartDataGroupId in chartDataGroups) {
        const barChartGroup = chartDataGroups[chartDataGroupId];
        var barChartGroupDataset = {
            label: barChartGroup.label,
            backgroundColor: barChartGroup.color,
            data: []
        }

        for (let i = 0; i < bars.length; i++) {
            var start = bars[i];
            var end = undefined;
            if (i < (bars.length - 1)) {
                end = bars[i + 1];
            }
            var end = bars[i + 1];
            var totalHours = 0;

            for (let j = 0; j < barChartGroup.timeEntries.length; j++) {
                const timeEntry = barChartGroup.timeEntries[j];
                if (end) {
                    if ((moment(timeEntry.startTime * 1000) > start) && (moment(timeEntry.startTime * 1000) < end)) {
                        totalHours += timeEntry.duration / (3600);
                    }
                } else {
                    // if(moment(timeEntry.startTime*1000) > start){
                    //     totalHours += timeEntry.duration/(3600);
                    // }
                }
            }
            barChartGroupDataset.data.push(totalHours);
        }

        barChartObj.data.datasets.push(barChartGroupDataset);
    }

    pieChartObj.update();
    barChartObj.update();

    // Update total time html
    $("#total-chart-time").text(convertSecondsToDateTotalTimeStr(totalSeconds));

    if(timeEntries.length > 0){
        const reportHtml = await generateReportChart(chartDataGroups)
        $("#data-chart").html(reportHtml);
        $("#no-data-chart").hide();
        $("#data-chart").show();
    }else{
        $("#data-chart").hide();
        $("#no-data-chart").show();
    }

}

async function toggleActive(el) {
    await $(el).toggleClass("active");
    loadReportsApp();
}

$('#user-filter-options').on('click', function (event) {
    event.stopPropagation();
});

$('#select-all-users').click(function () {
    if ($('.dropdown-filter-user-option.active').length !== $('.dropdown-filter-user-option').length) {
        $('.dropdown-filter-user-option').each(function (index) {
            $(this).addClass("active");
        });
    } else {
        $('.dropdown-filter-user-option').each(function (index) {
            $(this).removeClass("active");
        });
    }
    loadReportsApp();
})

$('#board-filter-options').on('click', function (event) {
    event.stopPropagation();
});

$('#select-all-boards').click(function () {
    if ($('.dropdown-filter-board-option.active').length !== $('.dropdown-filter-board-option').length) {
        $('.dropdown-filter-board-option').each(function (index) {
            $(this).addClass("active");
        });
    } else {
        $('.dropdown-filter-board-option').each(function (index) {
            $(this).removeClass("active");
        });
    }
    loadReportsApp();
})

$('#group-filter-options').on('click', function (event) {
    event.stopPropagation();
});

$('#select-all-groups').click(function () {
    if ($('.dropdown-filter-group-option.active').length !== $('.dropdown-filter-group-option').length) {
        $('.dropdown-filter-group-option').each(function (index) {
            $(this).addClass("active");
        });
    } else {
        $('.dropdown-filter-group-option').each(function (index) {
            $(this).removeClass("active");
        });
    }
    loadReportsApp();
})

$('#item-filter-options').on('click', function (event) {
    event.stopPropagation();
});

$('#select-all-items').click(function () {
    if ($('.dropdown-filter-item-option.active').length !== $('.dropdown-filter-item-option').length) {
        $('.dropdown-filter-item-option').each(function (index) {
            $(this).addClass("active");
        });
    } else {
        $('.dropdown-filter-item-option').each(function (index) {
            $(this).removeClass("active");
        });
    }
    loadReportsApp();
})

// document.getElementById("save-pie-chart").addEventListener('click', function () {
//     console.log("DOWNLOADING")
//     /*Get image of canvas element*/
//     var url_base64jp = document.getElementById("pie-chart").toDataURL("image/jpg");
//     /*get download button (tag: <a></a>) */
//     var a = document.getElementById("save-pie-chart");
//     /*insert chart image url to download button (tag: <a></a>) */
//     a.href = url_base64jp;
// });


// $("#save-report").on('click', function() { 
//     console.log("SAVING REPORT")
//     saveReport();
// }); 

// async function saveReport(){
//     var element = $("#reports-display");  
//     var getCanvas;  

//     await html2canvas(element, { 
//         onrendered: function(canvas) {
//             getCanvas = canvas; 
//         } 
//     }); 

//     console.log(getCanvas)

//     var imgageData = getCanvas.toDataURL("image/png");
    
//     console.log(imgageData)
    
//     // Now browser starts downloading  
//     // it instead of just showing it 
//     var newData = imgageData.replace(/^data:image\/png/, "data:application/octet-stream"); 

//     console.log(newData)
    
//     let fileName = "report_from_" + startTimeSelect.format('YYYY_MM_DD') + "_to_" + endTimeSelect.format('YYYY_MM_DD') + ".png"
//     $("#save-report").attr("download", fileName).attr("href", newData); 
// }

document.getElementById("save-time-entires").addEventListener('click', function () {
    var rows = [["Item Name", "Item Id", "Start Time", "End Time", "Duration (sec)", "Group Name", "Group Id", "Board Name", "Board Id", "User Name", "User Id"]];
    if(currentlyLoadedTimeEntries){
        savingTimeEntries = true;
        // Clone variable to not change object while saveing 
        const timeEntriesToDownload = _.cloneDeep(currentlyLoadedTimeEntries);
        const globalDataCopy = _.cloneDeep(globalData);
        for(let i = 0; i < timeEntriesToDownload.length; i++){
            const timeEntry = timeEntriesToDownload[i];
            var newRow = [
                globalDataCopy.items[timeEntry.itemId].name,
                globalDataCopy.items[timeEntry.itemId].id,
                moment(timeEntry.startTime*1000).toString(),
                moment(timeEntry.endTime*1000).toString(),
                timeEntry.duration,
                globalDataCopy.items[timeEntry.itemId].group.title,
                globalDataCopy.items[timeEntry.itemId].group.id,
                globalDataCopy.items[timeEntry.itemId].board.name,
                globalDataCopy.items[timeEntry.itemId].board.id,
                globalDataCopy.users[timeEntry.user.mondayUserId].name,
                globalDataCopy.users[timeEntry.user.mondayUserId].id
            ];
            rows.push(newRow);
        }

        let csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
        let fileName = "time_entries_from_" + startTimeSelect.format('YYYY_MM_DD') + "_to_" + endTimeSelect.format('YYYY_MM_DD') + ".csv"

        var encodedUri = encodeURI(csvContent);
        var link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", fileName);
        document.body.appendChild(link); // Required for FF

        link.click(); // This will download the data file named "time_entries.csvv".
        savingTimeEntries = false;
    }
});

