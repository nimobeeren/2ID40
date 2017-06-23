var knobDay, knobNight, sliderDay, sliderNight;
var centerX;
var mdown = false;
var sliderTempIncrement = 0.5;

var minTemp = 5;
var maxTemp = 30;
var buttonTempIncrement = 0.1;
var dayTemperature;
var nightTemperature;
var buttonUpDay, buttonDownDay, buttonUpNight, buttonDownNight;
var intValUpDay, intValDownDay, intValUpNight, intValDownNight;

window.onload = function () {
    knobDay = document.getElementById('temp-knob-day');
    knobNight = document.getElementById('temp-knob-night');
    sliderDay = document.getElementById('temp-slider-day');
    sliderNight = document.getElementById('temp-slider-night');

    centerX = knob.offsetLeft + knob.offsetWidth / 2;
    centerY = knob.offsetTop + knob.offsetHeight / 2;

    // Wire up mouse events for slider
    knobDay.addEventListener('mousedown', function (e) {
        e.preventDefault();
        mdown = true;
    });
    document.addEventListener('mouseup', function (e) {
        mdown = false;
        document.documentElement.style.cursor = 'auto';
    });
    document.addEventListener('mousemove', dragOrSwipeDay);

    // Wire up touch events for slider
    knobDay.addEventListener('touchstart', function (e) {
        mdown = true;
        e.preventDefault();
    });
    document.addEventListener('touchend', function (e) {
        mdown = false;
        document.documentElement.style.cursor = 'auto';
    });
    document.addEventListener('touchmove', dragOrSwipeDay);

    // Wire up mouse events for slider
    knobNight.addEventListener('mousedown', function (e) {
        e.preventDefault();
        mdown = true;
    });
    document.addEventListener('mouseup', function (e) {
        mdown = false;
        document.documentElement.style.cursor = 'auto';
    });
    document.addEventListener('mousemove', dragOrSwipeNight);

    // Wire up touch events for slider
    knobNight.addEventListener('touchstart', function (e) {
        mdown = true;
        e.preventDefault();
    });
    document.addEventListener('touchend', function (e) {
        mdown = false;
        document.documentElement.style.cursor = 'auto';
    });
    document.addEventListener('touchmove', dragOrSwipeNight);


    buttonUpDay = document.getElementById('temp-up-day');
    buttonDownDay = document.getElementById('temp-down-day');
    buttonUpNight = document.getElementById('temp-up-night');
    buttonDownNight = document.getElementById('temp-down-night');

    setDayTemperature(dayTemperature);
    setNightTemperature(nightTemperature);

    buttonUpDay.addEventListener('click', bumpUpDayTemperature);
    buttonDownDay.addEventListener('click', bumpDownDayTemperature);
    buttonUpNight.addEventListener('click', bumpUpNightTemperature);
    buttonDownNight.addEventListener('click', bumpDownNightTemperature);

    buttonUpDay.addEventListener('touchstart', intervalUpDay);
    buttonDownDay.addEventListener('touchstart', intervalDownDay);
    buttonUpNight.addEventListener('touchstart', intervalUpNight);
    buttonDownNight.addEventListener('touchstart', intervalDownNight);

    buttonUpDay.addEventListener('touchend', intclear);
    buttonDownDay.addEventListener('touchend', intclear);
    buttonUpNight.addEventListener('touchend', intclear);
    buttonDownNight.addEventListener('touchend', intclear);

}

function dragOrSwipeDay(event) {
    if (mdown) {
        event.preventDefault();
        document.documentElement.style.cursor = 'pointer';

        // Move knob to correct position
        setKnobDay(ang);
        setDayTemperature(angleToTemperature(ang));
    }
}

function setKnobDay(ang) {
    // Calculate knob position relative to center
    var X = Math.round(radius * -Math.sin(ang * Math.PI / 180));

    // Apply absolute knob position
    knobDay.style.left = centerX - knobDay.offsetWidth / 2 + X + 'px';
}

function dragOrSwipeNight(event) {
    if (mdown) {
        event.preventDefault();
        document.documentElement.style.cursor = 'pointer';
        // Move knob to correct position
        setKnobNight(ang);
        setNightTemperature(angleToTemperature(ang));
    }
}

function setKnobNight(ang) {
    var borderWidth = window.getComputedStyle(slider).getPropertyValue('border-top-width').slice(0, -2);
    var radius = (slider.offsetWidth - borderWidth) / 2;

    // Calculate knob position relative to center
    var X = Math.round(radius * -Math.sin(ang * Math.PI / 180));

    // Apply absolute knob position
    knobNight.style.left = centerX - knobNight.offsetWidth / 2 + X + 'px';
}

function bumpUpDayTemperature(event) {
    event && event.preventDefault();
    var temp = dayTemperature;
    temp += buttonTempIncrement;
    if (temp > maxTemp) {
        temp = maxTemp
    }
    setDayTemperature(temp);
    saveDayTemperature(temp);
}

/**
 * Decreases the day temperature by the amount buttonTempIncrement
 * @param event {MouseEvent/TouchEvent} (optional) parameters for the clicking/touching event
 */
function bumpDownDayTemperature(event) {
    event && event.preventDefault();
    var temp = dayTemperature;
    temp -= buttonTempIncrement;
    if (temp < minTemp) {
        temp = minTemp
    }
    setDayTemperature(temp);
    saveDayTemperature(temp);
}

function bumpUpNightTemperature(event) {
    event && event.preventDefault();
    var temp = nightTemperature;
    temp += buttonTempIncrement;
    if (temp > maxTemp) {
        temp = maxTemp
    }
    setNightTemperature(temp);
    saveNightTemperature(temp);
}


/**
 * Decreases the day temperature by the amount buttonTempIncrement
 * @param event {MouseEvent/TouchEvent} (optional) parameters for the clicking/touching event
 */
function bumpDownNightTemperature(event) {
    event && event.preventDefault();
    var temp = nightTemperature;
    temp -= buttonTempIncrement;
    if (temp < minTemp) {
        temp = minTemp
    }
    setNightTemperature(temp);
    saveNightTemperature(temp);
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
}

/**
 * Sets the temperature the thermostat is supposed to keep during a night period, when not overridden
 * Places the night indicator line in the right position on the radial slider
 * @param temp {number} day temperature
 */
function setNightTemperature(temp) {
    var setNightTemp = document.getElementById('set-temp-value-night');
    temp = parseFloat(temp);
    nightTemperature = temp;
    temp = Math.round(temp * 10) / 10;
    if (temp === Math.round(temp)) {
        temp = temp + '.0';
    }
    setNightTemp.innerHTML = temp + "&deg;";
}

function intervalUpDay() {
    intValUpDay = setInterval(bumpUpDayTemperature, 100);
}

function intervalDownDay() {
    intValDownDay = setInterval(bumpDownDayTemperature, 100);
}

function intervalUpNight() {
    intValUpNight = setInterval(bumpUpNightTemperature, 100);
}

function intervalDownNight() {
    intValDownNight = setInterval(bumpDownNightTemperature, 100);
}

function intclear() {
    clearInterval(intValUpDay);
    clearInterval(intValDownDay);
    clearInterval(intValUpNight);
    clearInterval(intValDownNight);
}