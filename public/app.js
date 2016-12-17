(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var context;
var midi = null;  // global MIDIAccess object
var inGame = false;
var launchkey = false;
var input = "";
var secret = "38384040373937396665"; // Aka KONAMI code (^ ^ v v < > < > b a)
var timer;

window.addEventListener('load', init, false);

function domWrite(div, text){
	document.getElementById(div).innerHTML = text;
}

function init(){
	initAudio();
	initMidi();
	initialize();
}

function initMidi(){
	navigator.requestMIDIAccess().then( onMIDISuccess, onMIDIFailure );
}

function onMIDISuccess( midiAccess ) {
	midi = midiAccess;
	listInputsAndOutputs(midi);
}

function onMIDIFailure(msg) {
	console.log( "Failed to get MIDI access - " + msg );
}

var listInputsAndOutputs = function( midiAccess ) {
	for (var entry of midiAccess.inputs) {
		var inputs = midi.inputs.values();
	    for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
	    	if(input.value.name.indexOf("Launchkey") != -1){
	    		domWrite("infoTxt", "Launchkey detected");
	    		launchkey = true;
	    	}
	        input.value.onmidimessage = onMIDIMessage;
	    }
	}

	for (var entry of midiAccess.outputs) {
		this.output = entry[1];
		for(var i = 36; i < 52; i++){
		output.send([159, i, 3]);
	}
	}
};

var onMIDIMessage = function(message) {
    data = message.data;
    //console.log(data);
    if(data[0] == 137){
        if(data[1] >= 36 && data[1] <= 51){
        	if(inGame === true){
        		addToPlayer(data[1]);        		
        	}
        }
    }
    else if(data[0] == 176){
    	if(data[1] == 104){
    		newGame();
    	}
    }
};

function initialize(){
	var highscore = localStorage.highscore;
	if(typeof highscore == "undefined"){
		highscore = 0;
	}
	domWrite("highScoreTxt", "Highscore : " + highscore);
	if(launchkey === false){
    	domWrite("infoTxt", "Plug in a Launchkey to play");
    }

    
    window.onkeyup = function(e){
        e = e || window.event;
        input += e.which;
        checkInput();
    }.bind(this)
}

function checkInput(){
	console.log(input);
    if(input == secret){
        console.log("konami");
        input = "";
    }
    else{
        setTimeout(function(){
            input = "";
        }.bind(this), 4000)
    }
}

var initAudio = function(){

	try {
	    window.AudioContext = window.AudioContext||window.webkitAudioContext;
	    context = new AudioContext();
	    document.getElementById("newGameBtn").addEventListener("click", newGame);
	    document.getElementById("testBtn").addEventListener("click", frenzy);

	}
	catch(e) {
	    alert('Web Audio API is not supported in this browser');
	}

	//Oscillator
    this.oscillator = context.createOscillator();
    this.oscillator.type = 'sine';
    this.oscillator.frequency.value = 440;

    // Gain
    this.masterGain = context.createGain();
    this.masterGain.gain.value = 0;

    // Connections
    this.oscillator.connect(this.masterGain);
    this.masterGain.connect(context.destination);

    // Settings
    this.masterGain.gain.value = 0;
    this.oscillator.start();
};

var resetPads = function(){
	for(var i = 36; i < 52; i++){
		output.send([159, i, 3]);
	}
};

//
// GAME
//

var game = {
	count: 0,
	// pads
	possibilities: [1,2, 3, 4, 5, 6, 7, 8, 
					9, 10, 11, 12, 13, 14, 15, 16],
	currentGame: [],
	player: [],
	// frequencies (A4 440 Hz) : C4, C4#, D4, D4#, E4, F4, F4#, G4, G4#, A4, A4#, B4, C5, C5#, D5, D5#
	frequencies:['261.63', '277.18', '293.66', '311.13', '329.63', '349.23', '369.99', '392',
				'415.3', '440', '466.16', '493.88', '523.25', '554.37', '587.33', '622.25'],
	strict: false,
	score: 0,

	lives: 3
};

function newGame() {
	domWrite("scoreTxt", "Score : " + game.score.toString());
	domWrite("notesTxt", "Notes : " + game.count.toString());
	domWrite("infoTxt", "Go !");
	console.log("New game");
 	clearGame();
 	inGame = true;
 	stopFrenzy();
}

function clearGame() {
	game.currentGame = [];
	game.count = 0;
	game.score = 0;
	game.lives = 3;
	addCount();
}

function addCount() {
	game.count++;
	generateMove();
}

function nextStep() {
	addCount();
}

function generateMove(){
	game.currentGame.push(game.possibilities[(Math.floor(Math.random()*16))]);
	showMoves();
}

