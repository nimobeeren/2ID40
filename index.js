var knob, slider, buttonUp, buttonDown;
var centerX, centerY;
var mdown = false;
var minTemp = 5;
var maxTemp = 30;
var sliderTempIncrement = 0.5;
var buttonTempIncrement = 0.1;

// Get day and night temperature
var dayTemperature = 21.5; // TODO: Get from server
var nightTemperature = 18; // TODO: Get from server
var dayProgram = {         // TODO: Get from server
    "switches": [
        {
            "type": "day",
            "state": "on",
            "time": "07:00"
        },
        {
            "type": "night",
            "state": "on",
            "time": "10:00"
        },
        {
            "type": "day",
            "state": "on",
            "time": "16:00"
        },
        {
            "type": "night",
            "state": "on",
            "time": "22:00"
        }
    ]
};

window.onload = function () {
    knob = document.getElementById('temp-knob');
    slider = document.getElementById('temp-slider');
    buttonUp = document.getElementById('temp-up');
    buttonDown = document.getElementById('temp-down');
    centerX = knob.offsetLeft + knob.offsetWidth / 2;
    centerY = knob.offsetTop + knob.offsetHeight / 2;

    // Set UI elements to their corresponding values
    setKnob(temperatureToAngle(dayTemperature));
    setTemperature(dayTemperature);
    setDayTemperature(dayTemperature);
    setNightTemperature(nightTemperature);
    setDayProgram(dayProgram);

    // Wire up mouse events for slider
    knob.addEventListener('mousedown', function (e) {
        e.preventDefault();
        mdown = true;
    });
    document.addEventListener('mouseup', function (e) {
        mdown = false;
        document.documentElement.style.cursor = 'auto';
    });
    document.addEventListener('mousemove', dragOrSwipe);

    // Wire up touch events for slider
    knob.addEventListener('touchstart', function (e) {
        mdown = true;
        e.preventDefault();
    });
    document.addEventListener('touchend', function (e) {
        mdown = false;
        document.documentElement.style.cursor = 'auto';
    });
    document.addEventListener('touchmove', dragOrSwipe);

    // Wire up buttons
    buttonUp.addEventListener('click', smallIncreaseTemp);
    buttonDown.addEventListener('click', smallDecreaseTemp);
};

/**
 * Moves knob and sets temperature when knob is moved by user
 * @param event {MouseEvent/TouchEvent}
 */
function dragOrSwipe(event) {
    if (mdown) {
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
        setTemperature(angleToTemperature(ang));
    }
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
 * Gets the temperature which the thermostst is supposed to keep
 * @returns {number}
 */
function getTemperature() {
    var setTemp = document.getElementById('set-temp-value');
    return parseFloat(setTemp.innerHTML);
}

/**
 * Sets the temperature which the thermostst is supposed to keep
 * @param temp
 */
function setTemperature(temp) {
    var setTemp = document.getElementById('set-temp-value');
    temp = Math.round(temp * 10) / 10;
    if (temp === Math.round(temp)) {
        temp = temp + '.0';
    }
    setTemp.innerHTML = temp + "&deg;";
}

/**
 * Increases the set temperature by the amount buttonTempIncrement, making sure the knob
 * is in the correct position
 * @param event {MouseEvent/TouchEvent} (optional) parameters for the clicking/touching event
 */
function smallIncreaseTemp(event) {
    event && event.preventDefault();
    var temp = getTemperature();
    temp += buttonTempIncrement;
    if (temp > maxTemp) {
        temp = maxTemp
    }
    setTemperature(temp);
    setKnob(temperatureToAngle(temp));
}

/**
 * Decreases the set temperature by the amount buttonTempIncrement, making sure the knob
 * is in the correct position
 * @param event {MouseEvent/TouchEvent} (optional) parameters for the clicking/touching event
 */
function smallDecreaseTemp(event) {
    event && event.preventDefault();
    var temp = getTemperature();
    temp -= buttonTempIncrement;
    if (temp < minTemp) {
        temp = minTemp
    }
    setTemperature(temp);
    setKnob(temperatureToAngle(temp));
}

function setDayTemperature(temp) {
    var line = document.getElementById('temp-line-day');
    var icon = line.getElementsByTagName('img')[0];
    var borderWidth = window.getComputedStyle(slider).getPropertyValue('border-top-width').slice(0, -2);
    var radius = (slider.offsetWidth - borderWidth) / 2;

    var ang = temperatureToAngle(temp);
    line.style.transform = 'rotate(' + ang + 'deg) translate(0, ' + radius + 'px)';
    icon.style.transform = 'rotate(-' + ang + 'deg)';
}

function setNightTemperature(temp) {
    var line = document.getElementById('temp-line-night');
    var icon = line.getElementsByTagName('img')[0];
    var borderWidth = window.getComputedStyle(slider).getPropertyValue('border-top-width').slice(0, -2);
    var radius = (slider.offsetWidth - borderWidth) / 2;

    var ang = temperatureToAngle(temp);
    line.style.transform = 'rotate(' + ang + 'deg) translate(0, ' + radius + 'px)';
    icon.style.transform = 'rotate(-' + ang + 'deg)';
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
    if (!switches || switches.length === 0) {
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
            label.classList.add('timeline__label');
            label.innerHTML = startTime;
            part.appendChild(label);
        }

        // Add the part to the timeline
        timeline.appendChild(part);
    }
}
