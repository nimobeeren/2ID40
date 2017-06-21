/**
 * Random thermostat id
 */
var THERMOSTAT_ID = 423;

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
setInterval(refresh,3000); //TODO remove to auto refresh

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
            // day = $(weekProgramXML).find('day').attr('name');
            weekProgramXMLToJSON(weekProgramXML);
            mergeProgram();
            dayProgram = getDayProgram(day);
            console.log(day);
            console.log(time);
            console.log(dayProgram);
            console.log(currentTemperature);
        }
    });

}

function getDayProgram(day) {
    // mergeProgram();
    return weekProgramJSON[day];
}

function setTargetTemp(target){
    $.ajax({
        type: "put",
        url: BASE_URL + 'targetTemperature/',
        contentType: 'application/xml',
        data: '<target_temperature>' + target + '</target_temperature>',
        async: false,
    });
}


function saveProgram() {
    mergeProgram();
    var weeklyProgram = weekProgramJSON;
    var doc = document.implementation.createDocument(null, null, null);
    var week = doc.createElement('week_program');
    week.setAttribute('state', weekProgramState);

    var day, switches;
    for (var key in weeklyProgram) {
        day = doc.createElement('day');
        day.setAttribute('name', key);
        var type, state, time;
        var dayCounter = 0;
        var nightCounter = 0;
        for (var i in weeklyProgram[key].switches) {
            switches = doc.createElement('switch');
            type = weeklyProgram[key].switches[i].type;
            state = weeklyProgram[key].switches[i].state;
            time = weeklyProgram[key].switches[i].time;
            if (type === 'night' && state === 'on' && (time == '24:00' || time == '00:00')) continue;

            switches.setAttribute('type', type);
            switches.setAttribute('state', state);
            switches.appendChild(doc.createTextNode(time));
            if (type === 'day') {
                dayCounter++;
            } else {
                nightCounter++;
            }
            day.appendChild(switches);
        }
        day = fillMissingSwitches(dayCounter, nightCounter, day, doc);
        week.appendChild(day);
    }
    doc.appendChild(week);

    $.ajax({
        type: "put",
        url: BASE_URL + 'weekProgram/',
        contentType: 'application/xml',
        data: new XMLSerializer().serializeToString(doc),
        // async: false,
    });
}

function saveDayTemperature(temp) {
    var doc = document.implementation.createDocument(null, null, null);
    var day_temp = doc.createElement('day_temperature');
    day_temp.appendChild(doc.createTextNode(temp));
    doc.appendChild(day_temp);

    $.ajax({
        type: "put",
        url: BASE_URL + 'dayTemperature/',
        contentType: 'application/xml',
        data: new XMLSerializer().serializeToString(doc)
        // async: false,
    });
}

function saveNightTemperature(temp) {
    var doc = document.implementation.createDocument(null, null, null);
    var night_temp = doc.createElement('night_temperature');
    night_temp.appendChild(doc.createTextNode(temp));
    doc.appendChild(night_temp);

    $.ajax({
        type: "put",
        url: BASE_URL + 'nightTemperature/',
        contentType: 'application/xml',
        data: new XMLSerializer().serializeToString(doc)
        // async: false,
    });
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
        }
        //Not sure if works
        // weekProgramJSON[currentDay].switches.sort(sortByTime);
    }
    // console.log(weekProgramJSON)
}

function fillMissingSwitches(dayCounter, nightCounter, day, doc) {
    for (var i = dayCounter; i < 5; i++) {
        switches = doc.createElement('switch');
        switches.setAttribute('type', 'day');
        switches.setAttribute('state', 'off');
        switches.appendChild(doc.createTextNode('00:00'));
        day.appendChild(switches);
    }
    for (var j = nightCounter; j < 5; j++) {
        switches = doc.createElement('switch');
        switches.setAttribute('type', 'night');
        switches.setAttribute('state', 'off');
        switches.appendChild(doc.createTextNode('00:00'));
        day.appendChild(switches);
    }
    console.log(day);
    return day;
}


function mergeProgram() {
    var first, second;
    for (var key in weekProgramJSON) {
        weekProgramJSON[key].switches.sort(sortByTime);
        for (var i = 0; i < weekProgramJSON[key].switches.length - 2 ; i++) {
            first = weekProgramJSON[key].switches[i];
            second = weekProgramJSON[key].switches[i + 1];
            if (second.type === first.type) {
                weekProgramJSON[key].switches.splice(i + 1, 1);
            }
        }
    }
}

function sortByTime(a, b) {
    var aTime = a.time;
    var bTime = b.time;
    return ((aTime < bTime) ? -1 : ((aTime > bTime) ? 1 : 0));
}