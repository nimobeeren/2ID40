var minTemp = 5;
var maxTemp = 30;
var sliderTempIncrement = 0.5;
var buttonTempIncrement = 0.1;
var buttonTimeout = 400;
var buttonInterval = 200;
var dayTemperature, nightTemperature, weekProgramState, targetTemperature;
var buttonUpDay, buttonDownDay, buttonUpNight, buttonDownNight;
var sliderDay, sliderNight, knobDay, knobNight;
var knobDayHold = false;
var knobNightHold = false;
var buttonHold = false;
var dayColor = '#64b5f6';
var nightColor = '#1a237e';
var moveDay = false;
var moveNight = false;

window.onload = function () {
    buttonUpDay = document.getElementById('temp-up-day');
    buttonDownDay = document.getElementById('temp-down-day');
    buttonUpNight = document.getElementById('temp-up-night');
    buttonDownNight = document.getElementById('temp-down-night');
    sliderDay = document.getElementById('day-slider');
    sliderNight = document.getElementById('night-slider');
    knobDay = document.getElementById('day-slider-knob');
    knobNight = document.getElementById('night-slider-knob');

    // Set UI elements to their corresponding values
    dayTemperature = api.getDayTemperature();
    nightTemperature = api.getNightTemperature();
    weekProgramState = api.getWeekProgramState();
    targetTemperature = api.getTargetTemperature();
    setDayTemperature(dayTemperature);
    setNightTemperature(nightTemperature);

    // Set the background color based on current target temperature
    if (weekProgramState) {
        var amount;
        if (dayTemperature >= nightTemperature) {
            if (targetTemperature >= dayTemperature) {
                setBackground(dayColor);
            } else if (targetTemperature <= nightTemperature) {
                setBackground(nightColor);
            } else {
                amount = (targetTemperature - nightTemperature) / (dayTemperature - nightTemperature);
                setBackground(lerpColor(nightColor, dayColor, amount));
            }
        } else {
            if (targetTemperature >= nightTemperature) {
                setBackground(nightColor);
            } else if (targetTemperature <= dayTemperature) {
                setBackground(dayColor);
            } else {
                amount = (targetTemperature - dayTemperature) / (nightTemperature - dayTemperature);
                setBackground(lerpColor(dayColor, nightColor, amount));
            }
        }
    } else {
        setBackground(dayColor);
    }

    // If target is currently at day/night, move the target with it
    if (parseFloat(targetTemperature) === parseFloat(dayTemperature)) {
        moveDay = true;
    }
    if (parseFloat(targetTemperature) === parseFloat(nightTemperature)) {
        moveNight = true;
    }

    /*
     Sliders
     */
    var onday = function(e) {
        e.preventDefault();
        knobDayHold = true;
        onKnobMove(e);
    };
    var onnight = function (e) {
        e.preventDefault();
        knobNightHold = true;
        onKnobMove(e);
    };

    knobDay.addEventListener('mousedown', onday);
    knobDay.addEventListener('touchstart', onday);
    knobNight.addEventListener('mousedown', onnight);
    knobNight.addEventListener('touchstart', onnight);
    sliderDay.addEventListener('mousedown', onday);
    sliderDay.addEventListener('touchstart', onday);
    sliderNight.addEventListener('mousedown', onnight);
    sliderNight.addEventListener('touchstart', onnight);
    document.addEventListener('mousemove', onKnobMove);
    document.addEventListener('touchmove', onKnobMove);

    /*
     Buttons
     */
    buttonUpDay.addEventListener('mousedown', onButtonUpDay);
    buttonDownDay.addEventListener('mousedown', onButtonDownDay);
    buttonUpNight.addEventListener('mousedown', onButtonUpNight);
    buttonDownNight.addEventListener('mousedown', onButtonDownNight);
    buttonUpDay.addEventListener('touchstart', onButtonUpDay);
    buttonDownDay.addEventListener('touchstart', onButtonDownDay);
    buttonUpNight.addEventListener('touchstart', onButtonUpNight);
    buttonDownNight.addEventListener('touchstart', onButtonDownNight);

    /*
     Sliders and buttons
     */
    var onrelease = function (e) {
        knobDayHold = false;
        knobNightHold = false;
        buttonHold = false;
        document.documentElement.style.cursor = 'auto';
        setDayTemperature(dayTemperature);
        setNightTemperature(nightTemperature);
        api.setDayTemperature(dayTemperature);
        api.setNightTemperature(nightTemperature);
    };

    document.addEventListener('mouseup', onrelease);
    document.addEventListener('touchend', onrelease);
};

function onKnobMove(event) {
    var clientX, X, distIncrement;
    if (knobDayHold) {
        event && event.preventDefault();
        document.documentElement.style.cursor = 'pointer';

        if (event.touches) {
            clientX = event.touches[0].clientX;
        } else {
            clientX = event.clientX;
        }

        X = clientX - sliderDay.offsetLeft;

        // Make knob move in increments of sliderTempIncrement
        distIncrement = temperatureToDistance(minTemp + sliderTempIncrement);
        X = Math.round(X / distIncrement) * distIncrement;

        // Make sure the knob stays on the slider
        if (X < 0) {
            X = 0;
        } else if (X > sliderDay.offsetWidth) {
            X = sliderDay.offsetWidth;
        }

        setDayKnob(X);
        setDayTemperature(distanceToTemperature(X));
    } else if (knobNightHold) {
        event && event.preventDefault();
        document.documentElement.style.cursor = 'pointer';

        if (event.touches) {
            clientX = event.touches[0].clientX;
        } else {
            clientX = event.clientX;
        }

        X = clientX - sliderNight.offsetLeft;

        // Make knob move in increments of sliderTempIncrement
        distIncrement = temperatureToDistance(minTemp + sliderTempIncrement);
        X = Math.round(X / distIncrement) * distIncrement;

        // Make sure the knob stays on the slider
        if (X < 0) {
            X = 0;
        } else if (X > sliderNight.offsetWidth) {
            X = sliderNight.offsetWidth;
        }

        setNightKnob(X);
        setNightTemperature(distanceToTemperature(X));
    }
}

