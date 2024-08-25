console.log("Eternal Adventure Log Viewer by JrDesmond (aka sebaqq6) loaded!");

//get elements
let handlerLogContent = document.querySelector(".logContent");

let btnShowAll = document.querySelector("#showAll");
let btnShowCommands = document.querySelector("#showCommands");
let btnShowChat = document.querySelector("#showChat");
let btnShowActivity = document.querySelector("#showActivity");
let btnNextPage = document.querySelector("#nextPage");
let btnPrevoiusPage = document.querySelector("#previousPage");
let btnLive = document.querySelector("#liveCheckbox");
let btnResetSearch = document.querySelector("#btnResetSearch");
let selectPage = document.querySelector("#selectPage");

let selectDateStart = document.querySelector("#startDate");
let selectDateEnd = document.querySelector("#endDate");

let textBoxSearch = document.querySelector("#textSearch");
let btnSearch = document.querySelector("#btnSearch");

$('form').submit(function (evt) {//disable form interaction
    evt.preventDefault();

});

let footer = document.querySelector("footer");
let body = document.querySelector("body");
let title = document.querySelector("title");

//start value sets/get
title.innerHTML = "EA Logi";//Title page
let dateStartValue;
let dateEndValue;
//personal values
//session:
let sessionId = -1;
let sessionNick = "---";
let sessionIp = "---";
let sessionExpire = 0;
let sessionCreated;
let logged = false;
//current status
let currentPage = 1;
let currentMaxPage = 1;
let currentTotalEntries = 0;
let currentType = -1;
let currentSearch = "-1";
let currentDateStart = "-1";
let currentDateEnd = "-1";
let currentLastIndex = 0;
let liveStatus = 0;
let selectedLiveStatus = 1;
let buttonResetSearchStatus = false;

//timers
let secondTimer = setInterval(oneSecondTimer, 1000);
//run on start:
setDefaultDate();
registerSession();
registerAllListeners();
setLiveStatus(2);
updateButtonResetSearchStatus();
//add listeners
function registerAllListeners() {
    //buttons
    btnShowAll.addEventListener("click", onShowAllClick);
    btnShowCommands.addEventListener("click", onShowCommandsClick);
    btnShowChat.addEventListener("click", onShowChatClick);
    btnShowActivity.addEventListener("click", onShowActivityClick);
    btnNextPage.addEventListener("click", onNextPageClick);
    btnPrevoiusPage.addEventListener("click", onPrevoiusPageClick);
    btnSearch.addEventListener("click", onSearchClick);
    selectPage.addEventListener("change", onSelectPage);
    btnLive.addEventListener("click", onLiveClick);
    btnResetSearch.addEventListener("click", onResetSearch);
}


//listeners
//click
function onShowAllClick() {
    btnShowAll.setAttribute("class", "active");
    btnShowCommands.removeAttribute("class");
    btnShowChat.removeAttribute("class");
    btnShowActivity.removeAttribute("class");
    renderLogs(1, -1, currentSearch, currentDateStart, currentDateEnd);
}

function onShowCommandsClick() {
    btnShowAll.removeAttribute("class");
    btnShowCommands.setAttribute("class", "active");
    btnShowChat.removeAttribute("class");
    btnShowActivity.removeAttribute("class");
    renderLogs(1, 1, currentSearch, currentDateStart, currentDateEnd);
}

function onShowChatClick() {
    btnShowAll.removeAttribute("class");
    btnShowCommands.removeAttribute("class");
    btnShowChat.setAttribute("class", "active");
    btnShowActivity.removeAttribute("class");
    renderLogs(1, 2, currentSearch, currentDateStart, currentDateEnd);
}

function onShowActivityClick() {
    btnShowAll.removeAttribute("class");
    btnShowCommands.removeAttribute("class");
    btnShowChat.removeAttribute("class");
    btnShowActivity.setAttribute("class", "active");
    renderLogs(1, 3, currentSearch, currentDateStart, currentDateEnd);
}

