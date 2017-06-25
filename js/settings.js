var minTemp = 5;
var maxTemp = 30;
var buttonTempIncrement = 0.1;
var dayTemperature;
var nightTemperature;
var buttonUpDay, buttonDownDay, buttonUpNight, buttonDownNight;
var intValUpDay, intValDownDay, intValUpNight, intValDownNight;

window.onload = function () {
    buttonUpDay = document.getElementById('temp-up-day');
    buttonDownDay = document.getElementById('temp-down-day');
    buttonUpNight = document.getElementById('temp-up-night');
    buttonDownNight = document.getElementById('temp-down-night');
	

    api.setDayTemperature(dayTemperature);
    api.setNightTemperature(nightTemperature);
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

};

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
	api.setDayTemperature(temp);
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
	api.setNightTemperature(temp);
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