var centerX, centerY;
var knob;

window.onload = function () {
    knob = document.getElementById('temp-knob');

    centerX = knob.offsetLeft;
    centerY = knob.offsetTop;

    setKnob(45);

    var mdown = false;
    knob.onmousedown = function (e) {
        mdown = true;
        e.preventDefault();
    };
    window.onmouseup = function (e) {
        mdown = false;
    };
    window.onmousemove = function (e) {
        if (mdown) {
            // TODO: Fix slightly wrong angle
            // TODO: Fix swiping on mobile
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
        }
    };
};

function setKnob(deg) {
    console.log(Math.round(deg));

    var sliderWidth = 295; // width + half border
    var sliderHeight = 295; // height + half border
    var radius = sliderWidth / 2;

    var X = Math.round(radius * -Math.sin(deg * Math.PI / 180));
    var Y = Math.round(radius * Math.cos(deg * Math.PI / 180));

    knob.style.left = centerX + X + 'px';
    knob.style.top = centerY + Y + 'px';
}
