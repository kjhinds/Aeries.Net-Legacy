function importScores() {
    if (document.getElementById('StuName').checked) {
        var identType = 'StuName';
    } else if (document.getElementById('StuNum').checked) {
        var identType = 'StuNum';
    } else {
        var identType = 'PermID';
    };
    var dataObj = {
        assignment: document.getElementById('assignment').value,
        identtype: identType,
        scores: repackScores(document.getElementById('scores').value, identType),
        command: "import"
    };
    sendToContentScript(dataObj);
    sendToContentScript({ command: "getRoster" });  //I don't understand why I need to do this to get it to work.
};

function repackScores(scores, identType) {
    var scoresObject = {};
    var scoresArray = scores.split("\n");
    if (identType == 'StuName') {
        for (i = 0; i < scoresArray.length; i++) {
            if (scoresArray[i]) {
                var student = scoresArray[i].split(/\t|,/);
                var lastName = student[0].trim();
                var firstName = student[1].trim();
                var score = student[2].trim();
                scoresObject[i] = 
                    {lastName: lastName,
                        firstName: firstName,
                        Score: score};
            };
        };
    } else if (identType == 'StuNum') {
        for (i = 0; i < scoresArray.length; i++) {
            var student = scoresArray[i].split(/\t|,/);
            scoresObject[i] =
                {StuNum: student[0], Score: student[1]};
        }
    } else {
        // for Perm ID
    };
    return scoresObject;
};

function sendToContentScript(message) {
    console.log(message);
    chrome.tabs.getSelected(null, function (tab) {
        chrome.tabs.sendMessage(tab.id, { command: message.command, message: message }, function () {
        });
    });
};

function getRoster() {
    sendToContentScript({ command: "getRoster" });
    chrome.tabs.create({
        url: chrome.extension.getURL('roster.html'),
        active: false
    }, function (tab) {
        // After the tab has been created, open a window to inject the tab
        chrome.windows.create({
            tabId: tab.id,
            type: 'popup',
            focused: true,
            width: 560,
            height: 720
            // incognito, top, left, ...
        });
    });
}

// When the popup HTML has loaded
window.addEventListener("load", function (evt) {
    document.getElementById('importscores').addEventListener('submit', importScores);
    document.getElementById('close').onclick = function () { window.close() };
    document.getElementById('getroster').onclick = function () { getRoster() };
});