var knob, slider, upButton, downButton;
var centerX, centerY;
var knobHold = false;
var buttonHold = false;
var minTemp = 5;
var maxTemp = 30;
var sliderTempIncrement = 0.5;
var buttonTempIncrement = 0.1;
var buttonTimeout = 400;
var buttonInterval = 200;
var intValUp, intValDown;

// Get day and night temperature
var day = api.getDay();
var time = api.getTime();
var currentTemperature = api.getCurrentTemperature();
var targetTemperature = api.getTargetTemperature();
var dayTemperature = api.getDayTemperature();
var nightTemperature = api.getNightTemperature();
var weekProgramState = api.getWeekProgramState();
var dayProgram = api.getDayProgram(day);

// Refresh data and create thermostat if necessary
api.initialize();

window.onload = function () {
    knob = document.getElementById('temp-knob');
    slider = document.getElementById('temp-slider');
    upButton = document.getElementById('temp-up');
    downButton = document.getElementById('temp-down');
    centerX = knob.offsetLeft + knob.offsetWidth / 2;
    centerY = knob.offsetTop + knob.offsetHeight / 2;
    refresh();

    /*
    Slider
     */
    knob.addEventListener('mousedown', function (e) {
        e.preventDefault();
        knobHold = true;
    });
    knob.addEventListener('touchstart', function (e) {
        e.preventDefault();
        knobHold = true;
    });

    document.addEventListener('mousemove', onKnobMove);
    document.addEventListener('touchmove', onKnobMove);

    /*
    Buttons
     */
    upButton.addEventListener('mousedown', onUpButton);
    upButton.addEventListener('touchstart', onUpButton);
    downButton.addEventListener('mousedown', onDownButton);
    downButton.addEventListener('touchstart', onDownButton);

    /*
    Slider and buttons
    */
    document.addEventListener('mouseup', function (e) {
        knobHold = false;
        buttonHold = false;
        document.documentElement.style.cursor = 'auto';
        setTargetTemperature(targetTemperature);
        api.setTargetTemperature(targetTemperature);
    });
    document.addEventListener('touchend', function (e) {
        knobHold = false;
        buttonHold = false;
        document.documentElement.style.cursor = 'auto';
        setTargetTemperature(targetTemperature);
        api.setTargetTemperature(targetTemperature);
    });

    // Set interval for refreshing data
    setInterval(refresh, 2000);
};

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

    // Set UI elements to their corresponding values
    setCurrentDay(day);
    setCurrentTime(time);
    setCurrentTemperature(currentTemperature);
    setTargetTemperature(targetTemperature);
    setDayTemperature(dayTemperature);
    setNightTemperature(nightTemperature);
    if (weekProgramState === 'on') {
        setDayProgram(dayProgram);
    } else {
        setDayProgram(null);
    }
}

/**
 * Moves knob and sets temperature when knob is moved by user
 * @param event {MouseEvent/TouchEvent}
 */
function onKnobMove(event) {
    if (knobHold) {
        event.preventDefault();
        document.documentElement.style.cursor = 'pointer';

        var a;
        if (event.touches) {
            a = Math.atan2(centerX - event.touches[0].clientX, centerY - event.touches[0].clientY);
        } else {
            a = Math.atan2(centerX - event.clientX, centerY - event.clientY);
        }

        var ang = -a / (Math.PI / 180) + 180; // final (0-360 positive) degrees from straight down

        // Make sure the knob stays on the slider
        if (ang < 45) {
            ang = 45;
        } else if (ang > 315) {
            ang = 315;
        }

        // Make the knob move in increments of 0.5 temperature degrees
        var angIncrement = 270 / (maxTemp - minTemp) * sliderTempIncrement;
        ang = 45 + Math.round((ang - 45) / angIncrement) * angIncrement;

        // Move knob to correct position
        setKnob(ang);
        setTargetTemperature(angleToTemperature(ang));
    }
}

/**
 * Increases target temperature in small steps until the button is released
 * @param event
 */
function onUpButton(event) {
    event.preventDefault();
    buttonHold = true;
    bumpUpTargetTemperature();
    setTimeout(function () {
        var i = setInterval(function() {
            if (buttonHold) {
                bumpUpTargetTemperature();
            } else {
                clearInterval(i);
            }
        }, buttonInterval);
    }, buttonTimeout);
}

/**
 * Decreases target temperature in small steps until the button is released
 * @param event
 */
function onDownButton(event) {
    event.preventDefault();
    buttonHold = true;
    bumpDownTargetTemperature();
    setTimeout(function () {
        var i = setInterval(function() {
            if (buttonHold) {
                bumpDownTargetTemperature();
            } else {
                clearInterval(i);
            }
        }, buttonInterval);
    }, buttonTimeout);
}

