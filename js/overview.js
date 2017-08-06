window.onload = function () {
    // Refresh data periodically
    setInterval(refresh, refreshTime);
    refresh();

    Array.prototype.forEach.call(days, function (day) {
        var content = document.querySelector('#' + day.toLowerCase() + ' .card__content');
        var editButton = document.querySelector('#' + day.toLowerCase() + ' .edit-button');
        var copyButton = document.querySelector('#' + day.toLowerCase() + ' .copy-button');

        content.addEventListener('click', onEdit);
        editButton.addEventListener('click', onEdit);
        copyButton.addEventListener('click', onCopy);
    })
};

function refreshUI() {
    setBackground(calcBackground());
    setLabelBackground(calcBackground());
    setTimelines();
}

function onEdit(event) {
    var card = event.target;
    while (!card.classList.contains('timelines__card')) {
        try {
            card = card.parentElement;
        } catch (ex) {
            throw new Error("Could not find period to edit");
        }
    }
    window.location.href = 'weekday.html?day=' + card.id.charAt(0).toUpperCase() + card.id.slice(1);
}

function onCopy(event) {

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
