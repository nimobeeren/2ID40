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


