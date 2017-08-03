const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

var adding = false;
var timeline, existing, addButton, newPeriod, submitButton;
var editingDay;

window.onload = function () {
    timeline = document.getElementById('timeline');
    existing = document.getElementById('existing');
    addButton = document.getElementById('add-button');
    newPeriod = document.getElementById('new');
    submitButton = document.getElementById('submit-button');

    editingDay = getEditingDay();

    // Refresh data periodically
    refresh();
    setInterval(refresh, refreshTime);

    // Wire up inputs
    addButton.addEventListener("click", showNewPeriod);
    submitButton.addEventListener("click", submitNewPeriod);
};

function refreshUI() {
    setBackground(calcBackground());
    setTimeline(dayProgram, timeline);

    setSwitches(dayProgram);
    setEditingDay(editingDay);
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
    existing.innerHTML = "";

    for (var i = 0; i < program.length; i++) {
        existing.innerHTML += '<div class="periods__item"><img class="period__icon" src="../icons/ic_wb_sunny_white_24px.svg"><div class="start">' + program[i][0] + '</div> - <div class="end">' + program[i][1] + '</div>' +
            '<input class="delete__switch" type="submit" value=""></div>';
    }

    if (program.length < 5 && !adding) {
        addButton.style.display = 'block';
    } else {
        addButton.style.display = 'none';
    }
}

function showNewPeriod() {
    adding = true;
    addButton.style.display = 'none';
    newPeriod.style.display = 'flex';
}

function submitNewPeriod() {
    var start = document.getElementById('start').value;
    var end = document.getElementById('end').value;

    /*add various types of checks here*/
    if (start !== "" && end !== "" && /([0-9]|2[0-3]):[0-5][0-9]/.test(start) && /([0-9]|2[0-3]):[0-5][0-9]/.test(end)) {
        // Hide the new period form
        adding = false;
        newPeriod.style.display = 'none';

        // Save and display the new period
        dayProgram.push([start, end].map(normalizeTime));
        dayProgram = api.sortMergeProgram(dayProgram);
        refreshUI();
        api.setDayProgram(editingDay, dayProgram);
    }
}

function delSwitch(event) {
    var target = event.target;
    var parent = target.parentElement;//parent of "target"
    var start = parent.childNodes[1].innerHTML;
    var end = parent.childNodes[3].innerHTML;
    for (var i = 0; i < switches.length - 1; i++) {
        if (switches[i]["time"] === start && switches[i + 1]["time"] === end) {
            switches.splice(i, 2);
            if (switches.length < 12) {
                hideButton.innerHTML = "<input id='add-button'  type='submit'  value='ADD SWITCH'>";
                var button = document.getElementById('add-button');
                button.addEventListener("click", showNewPeriod, false);
            }
            var program = api.getDayProgram(editingDay);
            program.switches = switches;
            api.setDayProgram(editingDay, program);

            updateSwitches();
        }
    }
}

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
