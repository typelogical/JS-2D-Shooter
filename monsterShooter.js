//set main namespace
goog.provide('monsterShooter');


//get requirements
goog.require('lime.Director');
goog.require('lime.Scene');
goog.require('lime.Layer');
goog.require('lime.Circle');
goog.require('lime.Label');
goog.require('lime.animation.Spawn');
goog.require('lime.animation.FadeTo');
goog.require('lime.animation.ScaleTo');
goog.require('lime.animation.MoveTo');
goog.require('lime.Sprite');
goog.require('lime.Button');
goog.require('goog.math.Box');
goog.require('lime.Node');
goog.require('lime.scheduleManager');
goog.require('lime.audio.Audio');
/**************************************************************************/
/*Player Object */
function Shooter () {

}
Shooter.prototype = {
    sprite : null,
    shoot : function (y) {
       // sprite.setPosition (0, y); 
    }
}

/*Bullet Object */
function Bullet (s) {
    this.sprite = s;
    this.active = true;
};
 Bullet.prototype = {
    sprite : null,
    active : true,
    setInactive : function () {
        this.sprite.setOpacity (0);
        this.active = false;
    },
    getState : function () {
        return this.active;
    }
};
/*Monster Object */
function Monster (s) {
    this.sprite = s;
    this.active = true;
};
 Monster.prototype = {
    sprite : null,
    active : true,
    setInactive : function () {
        this.sprite.setOpacity (0);
        this.active = false;
    },
    getState : function () {
        return this.active;
    }
};

/***************************** (**********************************************/