function onNextPageClick() {
    if (currentPage < currentMaxPage) {
        renderLogs(currentPage + 1, currentType, currentSearch, currentDateStart, currentDateEnd);
    }
}

function onPrevoiusPageClick() {
    if (currentPage > 1) {
        renderLogs(currentPage - 1, currentType, currentSearch, currentDateStart, currentDateEnd);
    }
}

function onSearchClick() {
    let searchText = textBoxSearch.value;
    if (searchText.length > 100) {
        searchText = currentSearch.substring(0, 100);
    }
    renderLogs(currentPage, currentType, searchText, currentDateStart, currentDateEnd);
}

function onLiveClick() {
    if (liveStatus != 2) {
        if (selectedLiveStatus == 0) {
            selectedLiveStatus = 1;
            setLiveStatus(selectedLiveStatus);
        } else if (selectedLiveStatus == 1) {
            selectedLiveStatus = 0;
            setLiveStatus(selectedLiveStatus);
        }
    }
}

function onResetSearch() {
    if(buttonResetSearchStatus) {
        textBoxSearch.value = "";
        renderLogs(currentPage, currentType, "", currentDateStart, currentDateEnd);
    }
    
}
//onchange
function onDateStartChange() {
    if (dateToTimestamp(dateStartValue) > dateToTimestamp(dateEndValue)) {
        alert("Data początkowa nie może być większa od daty końcowej. Przywrócono wartości domyślne...");
        setDefaultDate();
    } else {
        renderLogs(currentPage, currentType, currentSearch, dateStartValue, currentDateEnd);
    }

}

function onDateEndChange() {
    if (dateToTimestamp(dateStartValue) > dateToTimestamp(dateEndValue)) {
        alert("Data końcowa nie może być mniejsza od daty startowej. Przywrócono wartości domyślne...");
        setDefaultDate();
    } else {
        renderLogs(currentPage, currentType, currentSearch, currentDateStart, dateEndValue);
    }
}

function onSelectPage() {
    currentPage = selectPage.value;
    renderLogs(currentPage, currentType, currentSearch, currentDateStart, currentDateEnd);
}
//------------------------------------------Run
async function registerSession() {
    sessionId = footer.innerHTML;
    console.log("Wykryta sesja:", sessionId);
    footer.innerHTML = "Logowanie...";
    let data = await requestAPI(`session=${sessionId}`);
    let sessionStatus = data.sessionInfo.status;
    if (sessionStatus == 1) {
        console.log("Zalogowano!");
        sessionNick = data.sessionInfo.playerName;
        sessionIp = data.sessionInfo.ip;
        sessionExpire = data.sessionInfo.expire;
        sessionCreated = data.sessionInfo.created;
        logged = true;
        renderFirstTime();
        updateFooterSessionInfo();
    } else if(sessionStatus == -1) {
        location.reload();
    } else {
        errorSession();
    }
}


function updateFooterSessionInfo() {
    const currentDate = new Date();
    const currentTimestamp = Math.floor(currentDate.getTime() / 1000);
    let calculateEndSession = sessionExpire - currentTimestamp;
    if (calculateEndSession > 0) {
        let leftSession = convertSecondsToMinutesAndSeconds(calculateEndSession);
        let leftSec = leftSession.seconds;
        let leftMin = leftSession.minutes;
        let result = `Zalogowano jako: ${sessionNick} | Sesja: ${sessionId} | IP: ${sessionIp} | Wygasa za: ${leftMin} min, ${leftSec} sek`;
        footer.innerHTML = result;
    } else {
        errorSession();
    }
}

function renderFirstTime() {
    renderLogs(currentPage, currentType, currentSearch, currentDateStart, currentDateEnd);
}

