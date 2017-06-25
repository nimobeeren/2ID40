
// Get day and night temperature
var day ;
var time;
var weekProgramState;
var dayProgram;
// console.log(dayProgram);

var switches;
var adding = false;
var existing = document.getElementById('existing_switches');
var addBox = document.getElementById('addbox');
var timeline = document.getElementById('timeline');
var hideButton = document.getElementById('add__switch');
var deleteSwitch;
var editingDay;

window.onload = function() {
    var button = document.getElementById('add__button');
    button.addEventListener("click", display, false);
};

function setWeekDayProgram(day) {
    console.log(getDayProgram(day));
    switches = getDayProgram(day)["switches"];
    editingDay = day;
    updateSwitches();
}

function updateSwitches() {
    var part;
    switches = getDayProgram(editingDay)["switches"];
    console.log(getDayProgram(editingDay));
    // Remove all switches which are turned off
    switches =
        switches && switches.filter(function (s) {
            return (s["state"] === "on" && s["time"] !== "00:00");
        });

    // Add two extra switches to night mode at midnight, if not already present
    if (!switches.some(function (s) {
            return s["time"] === "00:00"
        })) {
        switches.unshift({
            "type": "night",
            "state": "on",
            "time": "00:00"
        });
    }
    if (!switches.some(function (s) {
            return s["time"] === "24:00"
        })) {
        switches.push({
            "type": "night",
            "state": "on",
            "time": "24:00"
        })
    }

    // If all switches are off, indicate vacation mode
    if (!switches || switches.length === 0 || weekProgramState !== 'on') {
        // Remove all timeline parts
        timeline.innerHTML = '';

        // Add a disabled timeline part
        part = document.createElement('div');
        part.classList.add('timeline__part');
        part.classList.add('part--disabled');
        timeline.appendChild(part);
        return;
    }

    // Sort switches by ascending time
    switches.sort(function (a, b) {
        if (a["time"].substr(0, 2) === b["time"].substr(0, 2)) {
            return a["time"].substr(3, 2) > b["time"].substr(3, 2);
        } else {
            return a["time"].substr(0, 2) > b["time"].substr(0, 2);
        }
    });

    // Remove all timeline parts
    timeline.innerHTML = '';

    var dayCounter = 0;
    for (var i = 0; i < switches.length - 1; i++) {
        // Make a part that has the same type as the beginning switch
        part = document.createElement('div');
        part.classList.add('timeline__part');
        if (switches[i]["type"] === "day") {
            dayCounter++;
            part.classList.add('part--day');
        } else {
            part.classList.add('part--night');
        }

        if (dayCounter >=4 ) {
            $('#add__button').hide();
        }else{
            $('#add__button').show();

        }

        // Make the part last until the next switch
        var startTime = switches[i]["time"];
        var endTime = switches[i + 1]["time"];
        var startTimeMins = parseInt(startTime.substr(0, 2)) * 60 + parseInt(startTime.substr(3, 2));
        var endTimeMins = parseInt(endTime.substr(0, 2)) * 60 + parseInt(endTime.substr(3, 2));
        part.style.flexGrow = endTimeMins - startTimeMins;

        // For all but the first part, add a label with the starting time
        if (i !== 0) {
            var label = document.createElement('div');
            if (switches[i]["type"] === "day") {
                label.classList.add('timeline__label__day');
            } else if (switches[i]["type"] === "night") {
                label.classList.add('timeline__label__night');
            }
            label.innerHTML = startTime;
            part.appendChild(label);
        }

        // Add the part to the timeline
        timeline.appendChild(part);
    }

    existing.innerHTML = "";
    for (var i = 0; i < switches.length - 1; i+=1) {
        var firstTime = switches[i]["time"];
        var secondTime = switches[i + 1]["time"];
        var switchType = switches[i]["type"];
        if (firstTime === "00:00" && secondTime === "24:00" && switchType === "day") {
            existing.innerHTML += "<div class='switch__info'><img class='switch__icons' src='../icons/ic_wb_sunny_white_24px.svg'><div class='start'>" + firstTime + "</div> - <div class='end'>" + secondTime + "</div>";
        } else if (switchType === "day") {
            existing.innerHTML += "<div class='switch__info'><img class='switch__icons' src='../icons/ic_wb_sunny_white_24px.svg'><div class='start'>" + firstTime + "</div> - <div class='end'>" + secondTime + "</div>" +
                "<input class='delete__switch' type='submit' value=''></div>";
            deleteSwitch = document.getElementsByClassName('delete__switch');
            for (var k = 0; k < deleteSwitch.length; k++) {
                deleteSwitch[k].addEventListener('click', delSwitch, false);
            }
        }
    }
}

function display() {
    hideButton.innerHTML = "";
    if (switches.length >= 10 || adding === true) {
        document.getElementById('add__button').style="disabled";
    }
    else if (switches.length < 10){
        adding = true;
        addBox.innerHTML += "<form><img class='switch__icons' src='../icons/ic_wb_sunny_white_24px.svg'>" +
            "<input pattern='[0-2]{1}[0-9]{1}:[0-5]{1}[0-9]{1}' required='required' maxlength='5' id='one' class='textbox' style='width:55px;height:20px;font-size:18px;font-weight:bold'>" +
            "<span>&nbsp;-&nbsp;</span>" +
            "<input pattern='[0-2]{1}[0-9]{1}:[0-5]{1}[0-9]{1}' required='required' maxlength='5' id='two' class='textbox' style='width:55px;height:20px;font-size:18px;font-weight:bold'>"+
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
        if (switches.length < 10) {
            hideButton.innerHTML = "<input id='add__button'  type='submit'  value='ADD SWITCH'>"
            var button = document.getElementById('add__button');
            button.addEventListener("click", display, false);
        }
        //----save the new switch-----
        weekProgramJSON[editingDay].switches = switches;
        saveProgram();
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
            weekProgramJSON[editingDay].switches = switches;
            saveProgram();
            updateSwitches();
        }
    }
}

function normalizeTime(time){
    var startPattern = /^[0-9]:[0-5][0-9]?$/;
    var endPattern = /[0-2]?[0-9]:[0-5]$/;
    if (startPattern.test(time)){
        time = '0'+time;
    }
    if (endPattern.test(time)){
        time = time+'0';
    }
    return time;
}
