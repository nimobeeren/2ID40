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
        // no-op
    },

    refresh: function () {
        // Make sure we don't refresh too often
        var t = new Date().getTime();
        if (t - api.lastUpdate < api.MAX_REQUEST_TIME) {
            return;
        }
        api.lastUpdate = t;

        api.day = "Thursday"
        api.time = "11:00"
        api.currentTemperature = "20"
        api.targetTemperature = "22"
        api.dayTemperature = "21"
        api.nightTemperature = "18"
        api.weekProgramState = "on"
        api.weekProgram = {
            Monday: [],
            Tuesday: [],
            Wednesday: [],
            Thursday: [["9:00", "12:00"], ["16:00", "21:00"]],
            Friday: [],
            Saturday: [],
            Sunday: []
        }
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
        return api.sortMergeProgram(api.weekProgram[day]);
    },

    getWeekProgram: function () {
        api.refresh();
        return api.weekProgram;
    },

    setTargetTemperature: function (target) {
        // $.ajax({
        //     type: "put",
        //     url: api.BASE_URL + 'targetTemperature/',
        //     contentType: 'application/xml',
        //     data: '<target_temperature>' + target + '</target_temperature>',
        //     async: false
        // });
    },

    setDayProgram: function (day, dayProgram) {
        var weekProgram = api.getWeekProgram();
        weekProgram[day] = dayProgram;
        api.setWeekProgram(weekProgram);
    },

    setWeekProgram: function (weekProgram) {
        var doc = document.implementation.createDocument(null, null, null);
        var program = doc.createElement('week_program');
        program.setAttribute('state', api.weekProgramState ? 'on' : 'off');
        for (var key in weekProgram) {
            if (!weekProgram.hasOwnProperty(key)) continue;

            // Make sure the day program is sorted and not overlapping
            weekProgram[key] = api.sortMergeProgram(weekProgram[key]);

            var day = doc.createElement('day');
            day.setAttribute('name', key);

            var daySwitches = [];
            var nightSwitches = [];

            var i, text, sw;
            var periods = weekProgram[key];
            for (i = 0; i < periods.length; i++) {
                daySwitches.push(periods[i][0]);
                nightSwitches.push(periods[i][1]);
            }

            for (i = 0; i < 5; i++) {
                sw = doc.createElement('switch');
                sw.setAttribute('type', 'day');

                if (i < daySwitches.length) {
                    sw.setAttribute('state', 'on');
                    text = doc.createTextNode(daySwitches[i]);
                } else {
                    sw.setAttribute('state', 'off');
                    text = doc.createTextNode('00:00');
                }
                sw.appendChild(text);
                day.appendChild(sw);
            }

            for (i = 0; i < 5; i++) {
                sw = doc.createElement('switch');
                sw.setAttribute('type', 'night');

                if (i < nightSwitches.length) {
                    sw.setAttribute('state', 'on');
                    text = doc.createTextNode(nightSwitches[i]);
                } else {
                    sw.setAttribute('state', 'off');
                    text = doc.createTextNode('00:00');
                }
                sw.appendChild(text);
                day.appendChild(sw);
            }
            program.appendChild(day);
        }
        doc.appendChild(program);

        // $.ajax({
        //     type: "put",
        //     url: api.BASE_URL + 'weekProgram/',
        //     contentType: 'application/xml',
        //     data: new XMLSerializer().serializeToString(doc),
        //     async: false
        // });
    },

    setDayTemperature: function (temp) {
        var doc = document.implementation.createDocument(null, null, null);
        var day_temp = doc.createElement('day_temperature');
        day_temp.appendChild(doc.createTextNode(temp));
        doc.appendChild(day_temp);

        // $.ajax({
        //     type: "put",
        //     url: api.BASE_URL + 'dayTemperature/',
        //     contentType: 'application/xml',
        //     data: new XMLSerializer().serializeToString(doc),
        //     async: false
        // });
    },

    setNightTemperature: function (temp) {
        var doc = document.implementation.createDocument(null, null, null);
        var night_temp = doc.createElement('night_temperature');
        night_temp.appendChild(doc.createTextNode(temp));
        doc.appendChild(night_temp);

        // $.ajax({
        //     type: "put",
        //     url: api.BASE_URL + 'nightTemperature/',
        //     contentType: 'application/xml',
        //     data: new XMLSerializer().serializeToString(doc),
        //     async: false
        // });
    },

    setWeekProgramState: function (isOn) {
        var state = (isOn) ? 'on' : 'off';
        // $.ajax({
        //     type: "put",
        //     url: api.BASE_URL + 'weekProgramState/',
        //     contentType: 'application/xml',
        //     data: '<week_program_state>' + state + '</week_program_state>',
        //     async: false
        // });
    },

    /*
     Utility functions
     */

    parseWeekProgram: function (xml) {
        var program = {};
        $(xml).find('day').each(function () {
            var day = $(this).attr('name');
            program[day] = [];
            $(this).find('switch').each(function () {
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

    sortMergeProgram: function (program) {
        program.sort(function (a, b) {
            return parseTime(a[0]) - parseTime(b[0])
        });
        for (var i = 0; i < program.length - 1; i++) {
            if (parseTime(program[i][1]) >= parseTime(program[i + 1][0])) {
                var start = (program[i][0]);
                var end = (parseTime(program[i][1]) > parseTime(program[i + 1][1])) ? program[i][1] : program[i + 1][1];
                program.splice(i, 2);
                program.push([start, end]);
                program = api.sortMergeProgram(program);
                break;
            }
        }
        return program;
    }
};
