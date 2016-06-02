/**
 * Created by Predrag on 26/04/2016.
 */
var winFramePositions= [];
var b = true;
var stopwatch = 60;
var winSymbolsAnimation = [0,1,2];
var tp= 0;
var totalWinAmount;
var multiplier;
var textWinAnimation = [];

function checkWinAndAnimateOnClientSide() {
    for (var t = 1; t < reelStripeRowCount+1; t++) {
        winFramePositions[t-1] = [];

        winFramePositions[t-1].push(0, t);
        for (var reel = 1; reel < config.gameSize.reelCount; reel++) {

            var go_next = false;
            for (var iterator = 1  ; iterator < reelStripeRowCount+1; iterator++) {

                if (reelStripeElements[0].getChildAt(t)._texture.baseTexture.uid ==
                    reelStripeElements[reel].getChildAt(iterator)._texture.baseTexture.uid) {
                    winFramePositions[t-1].push(reel, iterator);
                    go_next = true;
                    break;
                }
            }
            //  not needed to go any further
            if (go_next == false) {
                break;
            }
        }
    }
// pulsate the win if and show win amount
        totalWinAmount = 0;
        for ( tp = 0 ; tp < reelStripeRowCount; tp++) {

            if (winFramePositions[tp].length >= 6) {
                multiplier = (winFramePositions[tp].length / 2) - 1;
                totalWinAmount += multiplier * bet;
                enable_music_win();
                flashSymbols(tp);
        }
    }
    setTotalWin(); // if any
}

function flashSymbols(tp)
{
    if (stopwatch < 8 && stopwatch > 0){
        for (var p = 0; p < winFramePositions[tp].length; p++) {
            reelStripeElements[winFramePositions[tp][p]].getChildAt(winFramePositions[tp][++p]).alpha = 0;
        }
    }
    else if (stopwatch < 0){
        for (var p = 0; p < winFramePositions[tp].length; p++) {
            reelStripeElements[winFramePositions[tp][p]].getChildAt(winFramePositions[tp][++p]).alpha = 1;
        }
        stopwatch = 60;
    }
    stopwatch--;
    // render the container
    renderer.render(stage);
    winSymbolsAnimation[tp] = requestAnimationFrame(function(){flashSymbols(tp)});
}

function cancelWinAnim() {
    for(var i = 0 ; i < reelStripeRowCount; i++) {
        cancelAnimationFrame(winSymbolsAnimation[i]);
    }
}

function setTotalWin() {
    document.getElementById("win_amount").innerHTML = '<h2>Win amount: ' +  totalWinAmount + '</h2>';
    document.getElementById("balance_amount").innerHTML =  (balance += totalWinAmount).toString();
}

function setSpinButtonDisabled(){
    var str = '<img src="resources/img/spin3no.jpg" alt="Spin Button" height="50" width="50" align="center">';
    document.getElementById("button").innerHTML = str;
}

function setSpinButtonEnabled(){
    var str = '<img src="resources/img/spin3.jpg" alt="Spin Button" height="50" width="50" onclick="SpinIt()" align="center">';
    document.getElementById("button").innerHTML = str;
}

function enable_music_win(){
    win_audio = document.getElementById("win_music");
    win_audio.controls = false;
    win_audio.load();
    win_audio.play();
}

function initTextForTotalWin(xpos, ypos, totalwin)
{
    var textWinAnimation = new PIXI.Text('Win on line is: ' + totalwin, {font: 'bold 60px Verdana',
        fill: 'yellow', align:'center', stroke:'white', strokeThikness: 6});
    // in pixels
    textWinAnimation.anchor.set(0.5); // set to center
    textWinAnimation.position.x = xpos; text.position.y = ypos;
    textWinAnimation.visible = true;
    textWinAnimation.alpha=0.25;
    return textWinAnimation;
}

function initTextforWinPerLine(xpos, ypos, bet, multiplier){
    var win = bet * multiplier;
    var textWinAnimation = new PIXI.Text('Win on line is: ' + win, {font: 'bold 60px Verdana',
        fill: 'yellow', align:'center', stroke:'white', strokeThikness: 6});
    // in pixels
    textWinAnimation.anchor.set(0.5); // set to center
    textWinAnimation.position.x = xpos; text.position.y = ypos;
    textWinAnimation.visible = true;
    textWinAnimation.alpha=0.25;
    return textWinAnimation;
}