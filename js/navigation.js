var shown = false;
addEventListener("click", getClickPosition, false);
addEventListener("touch", getClickPosition, false);

/* Set the width of the side navigation to 250px */
function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
    document.getElementById("mySidenav").style.borderRight = "2px solid #aad9ff";
    shown = true;
}

/* Set the width of the side navigation to 0 */
function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("mySidenav").style.borderRight = "0";
    shown = false;
}

function getClickPosition(e) {
    var xPosition = e.clientX;
    //window.alert(xPosition);
    if (shown == true) {
        if (xPosition > 252) {
            closeNav();
        }
    }
}

/* Source of the code below: https://codepen.io/yzubizarreta/pen/ojJBQp */

var touchStartCoords =  {'x':-1, 'y':-1}, // X and Y coordinates on mousedown or touchstart events.
    targetElement = document.getElementById('el'),// Element to delegate
    width = 250; //default width of openNav

function swipeStart(e) {
    e = e ? e : window.event;
    e = ('changedTouches' in e)?e.changedTouches[0] : e;
    touchStartCoords = {'x':e.pageX, 'y':e.pageY};
}

function swipeMove(e){
    e = e ? e : window.event;
    e = ('changedTouches' in e)?e.changedTouches[0] : e;
    var currentX = e.pageX;
    width = 250 - (touchStartCoords['x'] - currentX);
    if (width < 250 && shown == true) {
        var navSize = width.toString() + "px";
        document.getElementById("mySidenav").style.width = navSize;
    }
}

function swipeEnd() {
    if (width < 200) {
        closeNav();
    } else if (shown == true) {
        openNav();
    }
}

function addMultipleListeners(el, s, fn) {
    var evts = s.split(' ');
    for (var i=0, iLen=evts.length; i<iLen; i++) {
        el.addEventListener(evts[i], fn, false);
    }
}

addMultipleListeners(targetElement, 'mousedown touchstart', swipeStart);
addMultipleListeners(targetElement, 'mousemove touchmove', swipeMove);
addMultipleListeners(targetElement, 'mouseup touchend', swipeEnd);