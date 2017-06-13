var centerX, centerY;
var knob;
var lastDeg = 45;

window.onload = function () {
    knob = document.getElementById('temp-knob');

    centerX = knob.offsetLeft;
    centerY = knob.offsetTop;

    setKnob(lastDeg);

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
            var deg = -a / (Math.PI / 180) + 180; // final (0-360 positive) degrees from

            // Make sure the knob stays on the slider
            if (deg < 45) {
                deg = 45;
            } else if (deg > 315) {
                deg = 315;
            }

            // Make the knob move in increments of 5 degrees
            deg = Math.round(deg / 5) * 5;

            // Move knob to correct position
            setKnob(deg);
            lastDeg = deg;
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
            var deg = -a / (Math.PI / 180) + 180; // final (0-360 positive) degrees from

            // Make sure the knob stays on the slider
            if (deg < 45) {
                deg = 45;
            } else if (deg > 315) {
                deg = 315;
            }

            // Make the knob move in increments of 5 degrees
            deg = Math.round(deg / 5) * 5;

            // Move knob to correct position
            setKnob(deg);
            lastDeg = deg;
        }
    });
    document.addEventListener('touchcancel', function(e) {
        tdown = false;
        setKnob(lastDeg);
    })
};

function setKnob(deg) {
    var sliderWidth = 295; // width + half border
    var sliderHeight = 295; // height + half border
    var radius = sliderWidth / 2;

    var X = Math.round(radius * -Math.sin(deg * Math.PI / 180));
    var Y = Math.round(radius * Math.cos(deg * Math.PI / 180));

    knob.style.left = centerX + X + 'px';
    knob.style.top = centerY + Y + 'px';
}
