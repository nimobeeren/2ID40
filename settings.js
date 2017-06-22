var minTemp = 5;
var maxTemp = 30;
var buttonTempIncrement = 0.1;
var dayTemperature;
var nightTemperature;
var buttonUpDay, buttonDownDay, buttonUpNight, buttonDownNight;

window.onload = function () {
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
}

function bumpUpDayTemperature(event) {
    event && event.preventDefault();
    var temp = dayTemperature;
    temp += buttonTempIncrement;
    if (temp > maxTemp) {
        temp = maxTemp
    }
    setDayTemperature(temp);
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
}

function bumpUpNightTemperature(event) {
    event && event.preventDefault();
    var temp = nightTemperature;
    temp += buttonTempIncrement;
    if (temp > maxTemp) {
        temp = maxTemp
    }
    setNightTemperature(temp);
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