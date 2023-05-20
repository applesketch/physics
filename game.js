class Intro extends Phaser.Scene {
    constructor() {
        super('intro')
    }
    preload() {
        this.load.path = "./img/";
        this.load.image("studio", "studio.png");
        this.load.audio("boom", "boom.mp3");
    }
    create() {
        let studio = this.add.sprite(250, 300, "studio");
        this.sound.add('boom').play();
        this.time.delayedCall(1500, () => {
            this.cameras.main.fadeOut(1000, 255,255,255);
            this.time.delayedCall(900, () => this.scene.start('menu'));
        });
    }
}
       
class Menu extends Phaser.Scene {
    constructor() {
        super('menu');
    }

    preload() {
        this.load.path = "./img/";
        this.load.image("title", "title.png");
    }

    create() {
        let title = this.add.sprite(250, 300, "title");
        let box = this.add.text(130, 450, "PLAY")
        .setFontSize(100);       

        this.input.on('pointerdown', () => {
            this.time.delayedCall(2000, () => {
                this.cameras.main.fadeOut(2000, 255,255,255);
            }); 
            this.scene.start('game');
            });
    }
}

class Outro extends Phaser.Scene {
    constructor() {
        super('outro');
    }
    create() {
        let box = this.add.text(30, 300, "GAME OVER")
        .setFontSize(80);
        let box2 = this.add.text(80, 450, "Click to restart")
        .setFontSize(30);
        this.input.on('pointerdown', () => {
            this.scene.start('game')
        });
    }
}

// referenced from https://www.emanueleferonato.com/2019/05/02/flappy-bird-html5-prototype-updated-to-phaser-3-16-2/

let gameOptions = {
    birdGravity: 800, // gravity when no input
    birdSpeed: 125,
    flapPower: 300,
    minPipeHeight: 30,
    pipeDistance: [220, 280], // distance between pipes
    pipeGap: [100, 150],
};

class Game extends PhysicsScene {
    constructor() {
        super("game", "Game");
    }
    preload() {
      this.load.path = "./img/";
      this.load.image('bird', 'bird.png'); 
      this.load.image('pipe', 'pipe.png');
    }
    create() {
        // bird sprite
        this.bird = this.physics.add.sprite(100, 100, 'bird');
        this.bird.setScale(0.05);
        this.bird.body.gravity.y = gameOptions.birdGravity;
        this.input.on('pointerdown', this.flap, this);
        // score
        this.score = 0;
        let style = { font: '80px Arial', fill: '#fff'};
        this.scoreText = this.add.text(230, 50, '', style);
        this.updateScore(this.score);
        // pipe group
        this.pipeGroup = this.physics.add.group();
        this.pipePool = [];
        for(let i = 0; i < 4; i++){
            this.pipePool.push(this.pipeGroup.create(0, 0, 'pipe'));
            this.pipePool.push(this.pipeGroup.create(0, 0, 'pipe'));
            this.placePipes(false);
        }
        this.pipeGroup.setVelocityX(-gameOptions.birdSpeed);
    }
    updateScore(inc){
        this.score += inc;
        this.scoreText.text = this.score;
    }
    placePipes(addScore){
        let rightmost = this.getRightmostPipe();
        let pipeGapHeight = Phaser.Math.Between(gameOptions.pipeGap[0], gameOptions.pipeGap[1]);
        let pipeGapPosition = Phaser.Math.Between(gameOptions.minPipeHeight + pipeGapHeight / 2, game.config.height - gameOptions.minPipeHeight - pipeGapHeight / 2);
        this.pipePool[0].x = rightmost + this.pipePool[0].getBounds().width + Phaser.Math.Between(gameOptions.pipeDistance[0], gameOptions.pipeDistance[1]);
        this.pipePool[0].y = pipeGapPosition - pipeGapHeight / 2;
        this.pipePool[0].setOrigin(0, 1);
        this.pipePool[1].x = this.pipePool[0].x;
        this.pipePool[1].y = pipeGapPosition + pipeGapHeight / 2;
        this.pipePool[1].setOrigin(0, 0);
        this.pipePool = [];
        if(addScore){
            this.updateScore(1);
        }
    }
    getRightmostPipe(){
        let rightmostPipe = 0;
        this.pipeGroup.getChildren().forEach(function(pipe){
            rightmostPipe = Math.max(rightmostPipe, pipe.x);
        });
        return rightmostPipe;
    }

    flap(){
        this.bird.body.velocity.y = -gameOptions.flapPower;
    }
    
    update() {
        this.physics.world.collide(this.bird, this.pipeGroup, function() {
            this.die();
        }, null, this);
        if(this.bird.y > game.config.height || this.bird.y < 0){
            this.die();
        }
        this.pipeGroup.getChildren().forEach(function(pipe) {
            if(pipe.getBounds().right < 0){
                this.pipePool.push(pipe);
                if(this.pipePool.length == 2){
                    this.placePipes(true);
                }
            }
        }, this)
      }
      die(){
        localStorage.setItem(gameOptions.localStorageName, Math.max(this.score));
        this.gotoScene('outro');
    }
}

const game = new Phaser.Game({
    width: 500, 
    height: 650,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    backgroundColor: '#C01BAE', // pink
    scene: [Intro, Menu, Outro, Game], 
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false,
        }
    }
  });