var shown = false;
addEventListener("click", getClickPosition, false)

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
    if (shown = true) {
        if (xPosition > 252) {
            closeNav();
        }
    }
}

/* Source of the code below: https://codepen.io/yzubizarreta/pen/ojJBQp */

var touchStartCoords =  {'x':-1, 'y':-1}, // X and Y coordinates on mousedown or touchstart events.
    touchEndCoords = {'x':-1, 'y':-1},// X and Y coordinates on mouseup or touchend events.
    direction = 'undefined',// Swipe direction
    minDistanceXAxis = 30,// Min distance on mousemove or touchmove on the X axis
    maxDistanceYAxis = 30,// Max distance on mousemove or touchmove on the Y axis
    maxAllowedTime = 1000,// Max allowed time between swipeStart and swipeEnd
    startTime = 0,// Time on swipeStart
    elapsedTime = 0,// Elapsed time between swipeStart and swipeEnd
    targetElement = document.getElementById('el');// Element to delegate

function swipeStart(e) {
    e = e ? e : window.event;
    e = ('changedTouches' in e)?e.changedTouches[0] : e;
    touchStartCoords = {'x':e.pageX, 'y':e.pageY};
    startTime = new Date().getTime();
}

function swipeMove(e){
    e = e ? e : window.event;
    e.preventDefault();
}

function swipeEnd(e) {
    e = e ? e : window.event;
    e = ('changedTouches' in e)?e.changedTouches[0] : e;
    touchEndCoords = {'x':e.pageX - touchStartCoords.x, 'y':e.pageY - touchStartCoords.y};
    elapsedTime = new Date().getTime() - startTime;
    if (elapsedTime <= maxAllowedTime){
        if (Math.abs(touchEndCoords.x) >= minDistanceXAxis && Math.abs(touchEndCoords.y) <= maxDistanceYAxis){
            direction = (touchEndCoords.x < 0)? 'left' : 'right';
            switch(direction){
                case 'left':
                    closeNav();
                    break;
                case 'right':
                    break;
            }
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