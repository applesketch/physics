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
        super("Game", "Game");
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
        this.scene.start('Game');
    }
}

const game = new Phaser.Game({
    width: 500, 
    height: 650,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    backgroundColor: '#C01BAE', // pink
    scene: [Game], 
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false,
        }
    }
  });