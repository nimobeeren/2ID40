window.onload = function () {
    // Refresh data periodically
    setInterval(refresh, refreshTime);
    refresh();
};

function refreshUI() {
    setTimelines();
}

function setTimelines() {
    for (var i = 0; i < days.length; i++) {
        var timeline = document.querySelector('#' + days[i].toLowerCase() + ' .timeline');
        var program = weekProgram[days[i]];
        setTimeline(program, timeline);
    }
}