/**
 * Maps an angle representing the position of the knob on the radial slider, to a
 * temperature in the allowed range
 * @param ang {number} an angle between 45 and 315 degrees
 * @returns {number} a temperature between minTemp and maxTemp
 */
function angleToTemperature(ang) {
    return (ang - 45) / 270 * (maxTemp - minTemp) + minTemp;
}

/**
 * Maps a temperature to an angle representing the position of the knob on the cirular
 * slider
 * @param temp {number} a temperature between minTemp and maxTemp
 * @returns {number} an angle between 45 and 315 degrees
 */
function temperatureToAngle(temp) {
    return (temp - minTemp) / (maxTemp - minTemp) * 270 + 45;
}

/**
 * Places the knob in a position on the slider, determined by an angle
 * @param ang {number} angle between 45 and 315 degrees, where 45 is the bottom-left
 * 315 is the bottom-right of the slider
 */
function setKnob(ang) {
    var borderWidth = window.getComputedStyle(slider).getPropertyValue('border-top-width').slice(0, -2);
    var radius = (slider.offsetWidth - borderWidth) / 2;

    // Calculate knob position relative to center
    var X = Math.round(radius * -Math.sin(ang * Math.PI / 180));
    var Y = Math.round(radius * Math.cos(ang * Math.PI / 180));

    // Apply absolute knob position
    knob.style.left = centerX - knob.offsetWidth / 2 + X + 'px';
    knob.style.top = centerY - knob.offsetHeight / 2 + Y + 'px';
}

/**
 * Sets the temperature which the thermostst is supposed to keep
 * @param temp {number} target temperature
 */
function setTargetTemperature(temp) {
    var setTemp = document.getElementById('set-temp-value');

    temp = parseFloat(temp);
    targetTemperature = temp;

    // Make sure we are using 1 decimal
    temp = Math.round(temp * 10) / 10;
    if (temp === Math.round(temp)) {
        temp = temp + '.0';
    }

    // Set target label text
    setTemp.innerHTML = temp + "&deg;";

    // Set knob position if the user is not moving it
    if (!knobHold && !buttonHold) {
        setKnob(temperatureToAngle(targetTemperature));
    }
}

/**
 * Increases the set temperature by the amount buttonTempIncrement, making sure the knob
 * is in the correct position
 */
function bumpUpTargetTemperature() {
    var temp = targetTemperature;
    temp += buttonTempIncrement;
    if (temp > maxTemp) {
        temp = maxTemp;
    }
    setKnob(temperatureToAngle(temp));
    setTargetTemperature(temp);
}

/**
 * Decreases the set temperature by the amount buttonTempIncrement, making sure the knob
 * is in the correct position
 */
function bumpDownTargetTemperature() {
    var temp = targetTemperature;
    temp -= buttonTempIncrement;
    if (temp < minTemp) {
        temp = minTemp;
    }
    setKnob(temperatureToAngle(temp));
    setTargetTemperature(temp);
}

/**
 * Sets the temperature the thermostat is supposed to keep during a day period, when not overridden
 * Places the day indicator line in the right position on the radial slider
 * @param temp {number} day temperature
 */
function setDayTemperature(temp) {
    var line = document.getElementById('temp-line-day');
    var icon = line.getElementsByTagName('img')[0];
    var borderWidth = window.getComputedStyle(slider).getPropertyValue('border-top-width').slice(0, -2);
    var radius = (slider.offsetWidth - borderWidth) / 2;

    temp = parseFloat(temp);
    dayTemperature = temp;

    var ang = temperatureToAngle(temp);
    line.style.transform = 'rotate(' + ang + 'deg) translate(0, ' + radius + 'px)';
    icon.style.transform = 'rotate(-' + ang + 'deg)';
}

/**
 * Sets the temperature the thermostat is supposed to keep during a night period, when not overridden
 * Places the night indicator line in the right position on the radial slider
 * @param temp {number} day temperature
 */
function setNightTemperature(temp) {
    var line = document.getElementById('temp-line-night');
    var icon = line.getElementsByTagName('img')[0];
    var borderWidth = window.getComputedStyle(slider).getPropertyValue('border-top-width').slice(0, -2);
    var radius = (slider.offsetWidth - borderWidth) / 2;

    temp = parseFloat(temp);
    nightTemperature = temp;

    var ang = temperatureToAngle(temp);
    line.style.transform = 'rotate(' + ang + 'deg) translate(0, ' + radius + 'px)';
    icon.style.transform = 'rotate(-' + ang + 'deg)';
}

