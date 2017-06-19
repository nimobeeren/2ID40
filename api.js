/**
 * Random thermostat id
 */
var THERMOSTAT_ID = 1;

/**
 * The REST API base url
 */
var BASE_URL = 'http://wwwis.win.tue.nl/2id40-ws/' + THERMOSTAT_ID + '/';

//The whole XML response of the thermostat
var program = null;

var weekProgramXML;

var weekProgramJSON = {
    Monday: {},
    Tuesday: {},
    Wednesday: {},
    Thursday: {},
    Friday: {},
    Saturday: {},
    Sunday: {}
};

initialize();
// setInterval(refresh,10000); //TODO remove to auto refresh

// ----------------------

function initialize() {

    $.ajax({
        url: BASE_URL,
        type: 'PUT',
        contentType: 'application/xml',
        async: false,
        success: function (response) {
            response = $(response).find('response')[0].innerHTML;
            if (response === 'OK') {
                console.log('Therm found');
            } else if (response === 'Created') {
                console.log('Therm created')
            } else {
                console.log(response);
            }
        }
    });

    refresh();
}

function refresh() {
    //Getting current day and time
    $.get({
        url: BASE_URL,
        async: false,
        success: function (response) {
            program = response;
            day = $(response).find('current_day')[0].innerHTML;
            time = $(response).find('time')[0].innerHTML;
            currentTemperature = $(response).find('current_temperature')[0].innerHTML;
            targetTemperature = $(response).find('target_temperature')[0].innerHTML;
            dayTemperature = $(response).find('day_temperature')[0].innerHTML;
            nightTemperature = $(response).find('night_temperature')[0].innerHTML;
            weekProgramState = $(weekProgramXML).find("week_program").attr("state");
            weekProgramXML = response;
            weekProgramState = $(weekProgramXML).find("week_program").attr("state");
            day = $(weekProgramXML).find('day').attr('name');
            weekProgramXMLToJSON(weekProgramXML);
            dayProgram = getSpecificDayProgram(day);
        }
    });
}

function getSpecificDayProgram(specDay) {
    return weekProgramJSON[specDay];
}

function sortByTime(a, b) {
    aTime = a.time;
    bTime = b.time;
    return ((aTime < bTime) ? -1 : ((aTime > bTime) ? 1 : 0));
}

function saveProgram(weeklyProgram) {

    var doc = $.parseXML("<xml/>");
    var xml = doc.getElementsByTagName("xml")[0];


    console.log(xml);

    // $.ajax({
    //     type: "put",
    //     url: BASE_URL +  'weekProgram/',
    //     contentType: 'application/xml',
    //     data: xml,
    //     async: false
    // });
}

function weekProgramXMLToJSON(xml) {
    var weekSchedule = $(xml).find('day');

    for (var i = 0; i < weekSchedule.length; i++) {
        var currentDay = $(weekSchedule[i]).attr('name');
        var switches = $(weekSchedule[i]).find('switch');
        weekProgramJSON[currentDay].switches = [];

        for (var j = 0; j < switches.length; j++) {
            weekProgramJSON[currentDay].switches.push({
                type: $(switches[j]).attr('type'),
                state: $(switches[j]).attr('state'),
                time: $(switches[j])[0].innerHTML
            });
            weekProgramJSON[currentDay].switches.sort(sortByTime);
        }
    }
}