async function renderLogs(page, type, search, dateStart, dateEnd) {
    if (page < 0) page = 1;
    //navigation reset when change filters
    //let setLastPage = false;
    if (type != currentType || dateStart != currentDateStart || dateEnd != currentDateEnd || search != currentSearch) {
        page = 1;
    }
    let prepareRequest = `session=${sessionId}&logPage=${page}&logType=${type}&dateStart=${dateStart}&dateEnd=${dateEnd}&search=${search}`;
    let data = await requestAPI(prepareRequest);
    /*if(setLastPage) {
        page = parseInt(data.logData.totalPages);
        prepareRequest = `session=${sessionId}&logPage=${page}&logType=${type}&dateStart=${dateStart}&dateEnd=${dateEnd}&search=${search}`;
        data = await requestAPI(prepareRequest);
    }*/
    //render log 
    let sessionStatus = data.sessionInfo.status;
    if (sessionStatus == 1) {
        let logEntries = data.logData.entryLog;
        let contentHTML = "";
        logEntries.forEach(entry => {
            let colorEntry = getColorEntry(entry.type);
            contentHTML = `<div class="logEntry"><span style="color: #a57caf;">[${entry.date}]</span> ${colorLogs(entry.text, entry.type)}</div>` + contentHTML;
            
        });
        //save new data
        currentMaxPage = parseInt(data.logData.totalPages);
        currentTotalEntries = parseInt(data.logData.totalEntries);
        currentPage = parseInt(data.logData.page);
        currentType = parseInt(type);
        currentDateStart = dateStart;
        currentDateEnd = dateEnd;
        currentSearch = search;
        currentLastIndex = parseInt(data.logData.lastIndex);
        //load HTML
        handlerLogContent.innerHTML = contentHTML;
        //render select page option
        refreshPageNavigation();
        //select page option
        selectPage.options.selectedIndex = currentPage - 1;
        $(".logEntry").fadeIn(400);
        scrollDownLogs();
        updateButtonResetSearchStatus();
    } else {
        errorSession();
    }
}


async function liveLogTask() {
    if (currentPage == 1 && logged == true) {//only work on first page and logged in
        if (liveStatus == 2) {//back last status live
            setLiveStatus(selectedLiveStatus);
        }
        if (liveStatus == 0) return;//disable live
        let prepareRequest = `session=${sessionId}&logPage=${currentPage}&logType=${currentType}&dateStart=${currentDateStart}&dateEnd=${currentDateEnd}&indexStart=${currentLastIndex}&search=${currentSearch}`;
        let data = await requestAPI(prepareRequest);
        let sessionStatus = data.sessionInfo.status;
        if(sessionStatus == -1) {
            location.reload(true);
            return;
        }
        if (sessionStatus == 1) {
            let logEntries = data.logData.entryLog;
            let lastIndex = parseInt(data.logData.lastIndex);
            if (currentLastIndex < lastIndex) {
                currentLastIndex = lastIndex;
                let newEntriesHTML = "";
                let newEntries = false;
                logEntries.forEach(entry => {
                    newEntries = true;
                    let colorEntry = getColorEntry(entry.type);
                    newEntriesHTML = `<div class="logEntry"><span style="color: #a57caf;">[${entry.date}]</span> ${colorLogs(entry.text, entry.type)}</div>` + newEntriesHTML;
                });

                

                if (newEntries) {
                    //render entries
                    let newLogHTML = handlerLogContent.innerHTML;
                    newLogHTML = newLogHTML + newEntriesHTML;
                    handlerLogContent.innerHTML = newLogHTML;
                    $(".logEntry").fadeIn(700);
                    scrollDownLogs();
                    //-------------------------delete older entries
                    let allEntries = handlerLogContent.querySelectorAll('.logEntry');
                    const maxEntries = 200;
                    if (allEntries.length > maxEntries) {
                        for (let i = 0; i < allEntries.length - maxEntries; i++) {
                            handlerLogContent.removeChild(allEntries[i]);
                        }
                    }
                    //---------------------------------------------------------refresh pages
                    prepareRequest = `session=${sessionId}&logPage=${currentPage}&logType=${currentType}&dateStart=${currentDateStart}&dateEnd=${currentDateEnd}&search=${currentSearch}`;
                    data = await requestAPI(prepareRequest);
                    currentMaxPage = parseInt(data.logData.totalPages);
                    currentTotalEntries = parseInt(data.logData.totalEntries);
                    currentPage = parseInt(data.logData.page);
                    refreshPageNavigation();
                }

            }
        } else {
            errorSession();
        }
    } else {
        setLiveStatus(2);
    }
}



