var shown = false;
var direction = 'default';
addEventListener("click", getClickPosition, false);
addEventListener("touch", getClickPosition, false);

/* Set the width of the side navigation to 250px */
function openNav() {
    document.getElementById("sidenav").style.width = "250px";
    document.getElementById("sidenav").style.borderRight = "2px solid #aad9ff";
    shown = true;
}

/* Set the width of the side navigation to 0 */
function closeNav() {
    document.getElementById("sidenav").style.width = "0";
    document.getElementById("sidenav").style.borderRight = "0";
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
    targetElement = document.body, // Element to delegate
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
    if (currentX > touchStartCoords['x'] && touchStartCoords['x'] < 30) {
        width = currentX - touchStartCoords['x'];
        direction = 'right';
    } else if (touchStartCoords['x'] <= touchStartCoords['x']) {
        direction = 'left';
        width = 250 - (touchStartCoords['x'] - currentX);
        if (width < 250 && shown === true) {
            var navSize = width.toString() + "px";
            document.getElementById("sidenav").style.width = navSize;
        }
    }
}

function swipeEnd() {
    if (direction === "left") {
        if (width < 200) {
            closeNav();
        } else if (shown === true) {
            openNav();
        }
    } else if (direction === "right") {
        if (width > 100) {
            openNav();
        }
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