function temperatureToDistance(temp) {
    return (temp - minTemp) / (maxTemp - minTemp) * sliderDay.offsetWidth;
}

function distanceToTemperature(dist) {
    return dist / sliderDay.offsetWidth * (maxTemp - minTemp) + minTemp;
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

/**
 * Sets the background of the body
 * @param color {string} any CSS accepted value for background-color
 */
function setBackground(color) {
    document.getElementsByTagName('body')[0].style.backgroundColor = color;
}

function onButtonUpDay(event) {
    event.preventDefault();
    buttonHold = true;
    bumpUpDayTemperature();
    setTimeout(function () {
        var i = setInterval(function () {
            if (buttonHold) {
                bumpUpDayTemperature();
            } else {
                clearInterval(i);
            }
        }, buttonInterval);
    }, buttonTimeout);
}

function onButtonDownDay(event) {
    event.preventDefault();
    buttonHold = true;
    bumpDownDayTemperature();
    setTimeout(function () {
        var i = setInterval(function () {
            if (buttonHold) {
                bumpDownDayTemperature();
            } else {
                clearInterval(i);
            }
        }, buttonInterval);
    }, buttonTimeout);
}

function onButtonUpNight(event) {
    event.preventDefault();
    buttonHold = true;
    bumpUpNightTemperature();
    setTimeout(function () {
        var i = setInterval(function () {
            if (buttonHold) {
                bumpUpNightTemperature();
            } else {
                clearInterval(i);
            }
        }, buttonInterval);
    }, buttonTimeout);
}

function onButtonDownNight(event) {
    event.preventDefault();
    buttonHold = true;
    bumpDownNightTemperature();
    setTimeout(function () {
        var i = setInterval(function () {
            if (buttonHold) {
                bumpDownNightTemperature();
            } else {
                clearInterval(i);
            }
        }, buttonInterval);
    }, buttonTimeout);
}

function bumpUpDayTemperature() {
    event && event.preventDefault();
    var temp = dayTemperature;
    temp += buttonTempIncrement;
    if (temp > maxTemp) {
        temp = maxTemp
    }
    setDayTemperature(temp);
}

function bumpDownDayTemperature() {
    event && event.preventDefault();
    var temp = dayTemperature;
    temp -= buttonTempIncrement;
    if (temp < minTemp) {
        temp = minTemp
    }
    setDayTemperature(temp);
}

function bumpUpNightTemperature() {
    event && event.preventDefault();
    var temp = nightTemperature;
    temp += buttonTempIncrement;
    if (temp > maxTemp) {
        temp = maxTemp
    }
    setNightTemperature(temp);
}

function bumpDownNightTemperature() {
    event && event.preventDefault();
    var temp = nightTemperature;
    temp -= buttonTempIncrement;
    if (temp < minTemp) {
        temp = minTemp
    }
    setNightTemperature(temp);
}

function setDayTemperature(temp) {
    var setDayTemp = document.getElementById('set-temp-value-day');
    temp = parseFloat(temp);
    dayTemperature = temp;
    temp = Math.round(temp * 10) / 10;
    if (temp === Math.round(temp)) {
        temp = temp + '.0';
    }
    setDayTemp.innerHTML = temp + "&deg;";
    api.setDayTemperature(temp);

    if (moveDay) {
        api.setTargetTemperature(temp);
    }

    if (!knobDayHold) {
        setDayKnob(temperatureToDistance(temp));
    }
}

function setNightTemperature(temp) {
    var setNightTemp = document.getElementById('set-temp-value-night');
    temp = parseFloat(temp);
    nightTemperature = temp;
    temp = Math.round(temp * 10) / 10;
    if (temp === Math.round(temp)) {
        temp = temp + '.0';
    }
    setNightTemp.innerHTML = temp + "&deg;";
    api.setNightTemperature(temp);

    if (moveNight) {
        api.setTargetTemperature(temp);
    }

    if (!knobNightHold) {
        setNightKnob(temperatureToDistance(temp));
    }
}

function setDayKnob(dist) {
    var leftOffset = -knobNight.offsetWidth / 2;
    var topOffset = -(knobDay.offsetHeight - sliderDay.offsetHeight) / 2;
    knobDay.style.left = dist + leftOffset + 'px';
    knobDay.style.top = topOffset;
}

function setNightKnob(dist) {
    var leftOffset = -knobNight.offsetWidth / 2;
    var topOffset = -(knobNight.offsetHeight - sliderNight.offsetHeight) / 2;
    knobNight.style.left = dist + leftOffset + 'px';
    knobNight.style.top = topOffset;
}