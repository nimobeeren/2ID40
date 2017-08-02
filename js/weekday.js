var switches;
var adding = false;
var button, existing, addBox, timeline, hideButton;
var editingDay;

window.onload = function () {
    button = document.getElementById('add__button');
    existing = document.getElementById('existing_switches');
    addBox = document.getElementById('addbox');
    timeline = document.getElementById('timeline');
    hideButton = document.getElementById('add__switch');

    // Refresh data periodically
    refresh();
    setInterval(refresh, refreshTime);

    // Wire up add button
    button.addEventListener("click", display);
};

function refreshUI() {
    setBackground(calcBackground());
    setTimeline(dayProgram, timeline);

    setSwitches(dayProgram);
}

function setSwitches(program) {
    existing.innerHTML = "";

    for (var i = 0; i < program.length; i++) {
        existing.innerHTML += '<div class="switch__info"><img class="switch__icons" src="../icons/ic_wb_sunny_white_24px.svg"><div class="start">' + program[i][0] + '</div> - <div class="end">' + program[i][1] + '</div>' +
            '<input class="delete__switch" type="submit" value=""></div>';
    }
}

function display() {
    hideButton.innerHTML = "";
    if (switches.length >= 12 || adding === true) {
        document.getElementById('add__button').style = "disabled";
    }
    else if (switches.length < 12) {
        adding = true;
        addBox.innerHTML += "<form><img class='switch__icons' src='../icons/ic_wb_sunny_white_24px.svg'>" +
            "<input pattern='[0-2]{1}[0-9]{1}:[0-5]{1}[0-9]{1}' required='required' maxlength='5' id='one' class='textbox' style='width:55px;height:20px;font-size:18px;font-weight:bold'>" +
            "<span>&nbsp;-&nbsp;</span>" +
            "<input pattern='[0-2]{1}[0-9]{1}:[0-5]{1}[0-9]{1}' required='required' maxlength='5' id='two' class='textbox' style='width:55px;height:20px;font-size:18px;font-weight:bold'>" +
            "<input id='checkmark__button'  type='submit'  value=''></form>";
        var addSwitch = document.getElementById('checkmark__button');
        addSwitch.addEventListener("click", save, false);
    }
}

function save() {
    var one = document.getElementById('one').value;
    var two = document.getElementById('two').value;
    adding = false;
    /*add various types of checks here*/
    if (one !== "" && two !== "" && /([0-9]|2[0-3]):[0-5][0-9]/.test(one) && /([0-9]|2[0-3]):[0-5][0-9]/.test(two)) {
        one = normalizeTime(one);
        two = normalizeTime(two);
        switches.push({
            "type": "day",
            "state": "on",
            "time": one
        });
        switches.push({
            "type": "night",
            "state": "on",
            "time": two
        });
        existing.innerHTML = "";
        addBox.innerHTML = "";
        if (switches.length < 12) {
            hideButton.innerHTML = "<input id='add__button'  type='submit'  value='ADD SWITCH'>";
            var button = document.getElementById('add__button');
            button.addEventListener("click", display, false);
        }

        // Save the new switch
        var program = api.getDayProgram(editingDay);
        program.switches = switches;
        api.setDayProgram(editingDay, program);

        updateSwitches();
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
                hideButton.innerHTML = "<input id='add__button'  type='submit'  value='ADD SWITCH'>";
                var button = document.getElementById('add__button');
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
