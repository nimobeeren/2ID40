const minTemp = 5;
const maxTemp = 30;
const dayColor = '#64b5f6';
const nightColor = '#1a237e';

var knobHold = false;
var buttonHold = false;

var day, time, currentTemperature, dayTemperature, nightTemperature, weekProgramState, dayProgram, targetTemperature;

/**
 * Updates UI elements with recent data from server
 */
function refresh() {
    // Get data from server
    day = api.getDay();
    time = api.getTime();
    currentTemperature = api.getCurrentTemperature();
    dayTemperature = api.getDayTemperature();
    nightTemperature = api.getNightTemperature();
    weekProgramState = api.getWeekProgramState();
    dayProgram = api.getDayProgram(day);

    if (!knobHold && !buttonHold) {
        targetTemperature = api.getTargetTemperature();
    }

    if (typeof refreshUI === 'function') {
        refreshUI();
    }
}

/**
 * Creates a timeline
 * @param program {object} an array of timespans where the heating is turned on
 * @param timeline {Element} a timeline div
 */
function setTimeline(program, timeline) {
    var part, label;

    // Remove all timeline parts
    var parts = timeline.querySelectorAll('.timeline__part');
    Array.prototype.forEach.call(parts, function(part) {
        part.parentNode.removeChild(part);
    });

    // Indicate vacation mode
    if (!weekProgramState) {
        // Add a disabled timeline part
        part = document.createElement('div');
        part.classList.add('timeline__part');
        part.classList.add('part--disabled');
        timeline.appendChild(part);
        return;
    }

    // If there are no day parts, show a single night part
    if (program.length === 0) {
        part = document.createElement('div');
        part.classList.add('timeline__part');
        part.classList.add('part--night');
        part.style.flexGrow = 1;

        label = document.createElement('div');
        label.classList.add('timeline__label');
        label.classList.add('label--start');
        label.innerHTML = '00:00';
        part.appendChild(label);

        label = document.createElement('div');
        label.classList.add('timeline__label');
        label.classList.add('label--end');
        label.innerHTML = '24:00';
        part.appendChild(label);

        timeline.appendChild(part);
        return;
    }

    // first night part
    part = document.createElement('div');
    part.classList.add('timeline__part');
    part.classList.add('part--night');
    part.style.flexGrow = parseTime(program[0][0]);
    if (part.style.flexGrow > 0) {
        timeline.appendChild(part);
    }

    // all other parts
    for (var i = 0; i < program.length; i++) {
        // day part
        part = document.createElement('div');
        part.classList.add('timeline__part');
        part.classList.add('part--day');
        part.style.flexGrow = parseTime(program[i][1]) - parseTime(program[i][0]);

        label = document.createElement('div');
        label.classList.add('timeline__label');
        if (program[i][0] === '00:00') {
            label.classList.add('label--start');
        } else {
            label.classList.add('label--day');
        }
        label.innerHTML = program[i][0];
        part.appendChild(label);

        if (part.style.flexGrow > 0) {
            timeline.appendChild(part);
        }

        // night part
        part = document.createElement('div');
        part.classList.add('timeline__part');
        part.classList.add('part--night');
        if (i === program.length - 1) {
            part.style.flexGrow = parseTime('24:00') - parseTime(program[i][1]);
        } else {
            part.style.flexGrow = parseTime(program[i + 1][0]) - parseTime(program[i][1]);
        }

        label = document.createElement('div');
        label.classList.add('timeline__label');
        if (program[i][1] === '24:00') {
            label.classList.add('label--end');
        } else {
            label.classList.add('label--night');
        }
        label.innerHTML = program[i][1];
        part.appendChild(label);

        if (part.style.flexGrow > 0) {
            timeline.appendChild(part);
        }
    }
}

/**
 * Sets the background of the body
 * @param color {string} any CSS accepted value for background-color
 */
function setBackground(color) {
    document.getElementsByTagName('body')[0].style.backgroundColor = color;
}

/*
Utility functions
 */

function calcBackground() {
    if (weekProgramState) {
        var amount;
        if (dayTemperature >= nightTemperature) {
            if (targetTemperature >= dayTemperature) {
                return dayColor;
            } else if (targetTemperature <= nightTemperature) {
                return nightColor;
            } else {
                amount = (targetTemperature - nightTemperature) / (dayTemperature - nightTemperature);
                return lerpColor(nightColor, dayColor, amount);
            }
        } else {
            if (targetTemperature >= nightTemperature) {
                return nightColor;
            } else if (targetTemperature <= dayTemperature) {
                return dayColor;
            } else {
                amount = (targetTemperature - dayTemperature) / (nightTemperature - dayTemperature);
                return lerpColor(dayColor, nightColor, amount);
            }
        }
    } else {
        return dayColor;
    }
}

/**
 * Interpolates between two colors
 * @param a {string} color in #hex format
 * @param b {string} color in #hex format
 * @param amount {number} in range [0, 1]
 * @returns {string}
 */
function lerpColor(a, b, amount) {
    var ah = parseInt(a.replace(/#/g, ''), 16),
        ar = ah >> 16, ag = ah >> 8 & 0xff, ab = ah & 0xff,
        bh = parseInt(b.replace(/#/g, ''), 16),
        br = bh >> 16, bg = bh >> 8 & 0xff, bb = bh & 0xff,
        rr = ar + amount * (br - ar),
        rg = ag + amount * (bg - ag),
        rb = ab + amount * (bb - ab);

    return '#' + ((1 << 24) + (rr << 16) + (rg << 8) + rb | 0).toString(16).slice(1);
}

function parseTime(t) {
    return parseFloat(t.substr(0, 2)) + parseFloat(t.substr(3, 2)) / 60;
}