var api = {
    BASE_URL: 'http://wwwis.win.tue.nl/2id40-ws/11/',
    MAX_REQUEST_TIME: 1000,

    response: null,
    day: null,
    time: null,
    currentTemperature: null,
    targetTemperature: null,
    dayTemperature: null,
    nightTemperature: null,
    weekProgramState: null,
    weekProgram: null,

    lastUpdate: 0,

    initialize: function () {
        $.ajax({
            url: api.BASE_URL,
            type: 'PUT',
            contentType: 'application/xml',
            async: false,
            success: function (response) {
                response = $(response).find('response')[0].innerHTML;
                if (response === 'OK') {
                    console.log('Thermostat found');
                } else if (response === 'Created') {
                    console.log('Thermostat created');
                } else {
                    console.log(response);
                }
            }
        });
    },

    refresh: function () {
        // Make sure we don't refresh too often
        var t = new Date().getTime();
        if (t - api.lastUpdate < api.MAX_REQUEST_TIME) {
            return;
        }
        api.lastUpdate = t;

        // Get data from server
        $.get({
            url: api.BASE_URL,
            async: false,
            success: function (response) {
                api.response = response;
                api.day = $(response).find('current_day')[0].innerHTML;
                api.time = $(response).find('time')[0].innerHTML;
                api.currentTemperature = $(response).find('current_temperature')[0].innerHTML;
                api.targetTemperature = $(response).find('target_temperature')[0].innerHTML;
                api.dayTemperature = $(response).find('day_temperature')[0].innerHTML;
                api.nightTemperature = $(response).find('night_temperature')[0].innerHTML;
                api.weekProgramState = $(response).find("week_program").attr("state");
                api.weekProgram = api.parseWeekProgram(response);
            }
        });
    },

    getDay: function () {
        api.refresh();
        return api.day;
    },

    getTime: function () {
        api.refresh();
        return api.time;
    },

    getCurrentTemperature: function () {
        api.refresh();
        return api.currentTemperature;
    },

    getTargetTemperature: function () {
        api.refresh();
        return api.targetTemperature;
    },

    getDayTemperature: function () {
        api.refresh();
        return api.dayTemperature;
    },

    getNightTemperature: function () {
        api.refresh();
        return api.nightTemperature;
    },

    getWeekProgramState: function () {
        api.refresh();
        return api.weekProgramState === 'on';
    },

    getDayProgram: function (day) {
        api.refresh();
        return api.weekProgram[day];
    },

    getWeekProgram: function () {
        api.refresh();
        return api.weekProgram;
    },

    setTargetTemperature: function (target) {
        $.ajax({
            type: "put",
            url: api.BASE_URL + 'targetTemperature/',
            contentType: 'application/xml',
            data: '<target_temperature>' + target + '</target_temperature>',
            async: false
        });
    },

    setDayProgram: function (day, dayProgram) {
        var weekProgram = api.getWeekProgram();
        weekProgram[day] = dayProgram;
        api.setWeekProgram(weekProgram);
    },

    setWeekProgram: function (program) {
        program = api.mergeProgram(program);
        var doc = document.implementation.createDocument(null, null, null);
        var week = doc.createElement('week_program');
        week.setAttribute('state', (weekProgramState) ? 'on' : 'off');
        var dayElement, switches;
        for (var day in program) {
            // console.log(program[day].switches);
            dayElement = doc.createElement('day');
            dayElement.setAttribute('name', day);
            var type, state, time;
            var dayCounter = 0;
            var nightCounter = 0;
            for (var i in program[day].switches) {
                switches = doc.createElement('switch');
                type = program[day].switches[i].type;
                state = program[day].switches[i].state;
                time = program[day].switches[i].time;
                if (type === 'night' && state === 'on' && (time === '24:00' || time === '00:00')) continue;

                switches.setAttribute('type', type);
                switches.setAttribute('state', state);
                switches.appendChild(doc.createTextNode(time));
                if (type === 'day') {
                    dayCounter++;
                } else {
                    nightCounter++;
                }
                dayElement.appendChild(switches);
            }
            dayElement = api.fillMissingSwitches(dayCounter, nightCounter, dayElement, doc);
            week.appendChild(dayElement);
        }
        doc.appendChild(week);

        $.ajax({
            type: "put",
            url: api.BASE_URL + 'weekProgram/',
            contentType: 'application/xml',
            data: new XMLSerializer().serializeToString(doc)
            // async: false,
        });
    },

    setDayTemperature: function (temp) {
        var doc = document.implementation.createDocument(null, null, null);
        var day_temp = doc.createElement('day_temperature');
        day_temp.appendChild(doc.createTextNode(temp));
        doc.appendChild(day_temp);

        $.ajax({
            type: "put",
            url: api.BASE_URL + 'dayTemperature/',
            contentType: 'application/xml',
            data: new XMLSerializer().serializeToString(doc)
            // async: false,
        });
    },

    setNightTemperature: function (temp) {
        var doc = document.implementation.createDocument(null, null, null);
        var night_temp = doc.createElement('night_temperature');
        night_temp.appendChild(doc.createTextNode(temp));
        doc.appendChild(night_temp);

        $.ajax({
            type: "put",
            url: api.BASE_URL + 'nightTemperature/',
            contentType: 'application/xml',
            data: new XMLSerializer().serializeToString(doc)
            // async: false,
        });
    },

    setWeekProgramState: function (isOn) {
        var state = (isOn) ? 'on' : 'off';
        $.ajax({
            type: "put",
            url: api.BASE_URL + 'weekProgramState/',
            contentType: 'application/xml',
            data: '<week_program_state>' + state + '</week_program_state>'
            // async: false,
        });
    },

    /*
     Utility functions
     */

    parseWeekProgram: function (xml) {
        var program = {};
        $(xml).find('day').each(function() {
            var day = $(this).attr('name');
            program[day] = [];
            $(this).find('switch').each(function() {
                if ($(this).attr('state') === 'on') {
                    if ($(this).attr('type') === 'day') {
                        program[day].push([$(this).text(), '00:00']);
                    } else {
                        program[day][program[day].length - 1][1] = $(this).text();
                    }
                }
            })
        });
        return program;
    },

    fillMissingSwitches: function (dayCounter, nightCounter, dayElement, doc) {
        for (var i = dayCounter; i < 5; i++) {
            switches = doc.createElement('switch');
            switches.setAttribute('type', 'day');
            switches.setAttribute('state', 'off');
            switches.appendChild(doc.createTextNode('00:00'));
            dayElement.appendChild(switches);
        }
        for (var j = nightCounter; j < 5; j++) {
            switches = doc.createElement('switch');
            switches.setAttribute('type', 'night');
            switches.setAttribute('state', 'off');
            switches.appendChild(doc.createTextNode('00:00'));
            dayElement.appendChild(switches);
        }
        return dayElement;
    },

    mergeProgram: function (program) {
        var first, second;
        for (var currentDay in program) {
            program[currentDay].switches.sort(api.sortByTime);
            for (var i = 0; i < program[currentDay].switches.length - 2; i++) {
                first = program[currentDay].switches[i];
                second = program[currentDay].switches[i + 1];
                if (second.type === first.type) {
                    program[currentDay].switches.splice(i + 1, 1);
                }
            }
        }
        return program;
    },

    sortByTime: function (a, b) {
        return a.time - b.time;
    }
};
