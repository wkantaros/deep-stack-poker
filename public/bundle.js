(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const {TableState, Player, GameState} = require('../sharedjs');

let socket = io();

let host = document.getElementById('host'),
    send_btn = document.getElementById('send'),
    message = document.getElementById('message'),
    message_output = document.getElementById('chat-output'),
    feedback = document.getElementById('feedback'),
    newPlayer = document.getElementById('new-playerName'),
    newStack = document.getElementById('new-stack'),
    buyinSubmit = document.getElementById('buyin-btn'),
    buyin = document.getElementById('buyin'),
    quit = document.getElementById('quit-btn'),
    start_btn = document.getElementById('start'),
    call = document.getElementById('call'),
    check = document.getElementById('check'),
    fold = document.getElementById('fold'),
    minBet = document.getElementById('min-bet'),
    showHand = document.getElementById('show-hand'),
    straddleSwitch = document.getElementById('straddle-switch'),
    standUp = document.getElementById('stand-up'),
    sitDown = document.getElementById('sit-down');
    // standup = document.getElementById('standup-btn');


//resize page (to fit)

var $el = $("#page-contents");
var elHeight = $el.outerHeight();
var elWidth = $el.outerWidth();

var $wrapper = $("#scaleable-wrapper");

$wrapper.resizable({
  resize: doResize
});

function doResize(event, ui) {
  
  var scale, origin;
    
  scale = Math.min(
    ui.size.width / elWidth,    
    ui.size.height / elHeight
  );
  
  $el.css({
    transform: "translate(-50%, -50%) " + "scale(" + scale + ")"
  });
  
}

var starterData = { 
  size: {
    width: $wrapper.width(),
    height: $wrapper.height()
  }
};
doResize(null, starterData);

//helper function
const getMaxRoundBet = () => {
    if (!tableState.table) return 0;
    return Math.max(...tableState.table.players.map(p=>p.bet));
};

//header functions--------------------------------------------------------------------------------
$(document).mouseup(function (e) {
    let buyinInfo = $('#buyin-info');
    // if the target of the click isn't the container nor a descendant of the container
    if (!buyinInfo.is(e.target) && buyinInfo.has(e.target).length === 0) {
        buyinInfo.removeClass('show');
    }
});

let loggedIn = false;
$('#buyin').on('click', () => {
    if (!loggedIn)
        $('#buyin-info').addClass('show');
});

/**
 * logIn hides buyin-info ("Join Game") button in header and replaces it with the quit button
 */
const logIn = (standingUp) => {
    loggedIn = true;
    $('#buyin-info').removeClass('show');
    $('#quit-btn').removeClass('collapse');
    $('#buyin').addClass('collapse');
    if (standingUp) {
        showSitDownButton();
    } else {
        showStandUpButton();
    }
};

const logOut = () => {
    loggedIn = false;
    $('#quit-btn').addClass('collapse');
    $('#buyin').removeClass('collapse');
    $('#sit-down').addClass('collapse');
    $('#stand-up').addClass('collapse');
};

$('#buyin-btn').on('click', () => {
    console.log('here!');
    let regex = RegExp(/^\w+(?:\s+\w+)*$/);
    let playerName = newPlayer.value.trim();
    if (playerName.length < 2 || playerName.length > 10) {
        alert('name must be between 2 and 10 characters');
    } else if (!regex.test(playerName)){
        alert('no punctuation in username');
    } else if (playerName === 'guest'){
        alert("'guest' cannot be a username");
    } else if (alreadyExistingName(playerName)){
        alert('please enter a username that is not already at the table')
    } else if (!parseInt(newStack.value) && (parseInt(newStack.value) > 0)) {
        alert("Please enter valid stackinformation");
    } else {
        logIn(false);
        let playerName = newPlayer.value;
        let stack = parseInt(newStack.value);
        socket.emit('buy-in', {
            playerName: playerName,
            stack: stack
        });
    }
});

$('#buyin-info').keydown(function (e){
    e.stopPropagation();
});

quit.addEventListener('click', () => {
    socket.emit('leave-game', {});
    logOut();
});

const showSitDownButton = () => {
    $('#stand-up').addClass('collapse');
    $('#sit-down').removeClass('collapse');
};

const showStandUpButton = () => {
    console.log('should be removing class');
    $('#sit-down').addClass('collapse');
    $('#stand-up').removeClass('collapse');
};

standUp.addEventListener('click', () => {
    socket.emit('stand-up');
    showSitDownButton();
});

sitDown.addEventListener('click', () => {
    socket.emit('sit-down');
    showStandUpButton()
});

$('#getLink').click(() => copyLink());

let copyLink = () => {
    copyStringToClipboard(window.location.href);
    let link = document.getElementById('getLink');
    link.innerHTML = 'link copied!';
    setTimeout(() => {
        link.innerHTML = 'get sharable link'
    }, 2000);
};

function copyStringToClipboard(str) {
    // Create new element
    var el = document.createElement('textarea');
    // Set value (string to be copied)
    el.value = str;
    // Set non-editable to avoid focus and move outside of view
    el.setAttribute('readonly', '');
    el.style = {
        position: 'absolute',
        left: '-9999px'
    };
    document.body.appendChild(el);
    // Select text inside element
    el.select();
    // Copy text to clipboard
    document.execCommand('copy');
    // Remove temporary element
    document.body.removeChild(el);
}

const getMaximumAllowedBet = () => {
    if (!tableState.gameInProgress || !tableState.player) return 0;
    return Math.min(tableState.player.chips + tableState.player.bet, tableState.table.maxBetPossible(tableState.player.playerName));
};

const getMinimumAllowedBet = () => {
    if (!tableState.gameInProgress || !tableState.player) return 0;
    return Math.min(tableState.player.chips + tableState.player.bet, tableState.table.minimumBetAllowed(tableState.player.playerName));
};

//action buttons ------------------------------------------------------------------------------------------------------------
//action buttons ------------------------------------------------------------------------------------------------------------
//action buttons ------------------------------------------------------------------------------------------------------------
//action buttons ------------------------------------------------------------------------------------------------------------
//action buttons ------------------------------------------------------------------------------------------------------------
//action buttons ------------------------------------------------------------------------------------------------------------
//action buttons ------------------------------------------------------------------------------------------------------------
//action buttons ------------------------------------------------------------------------------------------------------------
//action buttons ------------------------------------------------------------------------------------------------------------
$('#bet').on('click', () => {
    let submit = !$('#bet-actions').hasClass('collapse');
    if (submit) {
        placeBet();
        $('#bet-actions').toggleClass('collapse');
        $('#back').toggleClass('collapse');
        $('#fold').toggleClass('collapse');
        $('#check').toggleClass('collapse');
        $('#min-bet').toggleClass('collapse');
        $('#c').toggleClass('collapse');
    } else {
        $('#bet-actions').toggleClass('collapse');
        $('#back').toggleClass('collapse');
        $('#fold').toggleClass('collapse');
        $('#check').toggleClass('collapse');
        $('#min-bet').toggleClass('collapse');
        $('#c').toggleClass('collapse');
        let slider = document.getElementById("betRange");
        let output = document.getElementById("bet-input-val");
        slider.value = output.value;
        output.focus();
        const minimum = getMinimumAllowedBet();
        output.value = minimum; // Display the default slider value
        slider.min = minimum;
        slider.max = getMaximumAllowedBet();
        
        // Update the current slider value (each time you drag the slider handle)
        slider.oninput = function () {
            output.value = this.value;
            output.focus();
        } 
    }
});

const getBetInput = () => {
    return parseInt(document.getElementById("bet-input-val").value);
};

const getRaiseInput = () => {
    return parseInt(document.getElementById("raise-input-val").value);
};

$('#betplus').on('click', () => {
    let bb = getBigBlind();
    let maxval = getMaximumAllowedBet();
    handleBetSliderButtons(Math.min(getBetInput() + bb, maxval));
});

$('#betminus').on('click', () => {
    let bb = getBigBlind();
    handleBetSliderButtons(Math.max(getBetInput() - bb, bb));

});

$('#bai').on('click', () => {
    handleBetSliderButtons(getMaximumAllowedBet());
});

$('#bp').on('click', () => {
    handleBetSliderButtons(getPotSize());
});

$('#btqp').on('click', () => {
    handleBetSliderButtons(Math.floor(3 * getPotSize() / 4));
});

$('#bhp').on('click', () => {
    handleBetSliderButtons(Math.floor(getPotSize() / 2));
});

$('#bqp').on('click', () => {
    handleBetSliderButtons(Math.max(Math.floor(getPotSize() / 4), getBigBlind()));
});

$('#mb').on('click', () => {
    handleBetSliderButtons(getBigBlind());
});

let closingPreflopAction = false;
$('#back').on('click', () => {
    if (!$('#bet').hasClass('collapse')){
        $('#fold').toggleClass('collapse');
        $('#check').toggleClass('collapse');
        $('#min-bet').toggleClass('collapse');
        $('#bet-actions').toggleClass('collapse');
        $('#back').toggleClass('collapse');
        $('#c').toggleClass('collapse');
    }
    else if (!$('#raise').hasClass('collapse')){
        $('#fold').toggleClass('collapse');
        // TODO
        if (closingPreflopAction) {
            $('#check').toggleClass('collapse')
        } else {
            $('#call').toggleClass('collapse');
        }
        $('#raise-actions').toggleClass('collapse');
        $('#back').toggleClass('collapse');
        $('#c').toggleClass('collapse');
    }
});

$('#bet-input-val').keydown(function (e) {
    e.stopPropagation();
    // enter key
    if (e.keyCode == 13) {
        if (placeBet()) {
            $('#bet').click();
        }
    }
    // b key (back)
    if (event.keyCode === 66 && !$('#back').hasClass('collapse')) {
        $('#back').click();
    }
});

const handleBetSliderButtons = (outputVal) => {
    console.log('val', outputVal);
    let slider = document.getElementById("betRange");
    let output = document.getElementById("bet-input-val");
    output.value = outputVal;
    slider.value = output.value;
    output.focus();
};

const handleRaiseSliderButtons = (outputVal) => {
    console.log('rval', outputVal);
    let slider = document.getElementById("raiseRange");
    let output = document.getElementById("raise-input-val");
    output.value = outputVal;
    slider.value = output.value;
    output.focus();
};

const placeBet = () => {
    console.log('bet');
    let betAmount = parseInt($('#bet-input-val').val());
    let minBetAmount = getMinimumAllowedBet();
    let maxBetAmount = getMaximumAllowedBet();

    if (betAmount > maxBetAmount) { // if player bet more than max amount, bet max amount
        betAmount = maxBetAmount;
    } else if (betAmount < minBetAmount) { // if player bet < min bet
        alert(`minimum bet size is ${minBetAmount}`);
        return false;
    } else if (!betAmount) { // if player did not enter a bet
        alert(`minimum bet size is ${minBetAmount}`);
        return false;
    }
    socket.emit('action', {
        amount: betAmount,
        action: 'bet'
    });
    return true;
};

// hacky global variable
$('#raise').on('click', () => {
    let submit = !$('#raise-actions').hasClass('collapse');
    if (submit) {
        placeRaise();
        $('#raise-actions').toggleClass('collapse');
        $('#back').toggleClass('collapse');
        $('#fold').toggleClass('collapse');
        if (closingPreflopAction) {
            $('#check').toggleClass('collapse')
        } else {
            $('#call').toggleClass('collapse');
        }
        $('#c').toggleClass('collapse');
    } else {
        $('#raise-actions').toggleClass('collapse');
        $('#back').toggleClass('collapse');
        $('#fold').toggleClass('collapse');
        closingPreflopAction = !$('#check').hasClass('collapse');
        if (closingPreflopAction) {
            $('#check').toggleClass('collapse')
        } else {
            $('#call').toggleClass('collapse');
        }
        $('#c').toggleClass('collapse');
        let slider = document.getElementById("raiseRange");
        let output = document.getElementById("raise-input-val");
        slider.value = output.value;
        output.focus();
        console.log('ts', tableState);
        const minAmount = Math.min(getMinRaiseAmount(), tableState.player.bet + tableState.player.chips);
        output.value = minAmount; // Display the default slider value
        slider.min = minAmount;
        slider.max = Math.min(tableState.player.bet + tableState.player.chips, tableState.table.otherPlayersMaxStack(tableState.player.playerName));

        // Update the current slider value (each time you drag the slider handle)
        slider.oninput = function () {
            output.value = this.value;
            output.focus();
        }
    }
});

const setRaiseSliderTo = (num) => {
    let valormr = Math.max(Math.floor(num), getMinRaiseAmount());
    handleRaiseSliderButtons(Math.min(valormr, getMaximumAllowedBet()));
};

$('#raiseplus').on('click', () => {
    let output = document.getElementById("raise-input-val");
    setRaiseSliderTo(parseInt(output.value) + getBigBlind())
});

$('#raiseminus').on('click', () => {
    setRaiseSliderTo(getRaiseInput() - getBigBlind());
});

$('#rai').on('click', () => {
    setRaiseSliderTo(getMaximumAllowedBet());
});

$('#rthp').on('click', () => {
    setRaiseSliderTo(3 * getPotSize());
});

$('#rtp').on('click', () => {
    setRaiseSliderTo(2 * getPotSize());
});

$('#rsqp').on('click', () => {
    setRaiseSliderTo(6 * getPotSize() / 4);
});

$('#rp').on('click', () => {
    setRaiseSliderTo(getPotSize());
});

$('#mr').on('click', () => {
    // min raise or all in
    setRaiseSliderTo(getMinRaiseAmount());
});

$('#raise-input-val').keydown(function (e) {
    e.stopPropagation();
    if (e.keyCode == 13) {
        if (placeRaise()) {
            $('#raise').click();
        }
    }
    // b key (back)
    if (event.keyCode === 66 && !$('#back').hasClass('collapse')) {
        $('#back').click();
    }
});

const requestState = () => {
    socket.emit('request-state', {
        gameState: true,
        playerStates: true,
        handState: true,
    })
};

let placeRaise = () => {
    let raiseAmount = parseInt($('#raise-input-val').val());
    console.log('raise', raiseAmount);
    // console.log(raiseAmount);
    let minRaiseAmount = getMinRaiseAmount();
    let maxRaiseAmount = getStack();
    console.log('maxRaiseAmount', maxRaiseAmount);
    if (raiseAmount > maxRaiseAmount) {
        raiseAmount = maxRaiseAmount;
    }

    if (raiseAmount == maxRaiseAmount && maxRaiseAmount < minRaiseAmount) {
        console.log('all in player');
        socket.emit('action', {
            amount: raiseAmount,
            action: 'call'
        });
        return true;
    } else if (!raiseAmount || raiseAmount < minRaiseAmount) {
        alert(`minimum raise amount is ${minRaiseAmount}`);
    } else if (raiseAmount == maxRaiseAmount) { // player is going all in
        socket.emit('action', {
            amount: raiseAmount,
            action: 'bet'
        });
        return true;
    } else {
        socket.emit('action', {
            amount: raiseAmount,
            action: 'raise'
        });
        return true;
    }
    return false;
};

start_btn.addEventListener('click', () => {
    console.log('starting game');
    socket.emit('start-game', {});
});

call.addEventListener('click', () => {
    console.log('call');
    socket.emit('action', {
        amount: 0,
        action: 'call'
    });
});

check.addEventListener('click', () => {
    console.log('check');
    socket.emit('action', {
        amount: 0,
        action: 'check'
    });
});

fold.addEventListener('click', () => {
    console.log('fold');
    socket.emit('action', {
        amount: 0,
        action: 'fold'
    });
});

showHand.addEventListener('click', () => {
    console.log('click show hand');
    socket.emit('show-hand', {});
    $('#show-hand').addClass('collapse');
});

minBet.addEventListener('click', () => {
    console.log('min bet');
    console.log(getBigBlind());
    socket.emit('action', {
        amount: getBigBlind(),
        action: 'bet'
    });
});

// let isStraddling = false;
// straddleSwitch.addEventListener('click', () => {
//     isStraddling = !isStraddling;
//     console.log(`straddle enabled: ${isStraddling}`);
//     if (isStraddling) {
//         $('#straddle-switch').html('Disable Straddling');
//     } else {
//         $('#straddle-switch').html('Enable Straddling');
//     }
//     socket.emit('straddle-switch', {
//         isStraddling: isStraddling
//     });
// });

$('input[name=singleStraddleBox]').change(function () {
    if ($(this).is(':checked')) {
        console.log('player elects to straddle utg');
        socket.emit('straddle-switch', {
            isStraddling: true,
            straddletype: 1
        });
    } else {
        console.log('player elects to stop straddling utg');
        socket.emit('straddle-switch', {
            isStraddling: false,
            straddletype: 0
        });
    }
});

$('input[name=multiStraddleBox]').change(function () {
    if ($(this).is(':checked')) {
        console.log('player elects to start multi straddling');
        socket.emit('straddle-switch', {
            isStraddling: true,
            straddletype: -1
        });
    } else {
        console.log('player elects to stop multi straddling');
        socket.emit('straddle-switch', {
            isStraddling: false,
            straddletype: 0
        });
    }
});

// keyboard shortcuts for all events
// -------------------------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------------------------
// -------------------------------------------PREMOVE ACTION BUTTONS--------------------------------------------------
// -------------------------------------------PREMOVE ACTION BUTTONS--------------------------------------------------
// -------------------------------------------PREMOVE ACTION BUTTONS--------------------------------------------------
// -------------------------------------------PREMOVE ACTION BUTTONS--------------------------------------------------
// -------------------------------------------PREMOVE ACTION BUTTONS--------------------------------------------------
// -------------------------------------------PREMOVE ACTION BUTTONS--------------------------------------------------
// -------------------------------------------PREMOVE ACTION BUTTONS--------------------------------------------------
// -------------------------------------------PREMOVE ACTION BUTTONS--------------------------------------------------
// -------------------------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------------------------

// have to do it this way bc of safari (super annoying)
$('#pm-check').on('click', (e) => {
    if ($('#pm-check').hasClass('pm')){
        $('.pm-btn').removeClass('pm');
    } else {
        $('.pm-btn').removeClass('pm');
        $('#pm-check').addClass('pm');
    }
    e.stopPropagation();
});

$('#pm-call').on('click', (e) => {
    if ($('#pm-call').hasClass('pm')) {
        $('.pm-btn').removeClass('pm');
    } else {
        $('.pm-btn').removeClass('pm');
        $('#pm-call').addClass('pm');
    }
    e.stopPropagation();
});

$('#pm-checkfold').on('click', (e) => {
    if ($('#pm-checkfold').hasClass('pm')) {
        $('.pm-btn').removeClass('pm');
    } else {
        $('.pm-btn').removeClass('pm');
        $('#pm-checkfold').addClass('pm');
    }
    e.stopPropagation();
});

$('#pm-fold').on('click', (e) => {
    if ($('#pm-fold').hasClass('pm')) {
        $('.pm-btn').removeClass('pm');
    } else {
        $('.pm-btn').removeClass('pm');
        $('#pm-fold').addClass('pm');
    }
    e.stopPropagation();
});

const checkForPremoves = () => {
    if ($('#pm-fold').hasClass('pm')){
        return '#fold';
    }
    if ($('#pm-call').hasClass('pm')){
        return '#call';
    }
    if ($('#pm-check').hasClass('pm')){
        return '#check';
    }
    if ($('#pm-checkfold').hasClass('pm')){
        return '#check';
    }
    return undefined;
};


// keyboard shortcuts for all events ------------------------------------------------------------------------------------------------
$(document).keydown(function (event) {
    // m key
    if (event.keyCode === 77) {
        event.preventDefault();
        message.focus();
    }
    // k key (check)
    if (event.keyCode === 75 && !$('#check').hasClass('collapse')){
        check.click();
    }
    // k key (premove check)
    if (event.keyCode === 75 && !$('#pm-check').hasClass('collapse')){
        $('#pm-check').click();
    }
    // c key (call)
    if (event.keyCode === 67 && !$('#call').hasClass('collapse')){
        call.click();
    }
    // c key (premove call)
    if (event.keyCode === 67 && !$('#pm-call').hasClass('collapse')){
        $('#pm-call').click();
    }
    // c key (min bet)
    if (event.keyCode === 67 && !$('#min-bet').hasClass('collapse')){
        minBet.click();
    }
    // i key (premove check/fold)
    if (event.keyCode === 73 && !$('#pm-checkfold').hasClass('collapse')){
        $('#pm-checkfold').click();
    }
    // r key (raise)
    if (event.keyCode === 82 && !$('#raise').hasClass('collapse')){
        raise.click();
    }
    // r key (bet)
    if (event.keyCode === 82 && !$('#bet').hasClass('collapse')){
        bet.click();
    }
    // b key (back)
    if (event.keyCode === 66 && !$('#back').hasClass('collapse')){
        $('#back').click();
    }
    // f key (fold)
    if (event.keyCode === 70 && !$('#fold').hasClass('collapse')){
        fold.click();
    }
    // f key (premove fold)
    if (event.keyCode === 70 && !$('#pm-fold').hasClass('collapse')){
        $('#pm-fold').click();
    }
    if (event.keyCode === 83 && !$('#show-hand').hasClass('collapse')) {
        $('#show-hand').click();
    }
});

function isVolumeOn() {
    return $('.volume').hasClass('on');
}

$(".volume").click( function (e) {
    if (isVolumeOn()){
        $('#volume-icon').attr('src', "../public/img/mute.svg");
        $('.volume').removeClass('on');
    } else {
        $('#volume-icon').attr('src', "../public/img/volume.svg");
        $('.volume').addClass('on');
    }
} );


function playSoundIfVolumeOn(soundName) {
    if (isVolumeOn()){
        createjs.Sound.play(soundName);
    }
}

//chat room functions-----------------------------------------------------------------------------
//send the contents of the message to the server
send_btn.addEventListener('click', () => {
    // console.log(name.getElementsByClassName('username')[0].innerHTML);
    // console.log(name.innerText);
    socket.emit('chat', {
        message: message.value,
    });
    message.value = null;
});

//allow user to send message with enter key
message.addEventListener("keydown", (event) => {
    // Number 13 is the "Enter" key on the keyboard
    event.stopPropagation();
    if (event.keyCode === 13) {
        if (message.value) {
            $('#message').blur();
            event.preventDefault();
            send_btn.click();
        }
    }
});

//let the server know somebody is typing a message
message.addEventListener('keypress', () => {
    socket.emit('typing');
});

//Listen for events--------------------------------------------------------------------------------

const setTurnTimer = (delay) => {
    socket.emit('set-turn-timer', {delay: delay});
};

const kickPlayer = (playerName) => {
    console.log(`kicking player ${playerName}`);
    socket.emit('kick-player', {playerName: playerName});
};

socket.on('player-disconnect', (data) => {
    console.log(`${data.playerName} disconnected`)
    // TODO: do something that makes it clear that the player is offline, such as making
    //  their cards gray or putting the word "offline" next to their name
});

socket.on('player-reconnect', (data) => {
    console.log(`${data.playerName} reconnected`);
    // TODO: undo the effects of the player-disconnect event listener
});

let tableState = {}; // not used for rendering.
function setState(data) {
    if (data.table) {
        // Make allPlayers an array of Player objects
        data.table.allPlayers = data.table.allPlayers.map(p => p === null ? null: Object.assign(new Player(p.playerName, p.chips, p.isStraddling, p.seat, p.isMod), p));
        // Make game a GameState object
        data.table.game = data.table.game === null ? null: Object.assign(new GameState(data.table.game.bigBlind, data.table.game.smallBlind), data.table.game);
        // If uninitialized, initialize tableState.table to a TableState object
        if (!tableState.table) {
            tableState.table = new TableState(data.table.smallBlind, data.table.bigBlind, data.table.minPlayers, data.table.maxPlayers, data.table.minBuyIn, data.table.maxBuyIn, data.table.straddleLimit, data.table.dealer, data.table.allPlayers, data.table.currentPlayer, data.table.game);
        }
        // Update properties of tableState.table
        for (let prop of Object.keys(data.table)) {
            if (data.table.hasOwnProperty(prop))
                tableState.table[prop] = data.table[prop];
        }

        // if (data.gameInProgress && tableState.table.canPlayersRevealHands()) {
        //     displayButtons({availableActions: {'show-hand': true}, canPerformPremoves: false});
        // }
    }
    if (data.player) {
        if (!tableState.player)
            tableState.player = new Player(data.player.playerName, data.player.chips, data.player.isStraddling, data.player.seat, data.player.isMod)
        Object.assign(tableState.player, data.player);
    }
    tableState.gameInProgress = data.gameInProgress;
    if (tableState.gameInProgress && tableState.player) {
        renderStraddleOptions(true);
    } else {
        renderStraddleOptions(false);
    }
}

socket.on('state-snapshot', setState);

const addModAbilities = () => {
    $('#quit-btn').removeClass('collapse');
    $('#buyin').addClass('collapse');
    $('#host-btn').removeClass('collapse');
    // TODO: show mod panel or set turn timer button
};

const removeModAbilities = () => {
    $('#host-btn').addClass('collapse');
    $('#start').addClass('collapse');
};

// add additional abilities for mod
socket.on('add-mod-abilities', addModAbilities);

socket.on('bust', (data) => {
    logOut();
    // remove additional abilities for mod when mod leaves
    if (data.removeModAbilities)
        removeModAbilities();
});

// remove additional abilities for mod when mod leaves
socket.on('remove-mod-abilities', (data) => {
    removeModAbilities();
});

//incoming chat
socket.on('chat', (data) => {
    let date = new Date;
    let minutes = (date.getMinutes() < 10) ? `0${date.getMinutes()}` : `${date.getMinutes()}`;
    let time = `${date.getHours()}:${minutes} ~ `;
    outputMessage(`<span class='info'>${time}${data.handle}</span> ${data.message}`);
});

//somebody is typing
socket.on('typing', (data) => {
    feedback.innerHTML = '<p><em>' + data + ' is writing a message...</em></p>';
    $("#chat-window").scrollTop($("#chat-window")[0].scrollHeight);
});

// player buys in
socket.on('buy-in', (data) => {
    feedback.innerHTML = '';
    message_output.innerHTML += '<p><em>' + data.playerName + ' buys in for ' + data.stack +'</em></p>';
});

//somebody left the game
socket.on('buy-out', (data) => {
    outputEmphasizedMessage(` ${data.playerName} has left the game (finishing stack: ${data.stack})`);
    // if ($('.volume').hasClass('on')) {
    //     createjs.Sound.play('fold');
    // }
    // outHand(data.seat);
    $(`#${data.seat}`).addClass('out');
});

socket.on('stand-up', data => {
    // TODO: do we want to do anything here?
    outputEmphasizedMessage(data.playerName + 'stands up.');
});

socket.on('sit-down', data => {
    // TODO: do we want to do anything here?
    outputEmphasizedMessage(data.playerName + 'sits down.');
});

function renderPlayer(p) {
    let hand = document.getElementById(p.seat);
    hand.classList.remove('hidden');
    hand.querySelector('.username').innerHTML = p.playerName;
    hand.querySelector('.stack').innerHTML = p.stack;
    if (p.standingUp) {
        // TODO: how do we want to display when a player is standing up?
        $(`#${p.seat}`).find('.back-card').addClass('waiting');
        $(`#${p.seat}`).find('.hand-rank-message').addClass('waiting');
        console.log(p.playerName + 'is standing up.');
        // hideCards(p.seat);
    } else if (p.waiting){
        $(`#${p.seat}`).find('.back-card').addClass('waiting');
        $(`#${p.seat}`).find('.hand-rank-message').addClass('waiting');
    } else if (p.betAmount <= 0) {
        hideBet(p.seat)
    } else if (p.betAmount > 0) {
        showBet(p.seat, p.betAmount);
    }
}

// render players at a table
socket.on('render-players', (data) => {
    for (let i = 0; i < data.length; i++){
        renderPlayer(data[i]);
    }
});

// makes all the cards gray
socket.on('waiting', (data) => {
    for (let i = 0; i < 10; i++){
        outHand(i);
    }
});

function hideSeat(seat) {
    $(`#${seat}`).addClass('hidden');
    $(`#${seat}`).find('.username').text('guest');
    $(`#${seat}`).find('.stack').text('stack');
}

function hideCards(seat) {
    $(`#${seat} > .left-card`).addClass('hidden');
    $(`#${seat} > .right-card`).addClass('hidden');
    $(`#${seat} > .hand-rank-message-container`).addClass('hidden');
}

function unhideCards(seat) {
    $(`#${seat} > .left-card`).removeClass('hidden');
    $(`#${seat} > .right-card`).removeClass('hidden');
    $(`#${seat} > .hand-rank-message-container`).removeClass('hidden');
}

// removes old players (that have busted or quit)
socket.on('remove-out-players', (data) => {
    $('.out').each(function(){
        $(this).find('.username').text('guest');
        $(this).find('.stack').text('stack');
    });
    $('.out').addClass('hidden').removeClass('out');
    // if seat passed in remove it
    if (data.hasOwnProperty('seat')){
        hideSeat(data.seat);
    }
});

// data is {seat, time}
// time is milliseconds until the player's turn expires and they are forced to fold.
// seat is not necessarily the next action seat, as the timer could have been refreshed.
// in all other cases, seat should be the action seat.
// if time <= 0, remove the timer.
socket.on('render-timer', (data) => {
    // Clear existing turn timers
    // $('.name').removeClass('turn-timer');
    // Set new timer for data.playerName
    if (data.time > 0) {
        // TODO: implement front end graphics for turn timer
        // $(`#${data.seat} > .name`).addClass('turn-timer');
    } else {
        // TODO: remove graphics for turn timer
        // no longer display the timer
    }
});

const showCard = (card, locator) => {
    let cardRank = (card.charAt(0) == 'T') ? '10' : card.charAt(0);
    let cardSuit = getSuitSymbol(card.charAt(1));
    let cardColor = getColor(card.charAt(1));
    $(locator).removeClass('black').addClass(cardColor);
    $(locator).find('.card-corner-rank').html(cardRank);
    $(locator).find('.card-corner-suit').html(cardSuit);
};

const showFlop = (board) => {
    $('#flop').removeClass('hidden');
    for (let i = 0; i < 3; i++){
        showCard(board[i], `#flop .card:nth-child(${i+1})`);
    }
    flipCard('flop');
};

const showTurn = (board) => {
    $('#turn').removeClass('hidden');
    showCard(board[3], `#turn .card`);
    flipCard('turn');
};

const showRiver = (board) => {
    $('#river').removeClass('hidden');
    showCard(board[4], `#river .card`);
    flipCard('river');
};

const hideBoardPreFlop = () => {
    $('#flop').addClass('hidden');
    $('#turn').addClass('hidden');
    $('#river').addClass('hidden');
    $('#cards').find('.back-card').removeClass('hidden');
    $('#cards').find('.card-topleft').addClass('hidden');
    $('#cards').find('.card-bottomright').addClass('hidden');
};

// when the players joins in the middle of a hand
// data: {street, board, sound, logIn}
socket.on('sync-board', (data) => {
    $('.pm-btn').removeClass('pm');
    if (data.logIn) {
        logIn(tableState.player.standingUp);
    }
    console.log('syncing board', JSON.stringify(data));
    hideBoardPreFlop();
    dealStreet(data);

    // for (let i = 0; i < tableState.table.allPlayers.length; i++) {
    //     const p = tableState.table.allPlayers[i];
    //     if (p === null) {
    //         hideSeat(i);
    //         continue;
    //     }
    //     if (!p.inHand) {
    //         if (p.standingUp) { // players that stood up in a previous hand or before the game started
    //
    //         } else { // waiting players
    //
    //         }
    //     } else { // players in the current hand
    //
    //     }
    // }
});

const dealStreet = (data) => {
    if (data.street === 'deal') {
        hideBoardPreFlop();
        if (data.sound) playSoundIfVolumeOn('deal');
        return;
    }
    showFlop(data.board);
    if (data.street === 'flop') {
        if (data.sound) playSoundIfVolumeOn('flop');
        return;
    }
    showTurn(data.board);
    if (data.street === 'turn') {
        if (data.sound) playSoundIfVolumeOn('turn');
        return;
    }
    showRiver(data.board);
    if (data.sound) playSoundIfVolumeOn('river');
};

// renders the board (flop, turn, river)
socket.on('render-board', (data) => {
    $('.pm-btn').removeClass('pm');
    hideAllBets();
    dealStreet(data);
});


// renders the board (flop, turn, river)
// data: {street: '', board: [], sound: boolean, handRanks: {'': [{seat: number, handRankMessage: ''},...]}}
socket.on('render-all-in', (data) => {
    $('.pm-btn').removeClass('pm');
    hideAllBets();
    renderAllIn(data.board, data.handRanks);
});

const renderAllIn = (board, handRanks) => {
    console.log(board);
    if ($('#flop').hasClass('hidden')) {
        showFlop(board);
        playSoundIfVolumeOn('flop');
        renderHands(handRanks['flop']);
        setTimeout(() => {
            renderAllIn(board, handRanks);
        }, 1200);
    } else if ($('#turn').hasClass('hidden')) {
        showTurn(board);
        playSoundIfVolumeOn('turn');
        renderHands(handRanks['turn']);
        setTimeout(() => {
            renderAllIn(board, handRanks);
        }, 1800);
    } else {
        showRiver(board);
        playSoundIfVolumeOn('river');
        renderHands(handRanks['river']);
    }
};

socket.on('update-rank', (data) => {
    // TODO: update rank on front end
    console.log(`hand rank update: ${data.handRankMessage}`)
    renderHandRank(data.seat, data.handRankMessage);
});

// renders a players hand. data is formatted like so:
//{
//  cards: ["4H","QD"],
//  seat: 1,
//  folded: false,
//  handRankMessage: "High Card",
// }
socket.on('render-hand', (data) => {
    console.log('rendering hand');
    console.log(data.cards, data.handRankMessage);
    renderHand(data.seat, data.cards, data.folded);
    renderHandRank(data.seat, data.handRankMessage);
});

// removes the waiting tag from player
socket.on('game-in-progress', (data) => {
    console.log(data.waiting);
    if (!data.waiting) {
        $('.back-card').removeClass('waiting');
        $('.hand-rank-message').removeClass('waiting');
    }
});

// updates stack when a bet is placed, for example
socket.on('update-stack', (data) => {
    let hand = document.getElementById(data.seat);
    hand.querySelector('.stack').innerHTML = data.stack;
});

const updatePot = (amount) => {
    if (amount) {
        $('#pot-amount').html(amount);
    } else {
        $('#pot-amount').empty();
    }
};

// updates pot at beginning of each new street
socket.on('update-pot', (data) => {
   updatePot(data.amount);
});

// start game (change all cards to red)
socket.on('start-game', (data) => {
    $('.back-card').removeClass('waiting');
    $('.hand-rank-message').removeClass('waiting');
    $('#start').addClass('collapse');
});

const setActionSeat = (seat) => {
    $('.name').removeClass('action');
    $(`#${seat} > .name`).addClass('action');
};

// changes that person to the person who has the action
socket.on('action', (data) => {
    setActionSeat(data.seat);
});

// renders available buttons for player
socket.on('render-action-buttons', (data) => {
    console.log(data);
    displayButtons(data);
});

const setDealerSeat = (seat) => {
    $('.dealer').remove();
    if (seat != -1){
        $(`#${seat} > .name`).append('<span class="dealer">D</span>');
    }
}

// adds dealer chip to seat of dealer
socket.on('new-dealer', (data) => {
    setDealerSeat(data.seat);
});

// changes color of players not in last hand to red (folded, buying in, etc)
// also flips hands back to red if they werent
socket.on('nobody-waiting', (data) => {
    inHand();
});

// ---------------------------------action buttons --------------------------------------------------------
// calls
socket.on('call', (data) => {
    outputEmphasizedMessage(data.username + ' calls');
    playSoundIfVolumeOn('bet');
    let prevAmount = parseInt($('.player-bet').eq(data.seat).html());
    showBet(data.seat, data.amount + prevAmount);
});

// check
socket.on('check', (data) => {
    outputEmphasizedMessage(data.username + ' checks');
    playSoundIfVolumeOn('check');
    if ($('#flop').hasClass('hidden') && !$('.player-bet').eq(data.seat).hasClass('hidden')) {
        console.log('big blind player closing action');
    }
    else {
        // let prevAmount = parseInt($('.player-bet').eq(data.seat).html());
        showBet(data.seat, 'check');
    }
});

// fold
socket.on('fold', (data) => {
    outputEmphasizedMessage(data.username + ' folds');
    playSoundIfVolumeOn('fold');

    let cards = null;
    if (data.seat === tableState.player.seat) {
        cards = tableState.player.cards;
    }
    // renders grayed out cards if this user folded. renders turned-over grey cards if a different user folded.
    renderCardsForSeat(cards, data.seat, false);
});

function outputMessage(s) {
    feedback.innerHTML = '';
    message_output.innerHTML += '<p>' + s + '</p>';
    $("#chat-window").scrollTop($("#chat-window")[0].scrollHeight);
}

function outputEmphasizedMessage(s) {
    outputMessage('<em>' + s + '</em>');
}

// bet
socket.on('bet', (data) => {
    outputEmphasizedMessage(data.username + ' bets ' + data.amount);
    playSoundIfVolumeOn('bet');
    let prevAmount = parseInt($('.player-bet').eq(data.seat).html());
    console.log(`prev amount: ${prevAmount}`);
    showBet(data.seat, data.amount + prevAmount);
});

// socket.on('straddle', (data) => {
//     outputEmphasizedMessage(data.username + ' straddles ' + data.amount);
//     // TODO: do we want a different sound effect for straddle?
//     playSoundIfVolumeOn('bet');
//     // prevAmount != 0 if player is small blind or big blind
//     let prevAmount = parseInt($('.player-bet').eq(data.seat).html());
//     console.log(`prev amount: ${prevAmount}`);
//     showBet(data.seat, data.amount + prevAmount);
// });

function hideAllBets() {
    $('.player-bet').html(0);
    $('.player-bet').addClass('hidden');
}

function hideBet(seat) {
    $('.player-bet').eq(seat).html(0);
    $('.player-bet').eq(seat).addClass('hidden');
}

function showBet(seat, amount) {
    $('.player-bet').eq(seat).html(amount);
    $('.player-bet').eq(seat).removeClass('hidden');
}

// raise
socket.on('raise', (data) => {
    outputEmphasizedMessage(data.username + ' raises ' + data.amount);
    if ($('.volume').hasClass('on')){
        createjs.Sound.play('bet');
    }
    let prevAmount = parseInt($('.player-bet').eq(data.seat).html());
    showBet(data.seat, data.amount + prevAmount);
});

//showdown
socket.on('showdown', function (data) {
    for (let i = 0; i < data.length; i++) {
        renderHand(data[i].seat, data[i].hand.cards);
        outputMessage(`${data[i].playerName} wins a pot of ${data[i].amount}! ${data[i].hand.message}: ${data[i].hand.cards} `);
        showWinnings(data[i].amount, data[i].seat);
    }
});

const renderHands = (data) => {
    for (let i = 0; i < data.length; i++) {
        if (data[i].cards && data[i].cards.length > 0) {
            renderHand(data[i].seat, data[i].cards);
        }
        if (data[i].handRankMessage && data[i].handRankMessage.length > 0) {
            renderHandRank(data[i].seat, data[i].handRankMessage);
        }
        $("#chat-window").scrollTop($("#chat-window")[0].scrollHeight);
    }
}

//if everyone is all in in the hand, turn over the cards
socket.on('turn-cards-all-in', function (data) {
    // console.log(data);
    feedback.innerHTML = '';
    renderHands(data);
});

//folds-through
socket.on('folds-through', function (data) {
    outputMessage(`${data.username} wins a pot of ${data.amount}`);
    showWinnings(data.amount, data.seat);
});

const clearEarnings = () => {
    $('.earnings').empty();
    $('.earnings').addClass('hidden');
};

//remove earnings span from previous hand
socket.on('clear-earnings', clearEarnings);

// user's action (alert with sound)
socket.on('players-action-sound', function(data){
    playSoundIfVolumeOn('action');
});

// user's action (alert with sound)
socket.on('initial-bets', function(data){
    console.log(data);
    let seats = data.seats;
    for (let i = 0; i < seats.length; i++){
        showBet(seats[i].seat, seats[i].bet);
    }
});

socket.on('alert', function(data) {
    alert(data.message);
});

//helper functions--------------------------------------------------------------------------------
const loadSounds = () => {
    createjs.Sound.registerSound("../public/audio/fold1.wav", 'fold');
    createjs.Sound.registerSound("../public/audio/deal.wav", 'deal');
    createjs.Sound.registerSound("../public/audio/check.wav", 'check');
    createjs.Sound.registerSound("../public/audio/chipsStack4.wav", 'bet');
    createjs.Sound.registerSound("../public/audio/flop.wav", 'flop');
    createjs.Sound.registerSound("../public/audio/turn.wav", 'turn');
    createjs.Sound.registerSound("../public/audio/cardPlace1.wav", 'river');
    createjs.Sound.registerSound("../public/audio/action.ogg", 'action');
    createjs.Sound.volume = 0.25;
};
loadSounds();

const displayButtons = (data) => {
    if (data == -1) {
        console.log('here yuh');
        $('.action-btn').addClass('collapse');
        $('.pm-btn').removeClass('pm');
        return;
    }
    let premove = undefined;
    if (data.canPerformPremoves) {
        $('#pm-fold').removeClass('collapse');
        if (getMaxRoundBet()) {
            $('#pm-check').removeClass('pm');
            $('#pm-check').addClass('collapse');

            if ($('#pm-checkfold').hasClass('pm')) {
                $('#pm-checkfold').removeClass('pm');
                $('#pm-fold').click();
            }
            $('#pm-checkfold').addClass('collapse');

            let oldNum = $('#pm-call > .number').html();
            $('#pm-call > .number').html(getMaxRoundBet());
            let newNum = $('#pm-call > .number').html();
            if (oldNum != newNum){
                $('#pm-call').removeClass('pm');
            }
            $('#pm-call').removeClass('collapse');
        } else {
            $('#pm-check').removeClass('collapse');
            $('#pm-checkfold').removeClass('collapse');
            $('#pm-call').addClass('collapse');
        }
    }
    else {
        // remove call if bet changes
        let oldNum = $('#pm-call > .number').html();
        $('#pm-call > .number').html(getMaxRoundBet());
        let newNum = $('#pm-call > .number').html();
        if (oldNum != newNum) {
            $('#pm-call').removeClass('pm');
        }
        // if checkfold was clicked and there is a bet its now fold
        if (getMaxRoundBet()){
            if ($('#pm-checkfold').hasClass('pm')){
                $('#pm-checkfold').removeClass('pm');
                $('#pm-fold').click();
            }
            // if check was clicked and there is a bet remov premove
            if ($('#pm-check').hasClass('pm')) {
                $('.pm-btn').removeClass('pm');
            }
        }
        premove = checkForPremoves();
        $('.pm-btn').removeClass('pm');
        $('.pm-btn').addClass('collapse');
    }
    
    // active player keys
    $('#call .number').html(getMaxRoundBet());
    $('#min-bet .number').html(getMinimumAllowedBet());
    for (let key of Object.keys(data.availableActions)) {
        if (data.availableActions[key]){
            $(`#${key}`).removeClass('collapse');
        } else {
            $(`#${key}`).addClass('collapse');
        }
    }
    console.log('checked for premove', premove);
    if (premove) {
        setTimeout(() => {
            $(`${premove}`).click();
        }, 650);
    }
};

const cleanInput = (input) => {
    return $('<div/>').text(input).html();
};

const getSuitSymbol = (input) => {
    const suits = '♠︎ ♥︎ ♣︎ ♦︎'.split(' ');
    const inputs = 'S H C D'.split(' ');
    for (let i = 0; i < 4; i++){
        if (inputs[i] == input) return suits[i];
    }
    return 'yikes';
};

function renderCardsForSeat(cards, seat, inHand) {
    console.log('c', cards);
    // if we do not know what the card is, show the back side of the card.
    if (!cards || cards.length < 1 || cards[0] === null) {
        if (!inHand) {
            outHand(seat);
        } else {
            renderCardbackForHand(seat);
        }
    } else {
        renderHand(seat, cards, !inHand);
    }
}

const getColor = (input) => 'SC'.includes(input) ? 'black' : 'red';

const flipCard = (name) => {
    setTimeout(() => {
        $(`#${name}`).find('.back-card').addClass('hidden');
        $(`#${name}`).find('.card-topleft').removeClass('hidden');
        $(`#${name}`).find('.card-bottomright').removeClass('hidden');
    }, 250);
};

const outHand = (seat) => {
    $(`#${seat}`).find('.back-card').removeClass('hidden').addClass('waiting');
    $(`#${seat}`).find('.hand-rank-message').addClass('waiting');
    $(`#${seat} > .left-card > .card`).removeClass('black').addClass('black');
    $(`#${seat} > .left-card`).find('.card-corner-rank').html('A');
    $(`#${seat} > .left-card`).find('.card-corner-suit').html('S');
    $(`#${seat} > .right-card > .card`).removeClass('black').addClass('black');
    $(`#${seat} > .right-card`).find('.card-corner-rank').html('A');
    $(`#${seat} > .right-card`).find('.card-corner-suit').html('S');
    $(`#${seat}`).find('.card-topleft').addClass('hidden');
    $(`#${seat}`).find('.card-bottomright').addClass('hidden');
};

// renderCardbackForHand does what inHand does but for one seat
const renderCardbackForHand = (seat) => {
    renderInHand($(`#${seat}`));
};

const renderInHand = (locator) => {
    locator.find('.back-card').removeClass('waiting');
    locator.find('.card').removeClass('red').removeClass('folded').addClass('black');
    locator.find('.card').removeClass('red').removeClass('folded').addClass('black');
    locator.find('.card-corner-rank').html('A');
    locator.find('.card-corner-suit').html('S');
    locator.find('.card-topleft').addClass('hidden');
    locator.find('.card-bottomright').addClass('hidden');
    locator.find('.back-card').removeClass('hidden');
    locator.find('.hand-rank-message-container').addClass('collapse');
};

const inHand = () => {
    $('.hand').find('.back-card').removeClass('waiting');
    $('.hand-rank-message').removeClass('waiting');
    $('.card').removeClass('red').removeClass('folded').addClass('black');
    $('.hand-rank-message').removeClass('folded')
    $('.hand-rank-message-container').addClass('collapse')
    $('.card-corner-rank').html('A');
    $('.card-corner-suit').html('S');
    $('.card-topleft').addClass('hidden');
    $('.card-bottomright').addClass('hidden');
    $('.back-card').removeClass('hidden');
};

// TODO: grey out the cards if folded is true to indicate which players
// have folded
const renderHand = (seat, cards, folded) => {
    let leftCardRank = (cards[0].charAt(0) == 'T') ? '10' : cards[0].charAt(0);
    let leftCardSuit = getSuitSymbol(cards[0].charAt(1));
    let leftCardColor = getColor(cards[0].charAt(1));
    let rightCardRank = (cards[1].charAt(0) == 'T') ? '10' : cards[1].charAt(0);
    let rightCardSuit = getSuitSymbol(cards[1].charAt(1));
    let rightCardColor = getColor(cards[1].charAt(1));

    console.log('scf', seat, cards, folded);
    if (folded) {
        $(`#${seat}`).find('.card').addClass('folded');
        $(`#${seat}`).find('.hand-rank-message').addClass('folded');
    } else {
        $(`#${seat}`).find('.card').removeClass('folded');
        $(`#${seat}`).find('.hand-rank-message').removeClass('folded');
    }

    $(`#${seat}`).find('.back-card').addClass('hidden');
    $(`#${seat} > .left-card > .card`).removeClass('black').addClass(leftCardColor);
    $(`#${seat} > .left-card`).find('.card-corner-rank').html(leftCardRank);
    $(`#${seat} > .left-card`).find('.card-corner-suit').html(leftCardSuit);
    $(`#${seat} > .right-card > .card`).removeClass('black').addClass(rightCardColor);
    $(`#${seat} > .right-card`).find('.card-corner-rank').html(rightCardRank);
    $(`#${seat} > .right-card`).find('.card-corner-suit').html(rightCardSuit);
    $(`#${seat}`).find('.card-topleft').removeClass('hidden');
    $(`#${seat}`).find('.card-bottomright').removeClass('hidden');
};

const renderHandRank = (seat, handRankMessage) => {
    // hacky fix
    if (!handRankMessage) {
        console.log('here oh no!');
        handRankMessage = "high card";
    }
    $(`#${seat}`).find('.hand-rank-message-container').removeClass('collapse');
    $(`#${seat}`).find('.hand-rank-message').html(handRankMessage);
}

const showWinnings = (winnings, seat) => {
    console.log('show winnings');
    console.log(winnings);
    console.log(seat);
    $(`#${seat}`).find('.earnings').html(`+${winnings}`);
    $(`#${seat}`).find('.earnings').removeClass('hidden');
};

const alreadyExistingName = (playerName) => {
    return tableState.table.allPlayers.filter(p=>p!==null).map(p => p.playerName).includes(playerName);
};

const getMinRaiseAmount = () => {
    let minRaiseAmount = 0;
    let bets = tableState.table.players.map(p => p.bet);
    let biggestBet = Math.max(...bets)|| 0;
    let secondBiggestBet = Math.max(...bets.filter(b=>b<biggestBet)) || 0;

    // if the biggest bet is the bb then double it
    if (biggestBet === getBigBlind()) {
        console.log('here!!!!!');
        minRaiseAmount = biggestBet + biggestBet;
    } else {
        console.log('second biggest bet');
        console.log(secondBiggestBet);
        minRaiseAmount = 2 * (biggestBet - secondBiggestBet) + secondBiggestBet;
    }
    return minRaiseAmount;
};

const getStack = () => {
    return parseInt($('.action > .stack').html());
};

const getBigBlind = () => {
    return tableState.table.bigBlind;
};

const getSmallBlind = () => {
    return tableState.table.smallBlind;
};

const getPotSize = () => {
    return tableState.table.game.pot + tableState.table.players.map(p => p.bet).reduce((acc, cv) => acc + cv) || 0;
};

//add hands and bets to table --------------------------------------------------------------------------------
//add hands and bets to table --------------------------------------------------------------------------------
//add hands and bets to table --------------------------------------------------------------------------------
//add hands and bets to table --------------------------------------------------------------------------------
//add hands and bets to table --------------------------------------------------------------------------------
//add hands and bets to table --------------------------------------------------------------------------------
//add hands and bets to table --------------------------------------------------------------------------------
//add hands and bets to table --------------------------------------------------------------------------------
//add hands and bets to table --------------------------------------------------------------------------------
//add hands and bets to table --------------------------------------------------------------------------------
//add hands and bets to table --------------------------------------------------------------------------------
//add hands and bets to table --------------------------------------------------------------------------------
function createHands() {
    $('.field').remove();
    var table = $('#table');
    for (var i = 0; i < 10; i++) {
        $('<div/>', {
            'class': 'field',
            'text': i + 1
        }).appendTo(table);
    }
}

function distributeHands(firstRender) {
    var radius = 210;
    let fields = $('.field'),
        table = $('.ovalparent'),
        width = table.width(),
        height = table.height(),
        angle = 0,
        step = (2 * Math.PI) / fields.length;
    console.log(width);
    fields.each(function () {
        // note consider changing width/455 to 2.5
        var x = Math.round(width / 2 + radius * ((width/400) * Math.cos(angle)) - $(this).width() / 2);
        var y = Math.round(height / 2 + radius * (1.30 * Math.sin(angle)) - $(this).height() / 2) + 10;
        // if (window.console) {
        //     console.log($(this).text(), x, y);
        // }
        $(this).css({
            left: x + 'px',
            top: y + 'px'
        }); angle += step;
        // this.append(document.getElementsByName('1')[0]);
    });
    if (firstRender){
        for (let i = 0; i < 10; i++) {
            let position = document.getElementsByClassName('field')[i];
            let hand = document.getElementsByClassName(i)[0];
            // console.log(position);
            // console.log(hand.innerHTML);
            position.innerHTML = `<div class="hand hidden" id="${i}"> ${hand.innerHTML} </div>`;
            hand.remove();
        }
    }
}

function createBets() {
    $('.player-bet').remove();
    var table = $('#table');
    for (var i = 0; i < 10; i++) {
        $('<div/>', {
            'class': 'player-bet hidden',
            'text': 'check'
        }).appendTo(table);
    }
}

function distributeBets() {
    var radius = 180;
    let betFields = $('.player-bet'),
        table = $('.ovalparent'),
        width = table.width(),
        height = table.height(),
        angle = 0,
        step = (2 * Math.PI) / betFields.length;
    console.log(width);
    betFields.each(function () {
        // note consider changing width/455 to 2.5
        var x = Math.round(width / 2 + radius * ((width/450) * Math.cos(angle)) - $(this).width() / 2) - 20;
        var y = Math.round(height / 2 + radius * (1.05 * Math.sin(angle)) - $(this).height() / 2) - 10;
        // if (window.console) {
        //     console.log($(this).text(), x, y);
        // }
        $(this).css({
            left: x + 'px',
            top: y + 'px'
        }); angle += step;
        // this.append(document.getElementsByName('1')[0]);
    });
}

createHands();
distributeHands(true);
createBets();
distributeBets();

$(window).resize(function () {
    // createHands();
    distributeHands(false);
    distributeBets();
    let resizeData = {
        size: {
            width: $wrapper.width(),
            height: $wrapper.height()
        }
    };
    doResize(null, resizeData);
});

//---------------------------------------------------------
//------------open and close gamelog features--------------

function openBuyin() {
    socket.emit('get-buyin-info');
    document.getElementById("buyin-log").style.width = "100%";
}

socket.on('get-buyin-info', (data) => {
    $('#buyins').empty();
    for (let i = 0; i < data.length; i++) {
        let time = `<span class='info'>${data[i].time} ~</span>`;
        let datastr = `${time} ${data[i].playerName} (id: ${data[i].playerid}) buy-in: ${data[i].buyin}`;
        if (data[i].buyout != null){
            datastr += ` buy-out: ${data[i].buyout}`
        }
        $('#buyins').prepend(`<p>${datastr}</p>`);
    }
});

function closeBuyin() {
    document.getElementById("buyin-log").style.width = "0%";
}

function openLog() {
    document.getElementById("game-log").style.width = "100%";
}

function closeLog() {
    document.getElementById("game-log").style.width = "0%";
}

function openHostPage() {
    renderGamePrefVals();
    renderHostPlayerVals();
    $('#game-pref-btn').click();
    // $('#host-players-btn').click();
    document.getElementById("host-page").style.width = "100%";
}

let renderGamePrefVals = () => {
    $('#checkbp').prop("checked", false);
    $('#smallblind-input').val(getSmallBlind());
    $('#bigblind-input').val(getBigBlind());
    $('#straddle-input').val('');
}

let renderHostPlayerVals = () => {
    for (let i = 0; i < 10; i++) {
        let rowplayerid = `#player${i}`
        $(rowplayerid).addClass('collapse');
        let seat = `#${i}`
        if (!$(seat).hasClass('hidden')){
            let name = $(seat).find('.username').html();
            let stack = parseInt($(seat).find('.stack').html());
            console.log(name);
            console.log('stack', stack);
            $(rowplayerid).find('.playername-input').val(name);
            $(rowplayerid).find('.stack-input').val(stack);
            $(rowplayerid).removeClass('collapse');
        }
    }
}

let closeGamePrefVals = () => {
    $('#successfully-submitted').addClass('collapse');
    $('#game-pref-form').removeClass('collapse');
    $('.game-pref').addClass('collapse');
    $('#game-pref-btn').removeClass('active');
}

let closePlayerVals = () => {
    $('#successfully-submitted-players').addClass('collapse');
    $('.player-rows').removeClass('collapse');
    $('.players-host-page').addClass('collapse');
    $('#host-players-btn').removeClass('active');
}

function closeHostPage() {
    closeGamePrefVals();
    closePlayerVals();
    document.getElementById("host-page").style.width = "0%";
}

$('#game-pref-btn').click(() => {
    $('#successfully-submitted').addClass('collapse');
    $('#game-pref-form').removeClass('collapse');
    $('.game-pref').removeClass('collapse');
    $('#game-pref-btn').addClass('active');
    closePlayerVals();
});

$('#host-players-btn').click(() => {
    $('#successfully-submitted-players').addClass('collapse');
    $('.player-rows').removeClass('collapse');
    $('.players-host-page').removeClass('collapse');
    $('#host-players-btn').addClass('active');
    closeGamePrefVals();
    if (!$('#player0').hasClass('collapse')){
        $('#player0').find('.stack-input').focus();
    }
});

$('#buyin-log-opn').click( () => openBuyin());
$('#closeBuyin').click(() => closeBuyin());
$('#game-log-opn').click(() => openLog());
$('#closeLog').click(() => closeLog());
$('#host-btn').click(() => openHostPage());
$('#closeHostPage').click(() => closeHostPage());

// host page capabilities
const gamePrefForm = document.getElementById('game-pref-form');
gamePrefForm.addEventListener('submit', (event) => {
    event.preventDefault();
    console.log('form successfully submitted');
    const formData = new FormData(gamePrefForm);
    const smallBlind = parseInt(formData.get('smallblind-input')) || 25;
    const bigBlind = parseInt(formData.get('bigblind-input')) || 50;
    const straddleLimit = formData.get('straddle-inp');
    const bombPotNextHand = formData.get('bombpot-nexthand') != null ? true : false;

    const gamePref = {
        smallBlind,
        bigBlind,
        straddleLimit,
        bombPotNextHand
    };

    console.log(gamePref);
    $('#successfully-submitted').removeClass('collapse');
    $('#game-pref-form').addClass('collapse');
    handleUpdatedGamePreferences(gamePref);
});

const handleUpdatedGamePreferences = (gamePref) => {
    // todo: update big blind, small blind for next turn, if things change
    let bb = gamePref.bigBlind;
    let sb = gamePref.smallBlind;
    if (bb !== getBigBlind() || sb !== getSmallBlind()){
        socket.emit('update-blinds-next-round', {smallBlind: sb, bigBlind: bb});
    }
    // todo: update straddle rules if selected for next turn
    if (gamePref.straddleLimit !== tableState.table.straddleLimit) {
        socket.emit('update-straddle-next-round', {straddleLimit: gamePref.straddleLimit});
    }
    // todo: queue bombpot for next hand
}

$('.transfer-ownership-btn').click(function() {
    let playerid = $(this).parents('.row').attr('id');
    let seat = parseInt(playerid.substring(6));
    socket.emit('transfer-host', {seat});
    closeHostPage();
});

$('.update-stack-row').click(function() {
    let playerid = $(this).parents('.row').attr('id');
    let seat = parseInt(playerid.substring(6));
    let newStackAmount = parseInt($(`#${playerid}`).find('.stack-input').val());
    socket.emit('update-player-stack', {seat, newStackAmount});
    $('#successfully-submitted-players').removeClass('collapse');
    $('.player-rows').addClass('collapse');
});

socket.on('update-player-stack', (data) => {
    console.log(data);
    $('#sb').html(data.smallBlind);
    $('#bb').html(data.bigBlind);
});

$('.kick-option-btn').click(function () {
    let playerid = $(this).parents('.row').attr('id');
    let seat = parseInt(playerid.substring(6));
    socket.emit('kick-player', {
        seat
    });
    closeHostPage();
});

socket.on('update-header-blinds', (data) => {
    console.log(data);
    $('#sb').html(data.smallBlind);
    $('#bb').html(data.bigBlind);
});

const renderStraddleOptions = (canRender) => {
    console.log('tableState', tableState);
    if (canRender){
        if (tableState.table.straddleLimit == 1){
            $('.single-straddle').removeClass('collapse');
            $('.multi-straddle').addClass('collapse');
            if (tableState.player.isStraddling){
                $('input[name=singleStraddleBox]').prop("checked", true);
            }
        }
        else if (tableState.table.straddleLimit == -1){
            $('.single-straddle').removeClass('collapse');
            $('.multi-straddle').removeClass('collapse');
            if (tableState.player.isStraddling) {
                $('input[name=singleStraddleBox]').prop("checked", true);
                $('input[name=multiStraddleBox]').prop("checked", true);
            }
        }
        else {
            $('.single-straddle').addClass('collapse');
            $('.multi-straddle').addClass('collapse');
        }
    } else {
        $('.single-straddle').addClass('collapse');
        $('.multi-straddle').addClass('collapse');
    }
}
},{"../sharedjs":2}],2:[function(require,module,exports){
module.exports = require('./table-state');
},{"./table-state":3}],3:[function(require,module,exports){
class TableState {
    /**
     *
     * @param {number} smallBlind
     * @param {number} bigBlind
     * @param {number} minPlayers
     * @param {number} maxPlayers
     * @param {number} minBuyIn
     * @param {number} maxBuyIn
     * @param {number} straddleLimit
     * @param {number} dealer
     * @param {Player[]} allPlayers
     * @param {number} currentPlayer
     * @param {GameState|null} game
     */
    constructor(smallBlind, bigBlind, minPlayers, maxPlayers, minBuyIn, maxBuyIn, straddleLimit, dealer, allPlayers, currentPlayer, game) {
        this.smallBlind = smallBlind;
        this.bigBlind = bigBlind;
        this.minPlayers = minPlayers;
        this.maxPlayers =  maxPlayers;
        // allPlayers[i].seat === i. empty seats correspond to a null element.
        this.allPlayers = allPlayers;
        this.dealer = dealer; //Track the dealer position between games
        this.currentPlayer = currentPlayer; // Initialized to 1 in initializeBlinds (called by startGame)
        this.minBuyIn = minBuyIn;
        this.maxBuyIn = maxBuyIn;
        this.straddleLimit = straddleLimit;
        this.game = game;

        //Validate acceptable value ranges.
        let err;
        if (minPlayers < 2) { //require at least two players to start a game.
            err = new Error(101, 'Parameter [minPlayers] must be a postive integer of a minimum value of 2.');
        } else if (maxPlayers > 10) { //hard limit of 10 players at a table.
            err = new Error(102, 'Parameter [maxPlayers] must be a positive integer less than or equal to 10.');
        } else if (minPlayers > maxPlayers) { //Without this we can never start a game!
            err = new Error(103, 'Parameter [minPlayers] must be less than or equal to [maxPlayers].');
        }

        if (err) {
            return err;
        }
    }

    getPublicInfo() {
        return {
            smallBlind: this.smallBlind,
            bigBlind: this.bigBlind,
            allPlayers: this.playerStates,
            dealer: this.dealer,
            currentPlayer: this.currentPlayer,
            minBuyIn: this.minBuyIn,
            maxBuyIn: this.maxBuyIn,
            straddleLimit: this.straddleLimit,
            game: this.game? this.game.getPublicInfo(): null,
        }
    }

    get playerStates() {
        return this.allPlayers.map(p => p === null ? null: p.getPublicInfo());
    }

    get players() {
        return this.allPlayers.filter(p => p !== null && p.inHand);
    }

    get waitingPlayers() {
        return this.allPlayers.filter(p => p!== null && p.isWaiting);
    }

    get leavingPlayers() {
        return this.allPlayers.filter(p => p !== null && p.leavingGame)
    }

    get actionSeat() {
        return this.players[this.currentPlayer].seat;
    }

    get bigBlindSeat() {
        return this.players[(this.dealer + 2) % this.players.length].seat;
    }
    getWinners(){
        return this.game.winners;
    };
    getLosers(){
        return this.game.losers;
    };
    getHandForPlayerName( playerName ){
        const p = this.getPlayer(playerName);
        if (p !== null) return p.cards || [];
        return [];
    };

    /**
     * @return {Player|null}
     */
    getPlayer( playerName ){
        return this.allPlayers.find(elem => elem !== null && elem.playerName === playerName) || null;
    };
    getDeal(){
        return this.game.board;
    };
    getCurrentPlayer() {
        return this.players[ this.currentPlayer ].playerName;
    };
    canPlayerRaise(playerName) {
        const p = this.getPlayer(playerName);
        if (p === null || !p.inHand || p.folded) {
            return false;
        }
        return p.bet + p.chips > this.getMaxBet() && !this.isEveryoneAllIn();
    }
    isEveryoneAllIn() {
        const playersIn = this.players.filter(p=>!p.folded);
        const playersWhoCanAct = playersIn.filter(p=>!p.allIn);
        return playersIn.length >= 2 && playersWhoCanAct.length <= 1;
    }
    // Precondition: A game is in progress.
    canPlayersRevealHands() {
        return this.game.roundName.toLowerCase() === 'showdown' || this.players.filter(p => !p.folded).length <= 1
    }

    // Precondition: A game is in progress.
    getAvailableActions(playerName) {
        let availableActions = {
            'min-bet': false,
            'bet': false,
            'raise': false,
            'fold': false,
            'call': false,
            'start': false,
            'check': false,
            'your-action': false,
            'show-hand': false,
        };

        let canPerformPremoves = false;
        const p = this.getPlayer(playerName);
        availableActions['show-hand'] = (p !== null) && !p.showingCards && p.inHand && this.canPlayersRevealHands();
        // no action can be performed if players can show hands because betting is over
        if (availableActions['show-hand'] || p === null || !p.inHand || p.showingCards){
            return {availableActions, canPerformPremoves};
        }
        // if (p === null || !p.inHand || p.folded || this.canPlayersRevealHands())
        //     return {availableActions, canPerformPremoves};

        // cases where it's the player's action
        if (this.players[this.currentPlayer].playerName === playerName) {
            availableActions['fold'] = true;
            availableActions['your-action'] = true;
            // TODO: this.getMaxBet() === this.bigBlind will be false if it's heads up
            //   and one player went all in with < this.bigBlind
            // player is in big blind
            if (this.actionSeat === this.bigBlindSeat && this.getMaxBet() === this.bigBlind && this.game.roundName.toLowerCase() === 'deal') {
                availableActions['check'] = true;
                availableActions['raise'] = this.canPlayerRaise(playerName);
            }
            // bet on table
            else if (this.getMaxBet() > 0) {
                availableActions['call'] = true;
                console.log(p);
                console.log(this.getMaxBet());

                availableActions['raise'] = this.canPlayerRaise(playerName);
            }
            // no bets yet
            else {
                availableActions['check'] = true;
                availableActions['bet'] = true;
                availableActions['min-bet'] = true;
            }
        }
        // cases where its not the players action
        else if (!p.folded && !p.allIn) {
            canPerformPremoves = true;
        }
        return {availableActions, canPerformPremoves};
    }

    minimumBetAllowed(playerName) {
        const player = this.getPlayer(playerName);
        if (player === null) return 0;
        if (player.bet + player.chips >= this.bigBlind) {
            // min should be < bb if (1) a player’s stack > bb but all players in the hand have a stack < bb
            return Math.min(this.otherPlayersMaxStack(playerName), this.bigBlind);
        }
        // (2) a player’s stack < bb
        return Math.min(player.bet + player.chips, this.otherPlayersMaxStack(playerName));
    }

    otherPlayersMaxStack(playerName) {
        return Math.max(...this.players
            .filter(p=>p.playerName !== playerName && !p.folded)
            .map(x => x.bet + x.chips)
        );
    }

    /**
     * Calculates the maximum that a player can bet (total) as limited
     * by his going all in or making everyone else at the table go all in
     * if he has the biggest stack
     */
    maxBetPossible(playerName) {
        const player = this.getPlayer(playerName);
        if (player === null) return 0;
        return Math.min(player.bet + player.chips, this.otherPlayersMaxStack(playerName));
    };

    // straddleLimit values:
    // -1: unlimited straddles (last player who can straddle is the dealer)
    // 0: no straddling allowed
    // 1: only player after big blind can straddle
    // 1 < x <= players.length - 2: x players can straddle. if x == players.length -2,
    //      the same behavior as -1 occurs.
    // x > players.length - 2: same behavior as -1 occurs.
    // Up to this.players.length -2 players can straddle because
    //      the last player that is able to is the dealer
    maxStraddles() {
        if (this.players.length <= 2) return 0;
        if (this.straddleLimit >= 0 && this.straddleLimit <= this.players.length -2) {
            return this.straddleLimit;
        }
        if (this.straddleLimit === -1 || this.straddleLimit > this.players.length -2) {
            return this.players.length - 2;
        }
        // straddleLimit < -1
        console.log(`Invalid straddleLimit value ${this.straddleLimit}`);
        return 0;
    };

    getAvailableSeat() {
        return this.allPlayers.findIndex(elem => elem === null || elem.leavingGame);
    };
    getMaxBet() {
        return Math.max(...this.players.map(x => x.bet));
    };

    checkwin() {
        let unfoldedPlayers = this.players.filter(p=>!p.folded);
        if (unfoldedPlayers.length === 1) {
            console.log("everyone's folded!");
            return {
                everyoneFolded: true,
                pot: this.game.pot,
                winner: unfoldedPlayers[0]
            };
        }
        return {
            everyoneFolded: false,
            pot: null,
            winner: null
        };
    };
}

class Player {
    /**
     * Constructs a Player object for use with Table.
     * @param playerName Name of the player as it should appear on the front end
     * @param chips The player's initial chip stack
     * @param isStraddling If the player wants to straddle
     * @constructor
     */
    constructor(playerName, chips, isStraddling, seat, isMod) {
        this.playerName = playerName;
        this.chips = chips;
        this.folded = false;
        this.allIn = false;
        this.talked = false;
        // If the player is in the current hand. False is they just joined and are waiting for the next hand.
        this.inHand = false;
        // If the player is standing up from the table
        this.standingUp = false;
        this.cards = [];
        this.bet = 0;
        this.isStraddling = isStraddling;
        this.seat = seat;
        this.leavingGame = false;
        // below fields used only externally
        this.isMod = isMod;
        this.showingCards = false;
    }

    showHand() {
        this.showingCards = true;
    }

    // Clear data from the previous hand.
    clearHandState() {
        this.bet = 0;
        this.folded = false;
        this.talked = false;
        this.allIn = false;
        this.cards.splice(0, this.cards.length);
        this.showingCards = false;
    }

    get isWaiting() {
        return !this.inHand && !this.leavingGame && !this.standingUp;
    }

    getPublicInfo() {
        return {
            playerName: this.playerName,
            chips: this.chips,
            folded: this.folded,
            allIn: this.allIn,
            talked: this.talked,
            inHand: this.inHand,
            standingUp: this.standingUp,
            bet: this.bet,
            seat: this.seat,
            leavingGame: this.leavingGame,
            isMod: this.isMod,
            cards: this.showingCards? this.cards : [],
            showingCards: this.showingCards,
        }
    }

    GetChips(cash) {
        this.chips += cash;
    };

    // changes stack to new amount
    UpdateStackAmount(cash) {
        if (!isNaN(cash) || cash <= 0){
            this.chips = cash;
        }
    }

    // Player actions: Check(), Fold(), Bet(bet), Call(), AllIn()
    Check() {
        this.applyBet(0);
        return 0;
    };

    Fold() {
        this.bet = 0;
        this.talked = true;
        this.folded = true;
        return 0;
    };

    applyBet(bet) {
        this.chips -= bet;
        this.bet += bet;
        this.talked = true;
        if (this.chips === 0) {
            this.allIn = true;
        }
    };

    // Returns amount bet. If this.chips < (parameter) bet, return value will be this.chips.
    /**
     * @param bet Amount to bet
     * @return {number|*} Amount actually bet.
     *          bet if player has enough chips. this.chips if player must go all in. -1 if bet is invalid (< 0).
     */
    Bet(bet) {
        if (bet < 0) {
            return -1;
        }
        if (this.chips > bet) {
            this.applyBet(bet);
            return bet;
        } else {
            console.log('You don\'t have enough chips --> ALL IN !!!');
            return this.AllIn();
        }
    };

    /**
     * @return {number} Amount bet
     */
    AllIn() {
        const allInValue = this.chips;
        this.applyBet(allInValue);
        return allInValue;
    };
}

class GameState {
    constructor(smallBlind, bigBlind) {
        this.smallBlind = smallBlind;
        this.bigBlind = bigBlind;
        this.pot = 0;
        this.roundName = 'deal'; //Start the first round
        this.betName = 'bet'; //bet,raise,re-raise,cap
        this.roundBets = [];
        this.board = [];
        this.winners = [];
        this.losers = [];
    }

    getPublicInfo() {
        // everything except for this.deck
        return {
            smallBlind: this.smallBlind,
            bigBlind: this.bigBlind,
            pot: this.pot,
            roundName: this.roundName,
            roundBets: this.roundBets,
            board: this.board,
            winners: this.winners,
            losers: this.losers,
        }
    }
}

module.exports.TableState = TableState;
module.exports.Player = Player;
module.exports.GameState = GameState;

},{}]},{},[1]);