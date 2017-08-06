var copyProgram = null;

window.onload = function () {
    // Refresh data periodically
    setInterval(refresh, refreshTime);
    refresh();

    Array.prototype.forEach.call(days, function (day) {
        var content = document.querySelector('#' + day.toLowerCase() + ' .card__content');
        var editButton = document.querySelector('#' + day.toLowerCase() + ' .edit-button');
        var copyButton = document.querySelector('#' + day.toLowerCase() + ' .copy-button');

        content.addEventListener('click', onEdit);
        editButton.addEventListener('click', onEdit);
        copyButton.addEventListener('click', onCopy);
    })
};

function refreshUI() {
    setBackground(calcBackground());
    setLabelBackground(calcBackground());
    setTimelines();
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
    var card;
    var buttons = document.getElementsByClassName('copy-button');

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

        // Find program that needs to be copied
        card = event.target;
        while (!card.classList.contains('timelines__card')) {
            try {
                card = card.parentElement;
            } catch (ex) {
                throw new Error("Could not find period to copy");
            }
        }

        // Store the program to be copied
        copyProgram = weekProgram[card.id.charAt(0).toUpperCase() + card.id.slice(1)];
    } else {
        if (event.target.innerHTML === 'PASTE') {
            // Find program that needs to be pasted on
            card = event.target;
            while (!card.classList.contains('timelines__card')) {
                try {
                    card = card.parentElement;
                } catch (ex) {
                    throw new Error("Could not find period to paste on");
                }
            }

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

function setLabelBackground(color) {
    var labels = document.getElementsByClassName('content__labels');
    Array.prototype.forEach.call(labels, function (el) {
        var shadow = document.defaultView.getComputedStyle(el, null)['box-shadow'];
        el.style.boxShadow = color + ' ' + shadow.split(' ').slice(3).join(' ');
        el.style.backgroundColor = color;
    });
}
