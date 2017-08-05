const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

var editing = false;
var timeline, list, editButton, addButton, cancelButton, acceptButton;
var editingDay;
var oldProgram;

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
    if (!editing) {
        setTimeline(dayProgram, timeline);
        setSwitches(dayProgram);
        setEditingDay(editingDay);
    }
}

function onEdit() {
    editing = true;

    // Store old program to allow cancelling
    oldProgram = dayProgram;

    setEditingMode(editing);
}

function onAdd() {

}

function onCancel() {
    editing = false;

    // Restore old program
    dayProgram = oldProgram;
    refreshUI();

    setEditingMode(editing);
}

function onAccept() {
    var program = [];
    var periods = document.querySelectorAll('.periods__item:not(.dummy)');
    Array.prototype.forEach.call(periods, function (period) {
        var start = period.querySelector('.time--start input').value;
        var end = period.querySelector('.time--end input').value;

        var re = new RegExp(/([0-1][0-9]|2[0-3]):[0-5][0-9]/);
        if (re.test(start) && re.test(end)) {
            program.push([start, end]);
        } else {
            throw new Error('Invalid time format on input');
        }
    });

    editing = false;

    dayProgram = api.sortMergeProgram(program);
    refreshUI();
    api.setDayProgram(editingDay, dayProgram);

    setEditingMode(editing);
}

function onRemove(event) {
    // var parent = event.target.parentElement;
    // var start = parent.getElementsByClassName('start')[0].innerHTML;
    // var end = parent.getElementsByClassName('end')[0].innerHTML;
    //
    // var found = false;
    // for (var i = 0; i < dayProgram.length; i++) {
    //     if (dayProgram[i][0] === start && dayProgram[i][1] === end) {
    //         found = true;
    //         dayProgram.splice(i, 1);
    //         refreshUI();
    //         api.setDayProgram(editingDay, dayProgram);
    //         break;
    //     }
    // }
    //
    // if (!found) {
    //     console.error('Could not find period to remove');
    // }
}

function getEditingDay() {
    try {
        var day = new RegExp(/[?|&]day=([^&;]+?)(&|#|;|$)/g).exec(location.search)[1];
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

function setEditingMode(isOn) {
    var items;
    if (isOn) {
        document.querySelector('.buttons-viewing').style.display = 'none';
        document.querySelector('.buttons-editing').style.display = 'flex';
        document.querySelector('#add-button').style.display = 'block';

        items = document.querySelectorAll('.periods__item');
        Array.prototype.forEach.call(items, function (item) {
            item.querySelector('.item__remove-button').style.display = 'block';
            item.querySelector('.time--start label').style.display = 'none';
            item.querySelector('.time--start input').style.display = 'block';
            item.querySelector('.time--end label').style.display = 'none';
            item.querySelector('.time--end input').style.display = 'block';
        });
    } else {
        document.querySelector('.buttons-viewing').style.display = 'flex';
        document.querySelector('.buttons-editing').style.display = 'none';
        document.querySelector('#add-button').style.display = 'none';

        items = document.querySelectorAll('.periods__item');
        Array.prototype.forEach.call(items, function (item) {
            item.querySelector('.item__remove-button').style.display = 'none';
            item.querySelector('.time--start label').style.display = 'block';
            item.querySelector('.time--start input').style.display = 'none';
            item.querySelector('.time--end label').style.display = 'block';
            item.querySelector('.time--end input').style.display = 'none';
        });
    }
}