function setDefaultDate() {
    var currentDate = new Date();

    var previousDay = new Date(currentDate);
    previousDay.setDate(currentDate.getDate() - 30);
    previousDay.setHours(0, 0, 0, 0);

    var currentDay = new Date(currentDate);
    currentDay.setHours(23, 59, 0, 0);

    dateStartValue = formatDate(previousDay);
    dateEndValue = formatDate(currentDay);

    selectDateStart.value = dateStartValue;
    selectDateEnd.value = dateEndValue;

    currentDateStart = selectDateStart.value;
    currentDateEnd = selectDateEnd.value;
}

function setLiveStatus(status) {//0 off, 1 - active, 2 = blocked
    if(liveStatus == status) return;
    switch (status) {
        case 0: {//inactive
            liveStatus = 0;
            btnLive.removeAttribute("class");
            break;
        }
        case 1: {//active
            liveStatus = 1;
            btnLive.setAttribute("class", "active");
            break;
        }
        case 2: {//blocked
            liveStatus = 2;
            btnLive.setAttribute("class", "blocked");
            break;
        }
    }
}

function updateButtonResetSearchStatus() {
    //buttonResetSearchStatus
    if(currentSearch.length > 0 && currentSearch != -1) {
        buttonResetSearchStatus = true;
        btnResetSearch.setAttribute("style", "color: red; cursor: pointer;");
    } else {
        buttonResetSearchStatus = false;
        btnResetSearch.removeAttribute("style");
    }
}
//------------------------------------------TIMER ONE SECOND
function oneSecondTimer() {
    //check on change date value
    if (selectDateStart.value != dateStartValue) {
        dateStartValue = selectDateStart.value;
        onDateStartChange();
    }
    if (selectDateEnd.value != dateEndValue) {
        dateEndValue = selectDateEnd.value;
        onDateEndChange();
    }
    updateFooterSessionInfo();
    liveLogTask();
}
//---------------------------------------------UTILS
function errorSession() {
    logged = false;
    body.innerHTML = "Brak dostępu. Sesja wygasła?";
}

function convertSecondsToMinutesAndSeconds(seconds) {
    var minutes = Math.floor(seconds / 60);
    var remainingSeconds = seconds % 60;
    return {
        minutes: minutes,
        seconds: remainingSeconds
    };
}

function dateToTimestamp(value) {
    const date = new Date(value);
    let result = Math.floor(date.getTime() / 1000);
    if (isNaN(result)) result = 0;
    return result;
}

function formatDate(date) {
    var year = date.getFullYear();
    var month = ('0' + (date.getMonth() + 1)).slice(-2);
    var day = ('0' + date.getDate()).slice(-2);
    var hours = ('0' + date.getHours()).slice(-2);
    var minutes = ('0' + date.getMinutes()).slice(-2);
    return year + '-' + month + '-' + day + 'T' + hours + ':' + minutes;
}


function scrollDownLogs() {
    var scrollHeight = handlerLogContent.scrollHeight;
    $('.logContent').stop().animate({ scrollTop: scrollHeight }, 500, 'swing', function () {
        //finish animating
    });
}

function getColorEntry(type) {
        switch(type) {
            case 0: return "#d76060";
            case 1: return "#6a76a9";
            case 2: return "#98a56b";
            case 3: return "#af6b00";
        }
        return "#959595";
}