function setCurrentTemperature(temp) {
    var line = document.getElementById('temp-line-current');
    var tempLabel = document.getElementById('current-temp');
    var borderWidth = window.getComputedStyle(slider).getPropertyValue('border-top-width').slice(0, -2);
    var radius = (slider.offsetWidth - borderWidth) / 2;

    temp = parseFloat(temp);
    currentTemperature = temp;

    var ang = temperatureToAngle(temp);
    line.style.transform = 'rotate(' + ang + 'deg) translate(0, ' + radius + 'px)';

    if (temp === Math.round(temp)) {
        temp = temp + '.0';
    }
    tempLabel.innerHTML = temp + '&deg;';
}

function setCurrentTime(time) {
    var timeLabel = document.getElementById('current-time');
    timeLabel.innerHTML = time;
}

function setCurrentDay(day) {
    var dayLabel = document.getElementById('current-day');
    dayLabel.innerHTML = day;
}

/**
 * Creates a timeline
 * @param program {object} contains a set of switches in the following form:
 * {
 *       "switches": [
 *           {
 *               "type": "day|night",
 *               "state": "on|off",
 *               "time": "HH:MM"
 *           }
 *       ]
 *   }
 */
function setDayProgram(program) {
    var switches = program && program["switches"];
    var timeline = document.getElementById('timeline');
    var part;

    // Remove all switches which are turned off
    switches =
        switches && switches.filter(function (s) {
            return s["state"] === "on";
        });

    // If all switches are off, indicate vacation mode
    if (!switches || switches.length === 0 || weekProgramState !== 'on') {
        // Remove all timeline parts
        timeline.innerHTML = '';

        // Add a disabled timeline part
        part = document.createElement('div');
        part.classList.add('timeline__part');
        part.classList.add('part--disabled');
        timeline.appendChild(part);
        return;
    }

    // Sort switches by ascending time
    switches.sort(function (a, b) {
        if (a["time"].substr(0, 2) === b["time"].substr(0, 2)) {
            return a["time"].substr(3, 2) > b["time"].substr(3, 2);
        } else {
            return a["time"].substr(0, 2) > b["time"].substr(0, 2);
        }
    });

    // Add two extra switches to night mode at midnight, if not already present
    if (!switches.some(function (s) {
            return s["time"] === "00:00"
        })) {
        switches.unshift({
            "type": "night",
            "state": "on",
            "time": "00:00"
        });
    }
    if (!switches.some(function (s) {
            return s["time"] === "24:00"
        })) {
        switches.push({
            "type": "night",
            "state": "on",
            "time": "24:00"
        })
    }

    // Remove all timeline parts
    timeline.innerHTML = '';

    for (var i = 0; i < switches.length - 1; i++) {
        // Make a part that has the same type as the beginning switch
        part = document.createElement('div');
        part.classList.add('timeline__part');
        if (switches[i]["type"] === "day") {
            part.classList.add('part--day');
        } else {
            part.classList.add('part--night');
        }

        // Make the part last until the next switch
        var startTime = switches[i]["time"];
        var endTime = switches[i + 1]["time"];
        var startTimeMins = parseInt(startTime.substr(0, 2)) * 60 + parseInt(startTime.substr(3, 2));
        var endTimeMins = parseInt(endTime.substr(0, 2)) * 60 + parseInt(endTime.substr(3, 2));
        part.style.flexGrow = endTimeMins - startTimeMins;

        // For all but the first part, add a label with the starting time
        if (i !== 0) {
            var label = document.createElement('div');
            if (switches[i]["type"] === "day") {
                label.classList.add('timeline__label__day');
            } else if (switches[i]["type"] === "night") {
                label.classList.add('timeline__label__night');
            }
            label.innerHTML = startTime;
            part.appendChild(label);
        }

        // Add the part to the timeline
        timeline.appendChild(part);


    }
    //--------set current time-----
    var currentTimeVerticalLine = document.createElement('div');
    currentTimeVerticalLine.setAttribute('id', 'timeline-time');
    var currentPositionOfTime = ( parseInt(time.substr(0, 2)) * 60 + parseInt(time.substr(3, 2)) ) / 1440;
    var leftPosition = currentPositionOfTime * 100 - 0.5 + '%';
    currentTimeVerticalLine.style.left = leftPosition;
    timeline.appendChild(currentTimeVerticalLine);
    var topPosition = $(currentTimeVerticalLine).position().top - 8;

    $(currentTimeVerticalLine).css({top: topPosition});
}

function intervalUp() {
    intValUp = setInterval(bumpUpTargetTemperature, 100);
}

function intervalDown() {
    intValDown = setInterval(bumpDownTargetTemperature, 100);
}

function intclear() {
    clearInterval(intValUp);
    clearInterval(intValDown);
}
