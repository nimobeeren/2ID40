const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

var editing = false;
var timeline, list, editButton, addButton, cancelButton, acceptButton;
var editingDay;

window.onload = function () {
    timeline = document.getElementById('timeline');
    list = document.getElementById('list');
    editButton = document.getElementById('edit-button');
    addButton = document.getElementById('add-button');
    cancelButton = document.getElementById('cancel-button');
    acceptButton = document.getElementById('accept-button');

    editingDay = getEditingDay();

    // Refresh data periodically
    setInterval(refresh, refreshTime);
    refresh();

    // Wire up inputs
    editButton.addEventListener('click', onEdit);
    addButton.addEventListener('click', onAdd);
    cancelButton.addEventListener('click', onCancel);
    acceptButton.addEventListener('click', onAccept);
};

function refreshUI() {
    setBackground(calcBackground());
    setTimeline(dayProgram, timeline);

    setSwitches(dayProgram);
    setEditingDay(editingDay);
}

function onEdit() {

}

function onAdd() {
    editing = true;
    acceptButton.style.display = 'none';
    newPeriod.style.display = 'flex';
}

function onCancel() {

}

function onAccept() {
    var start = document.getElementById('start').value;
    var end = document.getElementById('end').value;

    /*add various types of checks here*/
    if (start !== "" && end !== "" && /([0-9]|2[0-3]):[0-5][0-9]/.test(start) && /([0-9]|2[0-3]):[0-5][0-9]/.test(end)) {
        // Hide the new period form
        editing = false;
        newPeriod.style.display = 'none';

        // Save and display the new period
        dayProgram.push([start, end].map(normalizeTime));
        dayProgram = api.sortMergeProgram(dayProgram);
        refreshUI();
        api.setDayProgram(editingDay, dayProgram);
    }
}

function onRemove(event) {
    console.log(event.target);

    var parent = event.target.parentElement;
    var start = parent.getElementsByClassName('start')[0].innerHTML;
    var end = parent.getElementsByClassName('end')[0].innerHTML;

    var found = false;
    for (var i = 0; i < dayProgram.length; i++) {
        if (dayProgram[i][0] === start && dayProgram[i][1] === end) {
            found = true;
            dayProgram.splice(i, 1);
            refreshUI();
            api.setDayProgram(editingDay, dayProgram);
            break;
        }
    }

    if (!found) {
        console.error('Could not find period to remove');
    }
}

function getEditingDay() {
    try {
        var day =  new RegExp(/[?|&]day=([^&;]+?)(&|#|;|$)/g).exec(location.search)[1];
    } catch (ex) {
        document.body.innerHTML = 'Bad day parameter';
        throw new Error('Bad day parameter');
    }

    if (days.includes(day)) {
        return day;
    } else {
        document.body.innerHTML = 'Bad day parameter';
        throw new Error('Bad day parameter');
    }
}

function setEditingDay(day) {
    // Set title equal to current day
    document.title = day;
    document.getElementById('title').innerHTML = day;

    // Highlight current day in side menu
    var items = document.getElementsByClassName('aside__item');
    Array.prototype.forEach.call(items, function (item) {
        if (item.innerHTML === day) {
            item.classList.add('item--current');
        }
    });
}

function setSwitches(program) {
    // Remove all periods except the dummy
    var periods = document.querySelectorAll('.periods__item:not(.dummy)');
    Array.prototype.forEach.call(periods, function (period) {
        period.parentNode.removeChild(period);
    });

    // Add new periods
    for (var i = 0; i < program.length; i++) {
        var dummy = list.getElementsByClassName('dummy')[0];
        var newPeriod = dummy.cloneNode(true);

        newPeriod.classList.remove('dummy');
        newPeriod.getElementsByClassName('time--start')[0].getElementsByTagName('label')[0].innerHTML = program[i][0];
        newPeriod.getElementsByClassName('time--start')[0].getElementsByTagName('input')[0].value = program[i][0];
        newPeriod.getElementsByClassName('time--end')[0].getElementsByTagName('label')[0].innerHTML = program[i][1];
        newPeriod.getElementsByClassName('time--end')[0].getElementsByTagName('input')[0].value = program[i][1];

        list.appendChild(newPeriod);
    }

    // Wire up remove buttons
    periods = document.querySelectorAll('.periods__item:not(.dummy)');
    Array.prototype.forEach.call(periods, function (period) {
        period.getElementsByClassName('item__remove-button')[0].addEventListener("click", onRemove);
    });
}

/*
Utility functions
 */

function normalizeTime(time) {
    var startPattern = /^[0-9]:[0-5][0-9]?$/;
    var endPattern = /[0-2]?[0-9]:[0-5]$/;
    if (startPattern.test(time)) {
        time = '0' + time;
    }
    if (endPattern.test(time)) {
        time = time + '0';
    }
    return time;
}
