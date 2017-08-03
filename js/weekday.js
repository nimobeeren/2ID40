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
    addButton.addEventListener("click", display);
    submitButton.addEventListener("click", save);
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
}

function display() {
    addButton.style.display = 'none';

    if (dayProgram.length > 5 || adding === true) {
        document.getElementById('add-button').style = "disabled";
    }
    else if (dayProgram.length <= 5) {
        adding = true;
        newPeriod.style.display = 'flex';
    }
}

function save() {
    var one = document.getElementById('start').value;
    var two = document.getElementById('end').value;
    adding = false;
    /*add various types of checks here*/
    if (one !== "" && two !== "" && /([0-9]|2[0-3]):[0-5][0-9]/.test(one) && /([0-9]|2[0-3]):[0-5][0-9]/.test(two)) {
        one = normalizeTime(one);
        two = normalizeTime(two);
        dayProgram.push([one, two]);

        existing.innerHTML = "";
        newPeriod.style.display = 'none';

        if (dayProgram.length < 6) {
            hideButton.innerHTML = "<input id='add-button'  type='submit'  value='ADD SWITCH'>";
            var button = document.getElementById('add-button');
            button.addEventListener("click", display, false);
        }

        // Save the new switch
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
                button.addEventListener("click", display, false);
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
