// ---- Variables

var gameSequence = [];
var playerSequence = [];
var onTime = 500;
var offTime = 200;
var sequenceHoldTime = 1500;
var indicatorCycleTime = 100;
var cycle = 0;
var gameInProgress = false;
var soundOn = true;

const regex = /^[a-zA-Z0-9]$/;


// ---- Button lamp colour on click animation ----

$(".indicator").on("mousedown", function() {
  $(this).addClass("click");

  // -- Play audio
  if (gameInProgress) {
    var colour = $(this).attr("class").split(/\s+/)[1];
    playSound(colour);
  }
});

$(document).on("mouseup", function() {

  $(".indicator").removeClass("click");

});

$(document).on("keydown", function(e) {
  // -- sanitise space bar which can
  //    cause an error on filter function
  
  if (!regex.test(e.key)) { return; } 

  // -- Add click class for display and audio purposes only
  $(".indicator").filter("." + e.key).addClass("click");

  // -- Play audio
  if (gameInProgress) {
    var colour = $(".indicator").filter("." + e.key).attr("class").split(/\s+/)[1];
    playSound(colour);
  }
});


// ---- Key up triggers mouse up on the indicator corresponding to
//      the given key. (line 58)
$(document).on("keyup", function(e) {

  // -- sanitise key strokes to letters only
  //    to avoid exceptions from filter functions
  if (!regex.test(e.key)) { return; } 

  // -- Add click class for display purposes only
  $(".indicator").filter("." + e.key).removeClass("click");

  // -- trigger mouse up event on the specific indicator
  //    which runs all the logic we want.
  $(".indicator").filter("." + e.key).trigger("mouseup");
});

// ---- Other inputs

$(".btn-restart").on("click", function() {
  // -- Call gameover without displaying game over message
  gameOver(false);
  $("h2").text("Press a key to start");

});

$(".btn-reset").on("click", function() {
  // -- set high score value to 0
  $(".h-score-value").text("0");

});

// ---- Game start ----

//      From keyboard.
//      Respond to any key up, not just the game input keys.
/* $(document).on("keyup", startGame); */

//      From mouse Start and run.
//      This event is also invoked from the keyup event. (line 31)
$(".indicator").on("mouseup", function() {
  if (!gameInProgress){
    startGame();
  } else {
    progressGame(this);
  }
});

// ---- Game start routine

function startGame() {
  // -- increment game sequence
  if (gameSequence.length < 1) {
    
    gameInProgress = true;
    
    setTimeout(() => {
      initialiseGame();
      incrementSequence();
      updateScore();
    }, 100);  
  }
}

// ---- Game in progress routine ----

function progressGame(obj) {

  if (gameSequence.length < 1) { return; }
  
  var colour = $(obj).attr("class").split(/\s+/)[1];

  // -- add input to player sequence
  playerSequence.push(colour);

  // -- validate player sequence against game sequence
  if (!validateInput()) {
    gameOver();
  } else

  // -- if player sequence length = game sequence length
  // -- increment game sequence
  if (playerSequence.length === gameSequence.length) {

    //- Reset player sequence array
    playerSequence = [];

    //- Wait for some time after the user lifts the mouse
    //  Then add a new colour to the sequence
    //  Read out the sequence to the player
    setTimeout(() => {

      incrementSequence();
      updateScore();
      displaySequence();

    }, sequenceHoldTime);
    
  }

}


// ---- Game functions ----

function initialiseGame() {
  // -- Turn all indicators off
  $(".indicator").removeClass("click");

  // -- Set message to prepare player
  $("h2").html("Game starting in...");

  // -- Countdown
    countdown();
}
  
function validateInput() {

  for (var i = 0; i < playerSequence.length; i++) {

    //- If the player input sequence is wrong return
    //  bad response to trigger end of game.
    if (gameSequence[i] != playerSequence[i]) {
      return false;
    }

  }

  // -- If the routine makes it here the player sequence
  //    is correct so far.
  return true;
}

function incrementSequence() {

  var colour = Math.floor(Math.random() * 4);

  //-- add random colour to game sequence array
  switch (colour) {
    case 0:
      gameSequence.push("red");
      break;
    case 1:
      gameSequence.push("green");
      break;
    case 2:
      gameSequence.push("blue");
      break;
    case 3:
      gameSequence.push("yellow");
      break;
  }
}

// ---- Recursive displaySequence function to combat asynchronous
//      annoyances and permit readout of the game sequence to player.
//      Call without argument.

// to do: add sound
function displaySequence(index = 0) {
  
  // -- Break loop when entire game sequence has been displayed
  if (index >= gameSequence.length) { return; }

  // -- Otherwise 
  //    Play the indicator sound, and
  //    Pulse the indicator light
  //    - on for a duration onTime
  //    - off got a duration offTime, then
  //    move to the next position in the sequence
  $("." + gameSequence[index]).addClass("click");

  // -- Play unique sound relative to colour
  playSound(gameSequence[index]);


  setTimeout(() => {

    $("." + gameSequence[index]).removeClass("click")

    setTimeout(() => {
      displaySequence(index + 1);
    }, offTime);
  }, onTime);
}

function gameOver(displayMessage = true) {
  gameInProgress = false;

  // -- this function is called by the restart button
  //    Game over shall not be displayed when restart is clicked
  if(displayMessage) {
    $(".game-over").addClass("zoom-slow");
  }

  gameSequence = [];
  playerSequence = [];
}

// ---- Recursive countdown function to combat asynchronous
//      annoyances and permit sequencing.
//      Call without argument.

function countdown(index = 3) {
  if (index < 1) { 
    displaySequence();
    $("h2").text("Copy the sequence");
    return; 
  } else {
    $(".counter").text(index);

    //- Time to allow zoom class to be removed in another task
    setTimeout(() => {
      $(".counter").addClass("zoom");
    }, 50);  
  }
}

// ---- Animation end event listeners ----
//      Used to sequence animations so they are not called
//      all at once. There is probably a better way, but this
//      is working for now.

function playSound(colour) {
  soundOn = $("#sound-on").prop("checked");
  
  if (soundOn) {
    var audio = new Audio("./assets/audio/" + colour + ".mp3");
    audio.play();
  }
}

document.querySelector(".counter").addEventListener("animationend", function() {
  $(".counter").removeClass("zoom");
  countdown($(".counter").text() - 1);
});

document.querySelector(".game-over").addEventListener("animationend", function() {
  $(".game-over").removeClass("zoom-slow");
  $("h2").text("Press a key to start");
});

// ---- Flash the indicators when game is inactive ----

setInterval(() => {
  
  cycle = (cycle + 1) % 4;

  if (!gameInProgress) {
    switch (cycle) {
      case 0:
        $(".indicator.red").toggleClass("click");
        break;
      case 1:
        $(".indicator.green").toggleClass("click");
        break;
      case 2:
        $(".indicator.blue").toggleClass("click");
        break;
      case 3:
        $(".indicator.yellow").toggleClass("click");
        break; 
    }
  }
}, indicatorCycleTime);

// ---- On screen numeric indicators

function updateScore() {
  $(".c-score-value").text(gameSequence.length);

  if($(".h-score-value").text() < $(".c-score-value").text()) {
    $(".h-score-value").text($(".c-score-value").text());
  }
}