function showMoves() {
	var i = 0;
	var moves = setInterval(function(){
		playStep(game.currentGame[i]);
		i++;
		if (i >= game.currentGame.length) {
			clearInterval(moves);
		}
	}, 600);
	clearPlayer();
}

function playStep(field) {
	playSound(game.frequencies[field - 1]);
	lightPad(field);
}

function playSound(frequency) {
	this.oscillator.frequency.value = frequency;
	this.masterGain.gain.value = 1;
	setTimeout(function(){
		this.masterGain.gain.value = 0;
	}, 300);
}

function test(){
	var padsColors = [67,75,56,120,5,13,66,8,9,64,56,12,13,72,36,16];
	for(var i = 36; i < 52; i++){
		console.log(i, padsColors[i - 36]);
		output.send([159, i, padsColors[i - 36]]);  //omitting the timestamp means send immediately.
	}
}

var frenzySpeed = 100;
var interval;
var backinterval;
var color = 1;

function frenzy(){
	var i = 36;
	var interval = setInterval(function(){
		enlight(i, frenzySpeed, color);
		enlight(i + 4, frenzySpeed, color);
		i++;
		if(i == 40){
			i = 44;
		}
		if(i + 4 == 52){
			clearInterval(interval);
			if(frenzyOn){
				backFrenzy();
			}
		}
	}, frenzySpeed);
}

var frenzyOn = true;

function stopFrenzy(){
	frenzyOn = false;
}

function backFrenzy(){
	var i = 50;
	var backinterval = setInterval(function(){
		enlight(i, frenzySpeed, color);
		enlight(i - 4, frenzySpeed, color);
		i--;
		if(i == 47){
			i = 43;
		}
		if(i == 40){
			clearInterval(backinterval);
			if(frenzyOn){
				color ++;
				if(color == 127){
					color = 1;
				}
				frenzy();
			}
		}
	}, frenzySpeed);
}

function enlight(id, duration, color) {
	output.send([159, id, color]);  //omitting the timestamp means send immediately.
	output.send([159, id, 3], window.performance.now() + duration);
}

function lightPad(padId){
	var padsColors = [67,75,56,120,5,13,66,8,9,64,56,12,13,72,36,16];
	var id = padId + 35;
	output.send([159, id, padsColors[padId - 1]]);  //omitting the timestamp means send immediately.
	output.send([159, id, 3], window.performance.now() + 400.0);
}

function clearPlayer() {
	game.player = [];
}

function addToPlayer(id) {
	var field = id - 35;
	game.player.push(field);
	playerTurn(field);
}

function lightGreen(){
	for(var i = 36; i < 52; i++){
		output.send([191, 104, 64]);
		output.send([191, 105, 64]);
		//output.send([159, i, 17]);  //omitting the timestamp means send immediately.
	}
	setTimeout(function(){
		resetPads();
		output.send([191, 104, 0]);
		output.send([191, 105, 0]);
	}, 400);
}

function lightRed(){
	for(var i = 36; i < 52; i++){
		output.send([191, 104, 72]);
		output.send([191, 105, 72]);
		//output.send([159, i, 5]);  //omitting the timestamp means send immediately.
	}
	setTimeout(function(){
		resetPads();
		output.send([191, 104, 0]);
		output.send([191, 105, 0]);
	}, 400);
}

function playerTurn(x) {
	if (game.player[game.player.length - 1] !== game.currentGame[game.player.length - 1]) {
		lightRed();
		if(game.strict){
			newGame();
		} else {
			game.lives -= 1;
			if(game.lives > 0){
				setTimeout(function(){
					showMoves();
				}, 300);
			}else{
				domWrite("infoTxt", "Game Over");
				var currentHighScore = localStorage.getItem('highscore') || 0;
				inGame = false;
				if(game.score > currentHighScore){
					localStorage.highscore = game.score;
					domWrite("infoTxt", "New highscore !");
				}
			}
		}
	} else {
		playSound(game.frequencies[x - 1]);
		var check = game.player.length === game.currentGame.length;
		if (check) {
			game.score += 10;
				lightGreen();
				nextStep();
		}
	}
	domWrite("scoreTxt", "Score : " + game.score.toString());
	domWrite("notesTxt", "Notes : " + game.count.toString());
	domWrite("livesTxt", "Lives : " + game.lives.toString());
	domWrite("highScoreTxt", "Highscore : " + localStorage.highscore);
} 

// COLORS

var padsColors = [
	"#00b7ff", 
	"#ff6d00",
	"#ff2900",
	"#45f800",
	"#ff6dff",
	"#00b7ff",
	"#ff6896",
	"#fdfdfd",
	"#ffc875",
	"#6f166d",
	"#001f00",
	"#004600",
	"#9e7dff",
	"#00b7ff",
	"#ffc875",
	"#6f166d"
];


},{}]},{},[1]);
