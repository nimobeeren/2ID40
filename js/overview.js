window.onload = function () {
    // Refresh data periodically
    setInterval(refresh, refreshTime);
    refresh();
};

function refreshUI() {
    setBackground(calcBackground());
    setLabelBackground(calcBackground());
    setTimelines();
}

function setTimelines() {
    Array.prototype.forEach.call(days, function(day) {
        var timeline = document.querySelector('#' + day.toLowerCase() + ' .timeline');
        var program = weekProgram[day];
        setTimeline(program, timeline);
    });
}

function setLabelBackground(color) {
    var labels = document.getElementsByClassName('content__labels');
    Array.prototype.forEach.call(labels, function (el) {
        var shadow = document.defaultView.getComputedStyle(el, null)['box-shadow'];
        el.style.boxShadow = color + ' ' + shadow.split(' ').slice(3).join(' ');
        el.style.backgroundColor = color;
    });
}