// entrypoint
monsterShooter.start = function(){ 
	var screenWidth=1024,screenHeight=768,
        director = new lime.Director(document.body,1024,768);

    menuScene = new lime.Scene();
    buttonAnchorX = (1024 / 2);
    buttonAnchorY = 368;
    helpButton = new lime.Button( new lime.Sprite().setFill('Images/instructionsButtonUp.png'),
                                 new lime.Sprite().setFill('Images/instructionsButtonDown.png')).setPosition (buttonAnchorX, buttonAnchorY);
    playButton = new lime.Button( new lime.Sprite().setFill('Images/playButtonUp.png'),
                                 new lime.Sprite().setFill('Images/playButtonDown.png')).setPosition (buttonAnchorX,buttonAnchorY + 70);
   
    title = new lime.Label().setSize(800,70).setFontSize(60).setText('Monster Shooter!')
        .setOpacity(1).setPosition(512,80).setFontColor('#999').setFill(200,100,0,1);
    menuScene.appendChild(title);
    menuScene.appendChild(helpButton);
    menuScene.appendChild(playButton); 

	var showMenu = function (e) { 
       director.replaceScene(menuScene);
    };

	director.makeMobileWebAppCapable();
    var gameScene = new lime.Scene();
    var shooter = new lime.Sprite().setFill('Images/shooter.png').setPosition (130,screenHeight / 2);
    var monster = new Monster (new lime.Sprite().setFill('Images/monster.png')) - 1;
    var scoreBoard = null;
    var bullets = [];
    var monsters = [];
    var kills = 0;
    var lives = 3;
    var scoreBoardHeight = 50;
    var scoreBoardWidth = 200;
    var backButton = new lime.Button( new lime.Sprite().setFill('Images/backButtonUp.png'),
                                     new lime.Sprite().setFill('Images/backButtonDown.png')).setPosition (buttonAnchorX, buttonAnchorY)
    goog.events.listen(backButton, ['mousedown', 'touchstart'], showMenu);

    var showInstructions = function (e) {
        var instructionScene = new lime.Scene ();
        title = new lime.Label().setSize(800,70).setFontSize(60).setText('instructions')
            .setOpacity(1).setPosition(512,80).setFontColor('#999').setFill(200,100,0,1);
        var instructionsStr = "Tap to shoot. If three monsters reach the left line, you lose.";
        var instructions = new lime.Label().setSize(800,70).setFontSize(20).setText(instructionsStr)
            .setOpacity(1).setPosition(512, 200).setFontColor('#000');
        instructionScene.appendChild(title);
        instructionScene.appendChild(instructions);
        instructionScene.appendChild(backButton);
        director.replaceScene(instructionScene);
    };
    var showWinner = function() {
        var winnerScene = new lime.Scene ();
        title = new lime.Label().setSize(800,70).setFontSize(60).setText('You Won!')
            .setOpacity(1).setPosition(512,80).setFontColor('#999').setFill(200,100,0,1);
        winnerScene.appendChild(title);
        winnerScene.appendChild(backButton);
        director.replaceScene(winnerScene);
    };
    var showLoser = function() {
        var loserScene = new lime.Scene();
        title = new lime.Label().setSize(800,70).setFontSize(60).setText('Ouch, you lost.')
            .setOpacity(1).setPosition(512,80).setFontColor('#999').setFill(200,100,0,1);
        loserScene.appendChild(title);
        loserScene.appendChild(backButton);
        director.replaceScene(loserScene);
    };
    var moveLeft = function (y) { 
        return new lime.animation.MoveTo(-100, y).setSpeed(2.5)
    };
    var moveRight = function (y) { 
        return new lime.animation.MoveTo(screenWidth + 100, y).setSpeed(1)
    };
    var genMonster = function () {
        var offset = 50;    // The offset for the screen
        var y = Math.random (0) * 10000 % (screenHeight - offset) + offset;
        var index = monsters.push(new Monster (new lime.Sprite().setFill('Images/monster.png')
            .setPosition (screenWidth, y))) - 1;
        monsters[index].sprite.runAction(moveLeft (y));
        gameScene.appendChild(monsters[index].sprite);
    };

    var showScoreBoard = function () {
        if (scoreBoard) gameScene.removeChild(scoreBoard);
        var score = 'kills: ' + kills + ' Lives: ' + lives;
        //console.log ('Score: ' + score);
        scoreBoard = new lime.Label().setSize(300,50).setFontSize(20)
        .setText(score).setOpacity(1).setFontColor ('#000')
        .setPosition(scoreBoardWidth - scoreBoardWidth/2, screenHeight - scoreBoardHeight/2);
        gameScene.appendChild(scoreBoard);
    };
    var shootSound = new lime.audio.Audio("Sounds/shooting.wav");
    playerShoot = function (e) {
        pos = e.position.y + 20;
        shooter.setPosition (130, pos);
        index = bullets.push (new Bullet (new lime.Sprite().setFill('Images/bullet.png').setPosition (160, pos - 10))) - 1;
        bullets[index].sprite.runAction (moveRight (pos));
        gameScene.appendChild (bullets[index].sprite);
        shootSound.play();
    };
/*****************************************************************************************/
    var hitSound = new lime.audio.Audio("Sounds/hit.wav");
    goog.events.listen(playButton,['mousedown', 'touchstart'],function(e){
        /* Start the game */
        kills = 0;
        lives = 3;
        bullets = [];
        monsters = [];
        gameScene =  new lime.Scene();
        goog.events.listen(gameScene.getScene(), ['mousedown', 'touchstart'], playerShoot); 
        var updater = function () {
           for (i=0; i < bullets.length; ++i){
                for (j = 0; j < monsters.length; ++j) {
                    if (goog.math.Box.intersects (bullets[i].sprite.getBoundingBox(), monsters[j].sprite.getBoundingBox())
                        && bullets[i].getState () == true && monsters[j].getState () == true) {
                       bullets[i].setInactive ();
                        monsters[j].setInactive ();
                        ++kills;
                        hitSound.play();
                    }
                }
            }
            for (j = 0; j < monsters.length; ++j) {
                     if (monsters[j].sprite.getPosition().x < 0 && monsters[j].getState() == true) { 
                        console.log("x: " + monsters[j].sprite.getPosition().x);
                        monsters[j].setInactive ();
                        --lives;
                    }
            }
            if (kills == 10) {
                showWinner();
            }

            if (lives == 0) {
                showLoser();
            }
            showScoreBoard();
        };
        lime.scheduleManager.setDisplayRate (1000 / 60);
        lime.scheduleManager.scheduleWithDelay(updater,this,1000/60); 
        lime.scheduleManager.scheduleWithDelay(genMonster,this, 3000);
        gameScene.appendChild(shooter);
        director.replaceScene(gameScene);
    });
    
    
    goog.events.listen(gameScene.getScene(), ['mousedown', 'touchstart'], playerShoot); 
    goog.events.listen(helpButton, ['mousedown','touchstart'], showInstructions);
	// set current scene active
	director.replaceScene(menuScene);

}
//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('monsterShooter.start', monsterShooter.start);
