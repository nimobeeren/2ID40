var knob, container, slider, upButton, downButton, vacationSwitch;
var knobHold = false;
var buttonHold = false;
var minTemp = 5;
var maxTemp = 30;
var sliderTempIncrement = 0.5;
var buttonTempIncrement = 0.1;
var buttonTimeout = 400;
var buttonInterval = 200;
var dayColor = '#64b5f6';
var nightColor = '#1a237e';

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
    container = document.getElementById('slider-container');
    slider = document.getElementById('temp-slider');
    upButton = document.getElementById('temp-up');
    downButton = document.getElementById('temp-down');
    vacationSwitch = document.getElementById('vacation-switch');
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

    /*
     Vacation switch
     */
    vacationSwitch.addEventListener('change', function (e) {
        var vacationMode = vacationSwitch.checked;
        api.setWeekProgramState(!vacationMode);
        if (vacationMode) {
            weekProgramState = false; // shouldn't do this
            setDayProgram(null);
        }
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

    refreshUI();
}

/**
 * Sets UI elements to their corresponding values
 */
function refreshUI() {
    setCurrentDay(day);
    setCurrentTime(time);
    setCurrentTemperature(currentTemperature);
    setTargetTemperature(targetTemperature);
    setDayTemperature(dayTemperature);
    setNightTemperature(nightTemperature);
    setWeekProgramState(weekProgramState);
    if (weekProgramState) {
        setDayProgram(dayProgram);
    } else {
        setDayProgram(null);
    }

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

function setWeekProgramState(state) {
    vacationSwitch.checked = !state;
}

/**
 * Creates a timeline
 * @param program {object} contains an array of timespans where the heating is turned on
 */
function setDayProgram(program) {
    var timeline = document.getElementById('timeline');
    var part, label;

    // Indicate vacation mode
    if (!weekProgramState) {
        // Remove all timeline parts
        timeline.innerHTML = '';

        // Add a disabled timeline part
        part = document.createElement('div');
        part.classList.add('timeline__part');
        part.classList.add('part--disabled');
        timeline.appendChild(part);

        // Hide indicator lines on slider
        document.getElementById('temp-line-day').style.display = 'none';
        document.getElementById('temp-line-night').style.display = 'none';
        return;
    } else {
        // Show indicator lines on slider
        document.getElementById('temp-line-day').style.display = 'block';
        document.getElementById('temp-line-night').style.display = 'block';
    }

    // Remove all timeline parts
    timeline.innerHTML = '';

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

function parseTime(t) {
    return parseFloat(t.substr(0, 2)) + parseFloat(t.substr(3, 2)) / 60;
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
