/**
 * Created by Predrag on 16/04/2016.
 * Pixi used v.3.0.11
 */
var reelImage=null;
var reelImageWidth=100;
var reelImageHeight=100;
var reelStripes=[];//63 //definitions of reelStripes
var reelStripesIndexes=[];//current reelStripesIndexes
var reelStripeElements=[];//graphicsl repsesentation of stripes
var StartAt = null; //when the spin has started
var oneSpinTimeElapsedMax = 500;
var spinPerReelDelay = 200;
var reelStripePosition = [3,3,3,3,3]; //starting positions, should be told by server
var reelStripesPxOffsets = [0,0,0,0,0]; //0-imageHeight
var reelStripesCumulativePositon = [0,0,0,0,0]; //0-infinite
var reelStripeRowCount = 3;
var stage;
var renderer;
var balance = 500; // eur
var bet = 0;
var spinSpeed=100; //ms
var background_audio ;
var win_audio;
var spin_audio;

var options = {
    view:"game-canvas",
    resolution:1
};

function init() {
    setReelStripesWheels();
    startGame();
    document.getElementById("balance_amount").innerText = balance.toString();
    enable_music_bckd();
}
// timer function
var now = function() {
    return (new Date()).getTime();
}
//stand still animation on first load
function setInitReelPosition(){
    requestAnimationFrame(setInitReelPosition);
    renderer.render(stage);
}



function SpinIt(){
    StartAt = now();
    if(checkBalance()){
        setSpinButtonDisabled();
        cancelWinAnim();
        sufficientFunds();
        updateBalanceForOneSpin();
        enable_music_spin();
        doTheSpin();
        setTimeout(function(){checkWinAndAnimateOnClientSide();},oneSpinTimeElapsedMax +  4 * spinPerReelDelay);
        setTimeout(function(){setSpinButtonEnabled();},1600); // spin at least 1.6 sec
    }else{
        insufficientFunds();
    }
}

function startGame() {
    // Pixi stage and html position
    renderer = PIXI.autoDetectRenderer( 500,  300, {antialias: true });
    document.getElementById("main_wrap").insertBefore(renderer.view, document.getElementById("bet_panel"));
    stage = new PIXI.Container();

    // init start reel stripe elements (pictures)
    for(var stripeIndex=0;stripeIndex < config.gameSize.reelCount; stripeIndex++){
        reelStripeElements[stripeIndex] = new PIXI.Container();
        reelStripeElements[stripeIndex].position.x = stripeIndex * reelImageWidth; // * 100
        reelStripeElements[stripeIndex].width = reelImageWidth;
        for(var i=0;i<4;i++) {
            var texture = PIXI.Texture.fromImage("resources/img/" + reelStripes[stripeIndex][i] + ".jpg");
            // create a new Sprite using the texture
            reelImage = new PIXI.Sprite(texture);
            reelImage.width = reelImageWidth;
            reelImage.height = reelImageHeight;
            // center the sprites anchor point
            reelImage.anchor.x = 0;
            reelImage.anchor.y = 0;
            // bounce the sprite t the center of the screen
            reelImage.position.y = (i -1)  * reelImageHeight;  // -1, 0, 1, 2 * 100
            reelStripeElements[stripeIndex].addChild(reelImage);
            // now add it to the stage
            stage.addChild(reelStripeElements[stripeIndex]);
        }
    }
    setInitReelPosition();
}

// spin all reels animation
function doTheSpin() {
    for (var stripeIndex = 0; stripeIndex < config.gameSize.reelCount; stripeIndex++) {
        (function(stripeIndexLocal){setTimeout(function(){
            spinTheReel(stripeIndexLocal);
        }, stripeIndex*spinPerReelDelay)})(stripeIndex);
    }
}

// spin one reel animation
function spinTheReel(stripeIndex) {
    var CurrentTime = now();
    if((StartAt + oneSpinTimeElapsedMax + stripeIndex*spinPerReelDelay) > CurrentTime) {
        // set the vertical speed of the reels
        reelStripeElements[stripeIndex].position.y += spinSpeed;
        reelStripesPxOffsets[stripeIndex] += spinSpeed;

        // create no more
        if (reelStripesPxOffsets[stripeIndex] >= reelImageHeight) {
            reelStripesCumulativePositon[stripeIndex]+=1;
            reelStripesPxOffsets[stripeIndex] -= reelImageHeight;
            reelStripeElements[stripeIndex].addChild(getExactReelImage(stripeIndex, -(reelStripesCumulativePositon[stripeIndex])));
            reelStripeElements[stripeIndex].removeChildAt(0);
            //console.log(stripeIndex);
            //console.log(reelStripesCumulativePositon[stripeIndex]);
        }
        renderer.render(stage);
        requestAnimationFrame(function(){spinTheReel(stripeIndex)});
    }
}

function getExactReelImage(reel, pos){
    if(reelStripePosition[reel]>=reelStripes[reel].length){
        reelStripePosition[reel]=1;
    }
    var imagine = reelStripes[reel][reelStripePosition[reel]];
    reelStripePosition[reel]++;
    var texture_tmp = PIXI.Texture.fromImage("resources/img/"+imagine+".jpg",PIXI.SCALE_MODES.LINEAR);
    var reelImg = new PIXI.Sprite(texture_tmp);
    reelImg.anchor.x = 0;
    reelImg.anchor.y = 0;
    reelImg.position.y = (pos)*reelImageHeight;
    return reelImg;
}

function setReelStripesWheels(){
    // init reelStripes wheels
    for(var i=0; i < config.gameSize.reelCount; i++) {
        reelStripes[i] = config.reels[i].stripes[0].symbols;
        reelStripesIndexes = [0,0,0,0];
    }
}

function updateBalanceForOneSpin() {
    // update the balance
    bet = document.getElementById("bet_selector");
    var temp = bet.options[bet.selectedIndex].text;
    bet = temp;
    document.getElementById("balance_amount").innerHTML =  (balance -= temp).toString();
}

function checkBalance() { // check if sufficient balance for bet
    var betAmountSelector = document.getElementById("bet_selector");
    var betAmount = betAmountSelector.options[betAmountSelector.selectedIndex].text;
    if(balance > betAmount){//OK
        return true;
    }else{
        return false;
    }
}

function insufficientFunds() {//ovde implementiram dom popup
    $('.insufficientFunds').removeClass("hidden");
}

function sufficientFunds() {
    $('.insufficientFunds').addClass("hidden");
}

function enable_music_bckd(){
    background_audio = document.getElementById("background_music");
    background_audio.controls = false;
    background_audio.loop = true;
    background_audio.load();
    background_audio.play();
}

function enable_music_spin() {
    spin_audio = document.getElementById("spin_music");
    spin_audio.controls = false;
    spin_audio.load();
    spin_audio.play();
}

function disable_music_bckd(){
    background_audio.loop = false;
    background_audio.load();
}