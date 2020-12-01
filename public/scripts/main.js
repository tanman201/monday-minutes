var changingPannels = false;
// When document is loaded, run App async function
$(document).ready(function () {
    runApp();
});

async function runApp() {
    // Setup and check Monday authorization
    await setupAuthorizationHeader();
    // await checkAuthorization();   TODO

    // Alway Initialize view to timer first
    await initTimerTab();
    $("#timer-tab-link").addClass("active");
    $("#timer-tab").addClass("active");

    /*** Add callback to tab clicks ***/
    $("#timer-tab-link").click(function () {
        // Only run show timer tab if not already active
        if (!$("#timer-tab").hasClass("active") & !changingPannels) {
            showTimerTab();
        }
    });
    $("#reports-tab-link").click(function () {
        // Only run show reports tab if not already active
        if (!$("#reports-tab").hasClass("active") & !changingPannels) {
            showReportsTab();
        }
    });

    /*** Hide loader and show app ***/
    $('#main-loader').hide()
    $('#main-app').show()
    $('[data-toggle="tooltip"]').tooltip()
}

async function setupAuthorizationHeader() {
    await monday.get("sessionToken").then(res => {
        $.ajaxSetup({
            headers: { 'authorization': res.data }
        });
    });
}

async function showTimerTab() {
    changingPannels = true;
    // Switch tab link
    $('#reports-tab-link').removeClass("active");
    $('#timer-tab-link').addClass("active");
    // Switch tab view to loading while waiting to load
    $('#reports-tab').removeClass("active");
    $('#timer-tab').removeClass("active");
    $('#loading-tab').addClass("active");
    // Load new tab
    await initTimerTab();
    $('#reports-tab').removeClass("active");
    $('#loading-tab').removeClass("active");
    $('#timer-tab').addClass("active");
    changingPannels = false;
}

async function showReportsTab() {
    changingPannels = true;
    // Switch tab link
    $('#timer-tab-link').removeClass("active");
    $('#reports-tab-link').addClass("active");
    // Switch tab view to loading while waiting to load
    $('#timer-tab').removeClass("active");
    $('#reports-tab').removeClass("active");
    $('#loading-tab').addClass("active");
    // Load new tab
    await initReportsView();
    $('#timer-tab').removeClass("active");
    $('#loading-tab').removeClass("active");
    $('#reports-tab').addClass("active");
    changingPannels = false;
}