function colorLogs(logText, logType) {
    const replacements = [
        { text: "[Lokalny]", className: "tagLocal" },
        { text: "[Uczestnik]", className: "tagEventchat" },
        { text: "[Gracz]", className: "tags" },
        { text: "[EVP]", className: "tagEvp" },
        { text: "[SVP]", className: "tagSvp" },
        { text: "[VIP]", className: "tagVip" },
        { text: "[A]", className: "tagAdmin" },
        { text: "[M]", className: "tagMod" },
        { text: "[GM]", className: "tagGamemaster" },
        { text: "[S]", className: "tagSupport" },
        { text: "[SPY]", className: "tagSpy" },
        { text: "[DETAIL]", className: "tagDetail" },
        { text: "[ADMIN]", className: "tagAdmin" },
        { text: "->", className: "spyArrow" },
        { text: "[Adminchat]", className: "tagAdminchat" },
        { text: "dołączył/a do serwera. Klient:", className: "connect" },
        { text: " | IP:", className: "connect" },
        { text: "opuścił/a serwer. Powód:", className: "disconnect" },
        { text: "wpisał/a komendę:", className: "command" }
    ];

    let detectedNickname = null;
    let spyTargetNickname = null;
    const splitString = logText.split(' ');
    switch(logType) {
        case 0: {//all
            //detectedNickname = splitString[1];
            break;
        };
        case 1: {//commands
            detectedNickname = splitString[0];
            break;
        }
        case 2: {//chat
            if(splitString[1] == "[Gracz]" || splitString[1] == "[EVP]" ||
                splitString[1] == "[SVP]" || splitString[1] == "[VIP]" ||
                splitString[1] == "[A]" || splitString[1] == "[M]" ||
                splitString[1] == "[GM]" || splitString[1] == "[S]") {
                detectedNickname = splitString[2];
            } else detectedNickname = splitString[1];

            if(splitString[0] == "[SPY]") {
                spyTargetNickname = splitString[3];
            }
            
            break;
        }
        case 3: {//JoinLeave
            detectedNickname = splitString[0];
            break;
        };
    }

    

    if(detectedNickname != null) {
        logText = logText.replace(detectedNickname, `<span class="nickname">${detectedNickname}</span>`);
    }
    if(spyTargetNickname != null) {
        logText = logText.replace(spyTargetNickname, `<span class="nickname">${spyTargetNickname}</span>`);
    }

    replacements.forEach(replacement => {
        logText = logText.split(replacement.text).join(`<span class="${replacement.className}">${replacement.text}</span>`);
    });

    const ipRegex = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g;
    logText = logText.replace(ipRegex, '<a href="https://whatismyipaddress.com/ip/$&" target="_blank" class="ip">$&</a>');

    return logText;
}

function refreshPageNavigation() {
    //render select page option
    let genSelectHtml = "";
    if (currentTotalEntries != 0) {
        for (let p = 1; p <= currentMaxPage; p++) {
            genSelectHtml += `<option id="optionPage" value="${p}">Strona ${p}/${currentMaxPage}</option>`;
        }
    } else {
        genSelectHtml = `<option id="optionPage" value="1">Brak danych</option>`;
        let contentHTML = `<div class="logEntry">Brak danych z okresu ${currentDateStart} - ${currentDateEnd} z aktualnymi filtrami.</div>`;
        handlerLogContent.innerHTML = contentHTML;
    }
    selectPage.innerHTML = genSelectHtml;
    //disable buttons
    //previous page
    if (currentPage == 1) {
        btnPrevoiusPage.setAttribute("style", "color: red; cursor: not-allowed;");
    } else {
        btnPrevoiusPage.removeAttribute("style");
    }
    //next page
    if (currentPage == currentMaxPage || currentMaxPage == 0) {
        btnNextPage.setAttribute("style", "float: right; color: red; cursor: not-allowed;");
    } else {
        btnNextPage.setAttribute("style", "float: right;");
    }
}
//------------------------------------------API
function requestAPI(request) {
    return new Promise(resolve => {
        fetch('/api?' + request)
            .then(response => response.json())
            .then(data => handleServerStatus(data));

        function handleServerStatus(data) {
            return resolve(data);
        }
    });
}

