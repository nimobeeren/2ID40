var knob, centerX, centerY;
var minTemp = 5;
var maxTemp = 30;
var sliderTempIncrement = 0.5;
var buttonTempIncrement = 0.1;

window.onload = function () {
    knob = document.getElementById('temp-knob');
    centerX = knob.offsetLeft;
    centerY = knob.offsetTop;

    var lastAng = 45;
    setKnob(lastAng);

    var mdown = false;
    knob.addEventListener('mousedown', function (e) {
        mdown = true;
        e.preventDefault();
    });
    document.addEventListener('mouseup', function (e) {
        mdown = false;
    });
    document.addEventListener('mousemove', function (e) {
        if (mdown) {
            // TODO: Fix slightly wrong angle
            var a = Math.atan2(centerX - e.clientX, centerY - e.clientY);
            var ang = -a / (Math.PI / 180) + 180; // final (0-360 positive) degrees from

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
            lastAng = ang;
        }
    });

    var tdown = false;
    knob.addEventListener('touchstart', function(e) {
        tdown = true;
        e.preventDefault();
    });
    document.addEventListener('touchend', function(e) {
        tdown = false;
    });
    // TODO: Reuse code from mouse event listener
    document.addEventListener('touchmove', function(e) {
        if (tdown) {
            e.preventDefault();
            // TODO: Fix slightly wrong angle
            var a = Math.atan2(centerX - e.touches[0].clientX, centerY - e.touches[0].clientY);
            var ang = -a / (Math.PI / 180) + 180; // final (0-360 positive) degrees from

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
            lastAng = ang;
        }
    });
    document.addEventListener('touchcancel', function(e) {
        tdown = false;
        setKnob(lastAng);
        setTemperature(angleToTemperature(lastAng));
    })
};

function setKnob(ang) {
    var sliderWidth = 295; // width + half border
    var sliderHeight = 295; // height + half border
    var radius = sliderWidth / 2;

    // Calculate knob position relative to center
    var X = Math.round(radius * -Math.sin(ang * Math.PI / 180));
    var Y = Math.round(radius * Math.cos(ang * Math.PI / 180));

    // Apply absolute knob position
    knob.style.left = centerX + X + 'px';
    knob.style.top = centerY + Y + 'px';
}

function angleToTemperature(ang) {
    return (ang - 45) / 270 * (maxTemp - minTemp) + minTemp;
}

function temperatureToAngle(temp) {
    return (temp - minTemp) / (maxTemp - minTemp) * 270 + 45;
}

function getTemperature() {
    var setTemp = document.getElementById('set-temp-value');
    return parseFloat(setTemp.innerHTML);
}

function setTemperature(temp) {
    var setTemp = document.getElementById('set-temp-value');
    temp = Math.round(temp * 10) / 10;
    if (temp === Math.round(temp)) {
        temp = temp + '.0';
    }
    setTemp.innerHTML = temp + "&deg;";
}

function smallIncreaseTemp() {
    var temp = getTemperature();
    temp += buttonTempIncrement;
    if (temp > maxTemp) { temp = maxTemp }
    setTemperature(temp);
    setKnob(temperatureToAngle(temp));
}

function smallDecreaseTemp() {
    var temp = getTemperature();
    temp -= buttonTempIncrement;
    if (temp < minTemp) { temp = minTemp }
    setTemperature(temp);
    setKnob(temperatureToAngle(temp));
}