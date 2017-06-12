var centerX, centerY;
var slider, knob;

window.onload = function() {
    slider = document.getElementById('temp-slider');
    knob = document.getElementById('temp-knob');

    centerX = knob.offsetLeft;
    centerY = knob.offsetTop;

    setKnob(270);
};

function setKnob(deg) {
    var sliderWidth = 295; // width + half border
    var sliderHeight = 295; // height + half border
    var radius = sliderWidth / 2;

    var X = Math.round(radius * -Math.sin(deg * Math.PI / 180));
    var Y = Math.round(radius * Math.cos(deg * Math.PI / 180));
    console.log(X, Y);

    knob.style.left = centerX + X + 'px';
    knob.style.top = centerY + Y + 'px';
}
