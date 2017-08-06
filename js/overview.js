var copyProgram = null;

window.onload = function () {
    // Refresh data periodically
    setInterval(refresh, refreshTime);
    refresh();

    Array.prototype.forEach.call(days, function (day) {
        var content = document.querySelector('#' + day.toLowerCase() + ' .card__content');
        var editButton = document.querySelector('#' + day.toLowerCase() + ' .edit-button');
        var copyButton = document.querySelector('#' + day.toLowerCase() + ' .copy-button');

        content.addEventListener('click', onEditOrPaste);
        editButton.addEventListener('click', onEdit);
        copyButton.addEventListener('click', onCopy);
    })
};

function refreshUI() {
    setBackground(calcBackground());
    setTimelines();
}

function onEditOrPaste(event) {
    if (copyProgram) {
        onCopy(event);
    } else {
        onEdit(event);
    }
}

function onEdit(event) {
    var card = event.target;
    while (!card.classList.contains('timelines__card')) {
        try {
            card = card.parentElement;
        } catch (ex) {
            throw new Error("Could not find period to edit");
        }
    }
    window.location.href = 'weekday.html?day=' + card.id.charAt(0).toUpperCase() + card.id.slice(1);
}

function onCopy(event) {
    var buttons = document.getElementsByClassName('copy-button');

    // Find program that needs to be copied or pasted on
    var card = event.target;
    while (!card.classList.contains('timelines__card')) {
        try {
            card = card.parentElement;
        } catch (ex) {
            throw new Error("Could not find period to copy");
        }
    }

    if (!copyProgram) {
        // Change all other copy buttons to paste, and this one to cancel
        Array.prototype.forEach.call(buttons, function (button) {
            if (button === event.target) {
                button.innerHTML = 'CANCEL';
                button.classList.add('flat-button--red');
            } else {
                button.innerHTML = 'PASTE';
            }
        });

        // Store the program to be copied
        copyProgram = weekProgram[card.id.charAt(0).toUpperCase() + card.id.slice(1)];
    } else {
        var copyButton = card.getElementsByClassName('copy-button')[0];
        if (copyButton.innerHTML === 'PASTE') {
            // Display and save pasted program
            weekProgram[card.id.charAt(0).toUpperCase() + card.id.slice(1)] = copyProgram;
            refreshUI();
            api.setWeekProgram(weekProgram);

            // Restore copy buttons
            Array.prototype.forEach.call(buttons, function (button) {
                button.innerHTML = 'COPY';
                button.classList.remove('flat-button--red');
            });

            copyProgram = null;
        } else {
            // Cancel the pasting
            Array.prototype.forEach.call(buttons, function (button) {
                button.innerHTML = 'COPY';
                button.classList.remove('flat-button--red');
            });
            copyProgram = null;
        }
    }
}

function setTimelines() {
    Array.prototype.forEach.call(days, function(day) {
        var timeline = document.querySelector('#' + day.toLowerCase() + ' .timeline');
        var program = weekProgram[day];
        setTimeline(program, timeline);
    });
}
