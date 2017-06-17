window.addEventListener("load", doFirst, false);
var presses = 0
var adding = false;

function doFirst() {
    var button = document.getElementById('add__button');
    button.addEventListener("click", display, false);
}

function display() {
    var addbox = document.getElementById('addbox');
    presses += 1;
    if (presses>5 || adding == true) {
        document.getElementById('add__button').style="disabled";
        var removebutton = document.getElementByID('add__switch');
        removebutton.innerHTML = "";
    }
    else if (presses<=5) {
        adding = true;
        addbox.innerHTML += "<form><img id='switch__icons' src='/icons/ic_wb_sunny_white_24px.svg'>" +
            "<input pattern='[0-9]{2}:[0-9]{2}' id='one' class='textbox' style='width:55px;height:20px;font-size:18px;font-weight:bold'>" +
            "<img id='switch__icons' src='/icons/moon_white.svg'>" +
            "<input pattern='[0-9]{2}[ap]{1}m' id='two' class='textbox' style='width:55px;height:20px;font-size:18px;font-weight:bold'>"+
            "<input id='checkmark__button'  type='submit'  value=''></form>";
        var addSwitch = document.getElementById('checkmark__button');
        addSwitch.addEventListener("click", save, false);
    }
}

function save(){
    var one = document.getElementById('one').value;
    var two = document.getElementById('two').value;
    adding = false;
    /*add various types of checks here*/
    if (one != "" && two != "") {
        sessionStorage.setItem(one,two);
        displaySwitch();
        document.getElementById('one').value="";
        document.getElementById('two').value="";
    } else {
        adding = true;
    }
}

function displaySwitch() {
    var existing = document.getElementById('existing_switches');
    existing.innerHTML = "";
    if (sessionStorage.length==5) {
        document.getElementById('checkmark__button').style="disabled";
    }
    for (var x=0;x<sessionStorage.length;x++) {
        var a = sessionStorage.key(x);
        var b = sessionStorage.getItem(a);
        /*add sorting here*/
        existing.innerHTML += "<div id='switch__info'><img id='switch__icons' src='/icons/ic_wb_sunny_white_24px.svg'>"+a+"<img id='switch__icons' src='/icons/moon_white.svg'>"+b+
        "<input id='delete__switch' type='submit' value=''></div>";
        addbox.innerHTML = "";
        var deleteswitch = document.getElementById('delete__switch');
        deleteswitch.addEventListener("click", delSwitch, false);
    }
}

function delSwitch()
{
    existing_switches.innerHTML = "";

}