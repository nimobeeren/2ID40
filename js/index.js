var knob, container, slider, upButton, downButton, vacationSwitch, timeline;
var sliderTempIncrement = 0.5;
var buttonTempIncrement = 0.1;
var buttonTimeout = 400;
var buttonInterval = 200;

// Refresh data and create thermostat if necessary
api.initialize();

window.onload = function () {
    knob = document.getElementById('temp-knob');
    container = document.getElementById('slider-container');
    slider = document.getElementById('temp-slider');
    upButton = document.getElementById('temp-up');
    downButton = document.getElementById('temp-down');
    vacationSwitch = document.getElementById('vacation-switch');
    timeline = document.getElementById('timeline');

    // Refresh data periodically
    refresh();
    setInterval(refresh, refreshTime);

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
        // TODO: What happens when the user is touching in multiple places and releases one?
        knobHold = false;
        buttonHold = false;
        document.documentElement.style.cursor = 'auto';
        setTargetTemperature(targetTemperature);
        api.setTargetTemperature(targetTemperature);
    });

    /*
     Vacation switch
     */
    vacationSwitch.addEventListener('change', function (e) {
        var vacationMode = vacationSwitch.checked;
        weekProgramState = !vacationMode;
        api.setWeekProgramState(!vacationMode);
        refreshUI();
    });
};

/**
 * Sets UI elements to their corresponding values
 */
function refreshUI() {
    setBackground(calcBackground());
    setTimeline(dayProgram, timeline);

    setCurrentDay(day);
    setCurrentTime(time);
    setCurrentTemperature(currentTemperature);
    setTargetTemperature(targetTemperature);
    setDayTemperature(dayTemperature);
    setNightTemperature(nightTemperature);
    setWeekProgramState(weekProgramState);
}

/**
 * Moves knob and sets temperature when knob is moved by user
 * @param event {MouseEvent/TouchEvent}
 */
function onKnobMove(event) {
    if (knobHold) {
        event.preventDefault();
        document.documentElement.style.cursor = 'pointer';

        var centerX = container.offsetLeft + container.offsetWidth / 2;
        var centerY = container.offsetTop + container.offsetHeight / 2;

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
        refreshUI();
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
        var i = setInterval(function () {
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
        var i = setInterval(function () {
            if (buttonHold) {
                bumpDownTargetTemperature();
            } else {
                clearInterval(i);
            }
        }, buttonInterval);
    }, buttonTimeout);
}

/**
 * Places the knob in a position on the slider, determined by an angle
 * @param ang {number} angle between 45 and 315 degrees, where 45 is the bottom-left
 * 315 is the bottom-right of the slider
 */
function setKnob(ang) {
    var borderWidth = window.getComputedStyle(slider).getPropertyValue('border-top-width').slice(0, -2);
    var radius = slider.offsetWidth / 2 - borderWidth / 2;

    // Calculate knob position relative to center
    var X = Math.round(radius * -Math.sin(ang * Math.PI / 180));
    var Y = Math.round(radius * Math.cos(ang * Math.PI / 180));

    // Apply absolute knob position
    knob.style.left = container.offsetWidth / 2 - knob.offsetWidth / 2 + X + 'px';
    knob.style.top = container.offsetHeight / 2 - knob.offsetHeight / 2 + Y + 'px';
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

    if (weekProgramState) {
        line.style.display = 'block';
    } else {
        line.style.display = 'none';
    }
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

    if (weekProgramState) {
        line.style.display = 'block';
    } else {
        line.style.display = 'none';
    }
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
    setTimeout(function () {
        line.style.transition = '1s linear';
    }, 500);

    if (temp === Math.round(temp)) {
        temp = temp + '.0';
    }
    tempLabel.innerHTML = temp + '&deg;';
}

function setCurrentTime(time) {
    var timeLabel = document.getElementById('current-time');
    timeLabel.innerHTML = time;

    var line = document.getElementById('time-indicator');
    line.style.left = parseTime(time) / 24 * 100 + '%';

    if (weekProgramState) {
        line.style.display = 'flex';
    } else {
        line.style.display = 'none';
    }
}

function setCurrentDay(day) {
    var dayLabel = document.getElementById('current-day');
    dayLabel.innerHTML = day;
}

function setWeekProgramState(state) {
    vacationSwitch.checked = !state;
}

/*
Utility functions
 */

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