//the name of the module must correspond to its file path
ig.module(
	'game.main' 
)
.requires(
	//we only need impact.game and impact.entity-pool
	//everything else we use gets brought in through
	//the requires field of impact.game
	'impact.game',
	'impact.entity-pool'
)
.defines(function(){

//a basic extension to the Entity class that adds functionality
//that many of the game objects will use
ScreenWrapEntity = ig.Entity.extend({
	//add a screen wrap function to Entity allowing objects to
	//loop from one edge of the screen to the other
	screenWrap: function() {
		if(this.pos.x - this.offset.x > ig.system.width) {
			this.pos.x = -this.size.x - this.offset.x;
		}
		else if(this.pos.x + this.size.x + this.offset.x < 0) {
			this.pos.x = ig.system.width + this.offset.x;
		}
		if(this.pos.y - this.offset.y > ig.system.height) {
			this.pos.y = -this.size.y - this.offset.y;
		}
		else if(this.pos.y + this.size.y + this.offset.y < 0) {
			this.pos.y = ig.system.height + this.offset.y;
		}
	}
});

//the ship object that is controlled by the player
Ship = ScreenWrapEntity.extend({
	//collision box is 50x50
    size: {x:50, y:50},
	
	//collide against Type B Entities (Asteroids, Enemy Ships, and Enemy Bullets)
    checkAgainst: ig.Entity.TYPE.B,
    
	//declare an animation sheet with 50x60 frames
    animSheet: new ig.AnimationSheet('media/ship.png', 50, 60),
    
	//set speed limits
	//and acceleration values
    maxVel: {x: 300, y: 300},
	maxAngleVel: 5,
	rotationalAcc: 3,
	forwardAcc: 200,
	
	//a timer that limits shooting to three times per second
	shotTimer: new ig.Timer(0.33),
	//the base speed for all bullets
	shotSpeed: 300,
	
	//the starting lives for the ship
	health: 3,
	//a timer to give 3 seconds of invincibility after being respawning
	invincibilityTimer: new ig.Timer(3),
    
    init: function(x, y, settings) {
		//call the parent init function to handle
		//several basic things automatically
        this.parent(x, y, settings);
		//shift the ship up and to the left by half the size
		//so it is positioned perfectly in the center of the screen
		this.pos.x -= this.size.x/2;
		this.pos.y -= this.size.y/2;
		
		//add animations for the various states the ship can be in
        this.addAnim('idle', 0.1, [0]);
        this.addAnim('turn', 0.1, [1, 2, 3]);
        this.addAnim('forward', 0.1, [4, 5, 6]);
		
		//reset the shot timer to prevent a shot from firing
		//as soon as the game starts (from pressing SPACE)
		this.shotTimer.reset();
    },
    
    update: function() {
        this.checkMovement();		//check the movement keys
		this.screenWrap();			//wrap around the edges of the screen
		this.checkShooting();		//check if a shot should be fired
        this.invincibilityBlink();	//blink the animation if the player is invincible
        this.parent();				//the parent update handles movement and stuff
    },
	
	checkMovement: function() {
		//set the angular acceleration based on the current input
		//and play appropriate animation, mirrored if necessary
		//accelerate more quickly if the player is trying to
		//turn away from the direction they are rotating
		if(ig.input.state('left') && !ig.input.state('right')) {
			this.angleAcc = -this.rotationalAcc * ((this.angleVel > 0) ? 2 : 1);
			this.changeAnim(this.anims.turn);
			this.currentAnim.flip.x = true;
        }
        else if(ig.input.state('right') && !ig.input.state('left')) {
            this.angleAcc = this.rotationalAcc * ((this.angleVel < 0) ? 2 : 1);
			this.changeAnim(this.anims.turn);
			this.currentAnim.flip.x = false;
        }
        else {
			this.changeAnim(this.anims.idle);
            this.angleAcc = 0;
        }
		
		//use trig to set the accelerations appropriately based on the current input
		//and play the appropriate animation
		if(ig.input.state('up')) {
			this.accel.x = this.xComponent(this.forwardAcc);
			this.accel.y = this.yComponent(this.forwardAcc);
			this.changeAnim(this.anims.forward);
		}
		else {
			this.accel.x = this.accel.y = 0;
		}
	},
	
	checkShooting: function() {
		//check the input and whether enough time has elapsed
		//since the previous shot, and fire accordingly
		if(ig.input.state('shoot') && this.shotTimer.delta() >= 0) {
			//use trig to place the bullet over the tip of the ship
			centerX = this.pos.x + this.size.x/2 + this.xComponent(this.size.x/2);
			centerY = this.pos.y + this.size.y/2 + this.yComponent(this.size.y/2);
			//calculate the velocity of the bullet and add it to the ship's velocity to make the trajectory more dynamic
			velX = this.vel.x + this.xComponent(this.shotSpeed);
			velY = this.vel.y + this.yComponent(this.shotSpeed);
			//spawn a player bullet entity
			ig.game.spawnEntity(PlayerBullet, centerX, centerY, {vel: {x: velX, y: velY}});
			//reset the shot timer to prevent rapid firing
			this.shotTimer.reset();
		}
	},
	
	invincibilityBlink: function() {
		if(this.invincibilityTimer.delta() < 0) {
			//blink the ship randomly with diminishing speed as the invincibility timer wears off
			this.currentAnim.alpha = (Math.random() > 1 / Math.abs(this.invincibilityTimer.delta())) ? 0: 1;
		}
		else this.currentAnim.alpha = 1;
	},
	
	destroyShip: function() {
		//place the ship back in the center of the screen
		this.pos.x = ig.system.width/2 - this.size.x/2;
		this.pos.y = ig.system.height/2 - this.size.y/2;
		//reset the velocities and animation
		this.vel = {x: 0, y: 0};
		this.angleVel = 0;
		this.changeAnim(this.anims.idle);
		this.currentAnim.angle = 0;
		//remove a life and reset the invincibility timer
		this.receiveDamage(1);
		this.invincibilityTimer.reset();
		//if we're out of lives, we should end the game
		if(this.health == 0)	ig.game.endGame();
	},
	
	//a pair of helper functions used to find the x and y components of a value based on the ship's angle
	xComponent: function(value) {	return Math.cos(this.currentAnim.angle - (Math.PI/2)) * value;	},
	yComponent: function(value) {	return Math.sin(this.currentAnim.angle - (Math.PI/2)) * value;	},
	
	check: function(other) {
		//if the ship is invincible, ignore the collision
		if(this.invincibilityTimer.delta() < 0)	return;
		
		//break the asteroid (without scoring points)
		if(other instanceof Asteroid)
			other.breakAsteroid(false);
		//or destroy the enemy ship
		else if(other instanceof EnemyShip)
			other.destroyShip(false);
		//or destroy the enemy bullet
		else if(other instanceof EnemyBullet)
			other.kill();
		
		//and finally, destroy the ship
		this.destroyShip();
	}
});

EnemyShip = ig.Entity.extend({
	//the collision box is 50x35
	size: {x: 50, y: 35},
	
	//declare an animation sheet with 50x35 frames
    animSheet: new ig.AnimationSheet('media/enemy_ship.png', 50, 35),
	
	//declare as Type B, so it will collide with the player's ship and bullets
	type: ig.Entity.TYPE.B,
	
	//an enum to track the state of the ship
	shipState: {
	state: "SEEKING",
	SEEKING: "SEEKING",
	MOVING: "MOVING",
	SHOOTING: "SHOOTING"
	},
	
	//a timer to pause between state changes
	stateTimer: new ig.Timer(1),
	
	//the position to move toward
	targetPos: {x: 0, y: 0},
	
	//the velocity when moving toward the target position (the enemy ship does not accelerate)
	velocity: 3,
	
	//the velocity of enemy bullets (a bit slower than player bullets)
	shotSpeed: 200,
	
	//enemy ships are worth 50 points
	pointValue: 50,
    
    init: function(x, y, settings) {
		//call parent reset function to handle
		//positioning and reset the variables
		this.parent(x, y, settings);
		
		//add the animation
        this.addAnim('idle', 0.1, [0], true);
    },
    
    update: function() {
		//don't do anything if the timer isn't ready
		if(this.stateTimer.delta() < 0)	return;
		
		//if the timer is ready, act according to the current state of the ship
		switch(this.shipState.state) {
			case this.shipState.SEEKING:
				this.seekShip();
				break;
			case this.shipState.MOVING:
				this.move();
				break;
			case this.shipState.SHOOTING:
				this.shoot();
				break;
		}
    },
	
	seekShip: function() {
		//choose a new random position to move to
		this.targetPos.x = Math.random() * (ig.system.width - this.size.x);
		this.targetPos.y = Math.random() * (ig.system.height - this.size.y);
		
		//and change to the MOVING state
		this.changeState(this.shipState.MOVING);
	},
	
	move: function() {
		//calculate the distances to the target position
		distX = this.targetPos.x - this.pos.x;
		distY = this.targetPos.y - this.pos.y;
		distance = Math.sqrt(Math.pow(distX, 2) + Math.pow(distY, 2));
		
		//if we're closer to the target than our velocity, just land on the target
		//and change to the SHOOTING state
		if(distance < this.velocity) {
			this.pos.x = this.targetPos.x;
			this.pos.y = this.targetPos.y;
			this.changeState(this.shipState.SHOOTING);
			return;
		}
		
		//otherwise, calculate the angle to the target position
		angleTo = Math.atan2(distY, distX);
		
		//then use the angle to calculate the velocities
		velX = Math.cos(angleTo) * this.velocity;
		velY = Math.sin(angleTo) * this.velocity;
		
		//then move the ship with those velocities
		this.pos.x += velX;
		this.pos.y += velY;
	},
	
	shoot: function() {
		//calculate the angle to the player ship
		angleTo = this.angleTo(ig.game.ship);
		
		//use the angle to calculate the bullet speed
		velX = Math.cos(angleTo) * this.shotSpeed;
		velY = Math.sin(angleTo) * this.shotSpeed;
		
		//create a new bullet and angle it to match the direction it is traveling
		newBullet = ig.game.spawnEntity(EnemyBullet, this.pos.x + this.size.x / 2, this.pos.y + this.size.y / 2, {vel: {x: velX, y: velY}});
		newBullet.currentAnim.angle = angleTo;
		
		//change to the SEEKING state
		this.changeState(this.shipState.SEEKING);
	},
	
	//change to the given state and reset the state timer
	changeState: function(state) {
		this.shipState.state = state;
		this.stateTimer.reset();
	},
	
	//destroy the ship and reset the timer
	//score some points if it was destroyed by a bullet
	destroyShip: function(score) {
		if(score)
			ig.game.score += this.pointValue;
		ig.game.enemyTimer.reset();
		this.kill();
	}
});

//a class from which the player's and enemy's bullets extend
Bullet = ScreenWrapEntity.extend({    
	//set speed limit
    maxVel: {x: 500, y: 500},
	
	//used as a sort of timer, health decays by 1 every update
	//this allows the bullets to be cleaned up automatically by the kill function
	health: 75,
    
    init: function(x, y, settings) {
		console.log("bullet");
		console.log("bang");
		//call the parent init function to handle
		//several basic things automatically
        this.parent(x, y, settings);
		//shift the bullet up and to the left by half the size so it is positioned properly
		this.pos.x -= this.size.x/2;
		this.pos.y -= this.size.y/2;
		
		//add a single frame animation for the bullet art
        this.addAnim('idle', 0.1, [0]);
    },
	
	//the reset function is called when an entity is regenerated from the entity pool
	//the init function is not called when an entity is reset this way
	reset: function(x, y, settings) {
		//call parent reset function to handle
		//positioning and reset the variables
		this.parent(x, y, settings);
		
		//shift the bullet up and to the left by half the size so it is positioned properly
		this.pos.x -= this.size.x/2;
		this.pos.y -= this.size.y/2;
	},
    
    update: function() {
		this.screenWrap();		//wrap around the edges of the screen
		this.receiveDamage(1);	//decay the health by 1, until the bullet is killed
		this.fadeBullet();		//fade the bullet away at the end of its life
        this.parent();			//the parent update handles movement and stuff
    },
	
	fadeBullet: function() {
		//fade the bullet away if its close to disappearing
		if(this.health < 10) {
			this.currentAnim.alpha = this.health / 10;
		}
		//otherwise set the alpha to 1, for when it's recycled
		else
			this.currentAnim.alpha = 1;
	}
});

PlayerBullet = Bullet.extend({
	//collision box is 10x10
    size: {x:10, y:10},
	
	//collide against Type B Entities (Asteroids, Enemy Ships, and Enemy Bullets)
    checkAgainst: ig.Entity.TYPE.B,
    
	//declare an animation sheet with 10x10 frames
    animSheet: new ig.AnimationSheet('media/bullet.png', 10, 10),
	
	check: function(other) {
		//break the asteroid
		if(other instanceof Asteroid)
			other.breakAsteroid(true);
		//or destroy the enemy ship
		else if(other instanceof EnemyShip)
			other.destroyShip(true);
		//or destroy the enemy bullet
		else if(other instanceof EnemyBullet)
			other.kill();
		//and destroy the bullet
		this.kill();
	}
});

EnemyBullet = Bullet.extend({
	//collision box is 10x5
    size: {x:10, y:5},
	
	//declare as Type B, so it will collide with the ship
    type: ig.Entity.TYPE.B,
	
	//give enemy bullets more health so they last a bit longer
	health: 150,
    
	//declare an animation sheet with 10x5 frames
    animSheet: new ig.AnimationSheet('media/enemy_bullet.png', 10, 5)
});

//a class from which the two sizes of asteroid can extend
Asteroid = ScreenWrapEntity.extend({    
	//set the speed limit
    maxVel: {x: 500, y: 500},
	
	//declare as Type B, so it will collide with the ship and bullets
	type: ig.Entity.TYPE.B,
	
	pointValue: 0,
    
    init: function(x, y, settings) {
		//call the parent init function to handle
		//several basic things automatically
        this.parent(x, y, settings);
		
		//add the animation
        this.addAnim('idle', 0.1, [0, 1, 2], true);
		
		//randomize the animation and starting velocity
		this.randomizeAnimation();
		this.randomizeVelocity();
    },
	
	//the reset function is called when an entity is regenerated from the entity pool
	//the init function is not called when an entity is reset this way
	reset: function(x, y, settings) {
		//call parent reset function to handle
		//positioning and reset the variables
		this.parent(x, y, settings);
		
		//randomize the animation and starting velocity
		this.randomizeAnimation();
		this.randomizeVelocity();
	},
	
	randomizeAnimation: function() {
		//stop the animation and choose a random frame and angle
		//this will make the asteroids have some visual variety
		this.currentAnim.gotoRandomFrame();
		this.currentAnim.timer.pause();
		this.currentAnim.angle = Math.random() * Math.PI * 2;
	},
	
	randomizeVelocity: function() {
		//choose a random angle and velocity and launch the asteroid
		velAngle = Math.random() * Math.PI * 2;
		velMag = Math.random() * 50 + 75;
		this.vel = {x: Math.cos(velAngle) * velMag, y: Math.sin(velAngle) * velMag};
	},
    
    update: function() {
		this.screenWrap();	//wrap around the edges of the screen
        this.parent();		//the parent update handles movement and stuff
    },
	
	breakAsteroid: function(score) {
		//score some points if the asteroid is destroyed by a bullet
		if(score)	ig.game.score += this.pointValue;
		//kill the asteroid
		this.kill();
	}
});

AsteroidBig = Asteroid.extend({
	//the collision box is 90x90, slightly smaller than the visual appearance
	size: {x: 90, y: 90},
	//offset the animations by 5 to account for the smaller collision box
	offset: {x: 5, y: 5},
    
	//declare an animation sheet with 100x100 frames
    animSheet: new ig.AnimationSheet('media/asteroid_big.png', 100, 100),
	
	//big asteroids are worth 10 points
	pointValue: 10,
	
	breakAsteroid: function(score) {
		//spawn 2 smaller asteroids in random positions above this large asteroid
		ig.game.spawnEntity(AsteroidSmall, this.pos.x + Math.random() * 50, this.pos.y + Math.random() * 50);
		ig.game.spawnEntity(AsteroidSmall, this.pos.x + Math.random() * 50, this.pos.y + Math.random() * 50);
		
		//the parent breakAsteroid function kills the asteroid and scores points
		this.parent(score);
	}
});

AsteroidSmall = Asteroid.extend({
	//the collision box is 40x40, slightly smaller than the visual appearance
	size: {x: 40, y: 40},
	//offset the animation by 5 to account for the smaller collision box
	offset: {x: 5, y: 5},
    
	//declare an animation sheet with 50x50 frames
    animSheet: new ig.AnimationSheet('media/asteroid_small.png', 50, 50),
	
	//small asteroids are worth 20 points
	pointValue: 20
});

AsteroidsGame = ig.Game.extend({
	
	started: false,		//whether the game has been started
	gameOver: false,	//whether the game has been lost
	
	//a font used to display the lives and score
	font: new ig.Font('media/04b03.font.png'),
	
	//the outer space background
	spaceBackground: new ig.Image('media/space.png'),
	
	//two overlays for the title screen and game over screen
	titleScreen: new ig.Image('media/title.png'),
	gameOverScreen: new ig.Image('media/gameover.png'),
	
	//the current score
	score: 0,
	
	//the ship object that the player will control
	ship: null,
	//an image to draw on the HUD for the players lives
	shipLife: new ig.Image('media/life.png'),
	
	//a timer and some variables to keep track of when
	//new asteroids should be added
	asteroidTimer: new ig.Timer(25),
	asteroidTiming: 15,
	asteroidMaxTiming: 15,
	asteroidMinTiming: 8,
	maxAsteroids: 15,
	
	//a timer to keep track of when an enemy ship should be added
	enemyTimer: new ig.Timer(15),
	
	//the init function is called when the game is launched
	//it should be used to initialize necessary objects and controls
	init: function() {
		//initialize the necessary keyboard inputs
		ig.input.bind(ig.KEY.LEFT_ARROW, 'left');
        ig.input.bind(ig.KEY.RIGHT_ARROW, 'right');
        ig.input.bind(ig.KEY.UP_ARROW, 'up');
        ig.input.bind(ig.KEY.SPACE, 'shoot');
		
		//enable entity pooling on entities that will be created frequently
		//this saves the game from having to do a lot of garbage collection
		ig.EntityPool.enableFor(Bullet);
		ig.EntityPool.enableFor(Asteroid);
	},
	
	//the update function is called once every frame
	//it should be used to handle the game logic
	update: function() {
		//the parent update function handles update calls on the entities
		//and collision calls between entities
		this.parent();
		//if we haven't started or the game is over, wait for the starting input
		if(!this.started || this.gameOver) {
			if(ig.input.state('shoot')) {
				this.startGame();	//handle the logic for starting the game
			}
		}
		//otherwise, we're in the game
		else {
			//handle the asteroid spawning
			this.considerSpawningAsteroid();
			//handle the enemy ship spawning
			this.considerSpawningEnemyShip();
		}
	},
	
	//the draw function is called once every frame
	//it should be used for rendering things in the appropriate order
	draw: function() {
		//we always draw the outer space background first
		this.spaceBackground.draw(0, 0);
		
		//if we haven't started yet, draw the title screen
		if(!this.started)	this.titleScreen.draw(0, 0);
		
		//if we're actually in game, things get a little more complicated
		else if(this.started && !this.gameOver) {
			//draw the HUD string at the center of the top of the screen
			this.font.draw('LIVES:        SCORE: ' + this.score, ig.system.width/2, 15, ig.Font.ALIGN.CENTER);
			
			//draw as many lives as the ship has remaining
			for(j = 0; j < this.ship.health; j++) {
				this.shipLife.draw(335 + j * 20, 20);
			}
			
			//now draw the entities (the ship, bullets, asteroids, etc.)
			for( i = 0; i < this.entities.length; i++ ) {
				this.entities[i].draw();
			}
		}
		
		//otherwise we're in the game over state
		else {
			//draw the game over overlay
			this.gameOverScreen.draw(0, 0);
			//keep drawing the HUD so we can see what score we got
			this.font.draw('LIVES:        SCORE: ' + this.score, ig.system.width/2, 15, ig.Font.ALIGN.CENTER);
		}
	},
	
	startGame: function() {
		//spawn a ship in the center of the screen
		this.ship = this.spawnEntity(Ship, ig.system.width/2, ig.system.height/2);
		
		//set the state appropriately
		this.started = true;
		this.gameOver = false;
		
		//reset the score, and the timers
		this.score = 0;
		this.asteroidTiming = this.asteroidMaxTiming;
		this.enemyTimer.reset();
		
		//spawn a single asteroid, so there is something to shoot immediately
		this.spawnAsteroid();
	},
	
	endGame: function() {
		//remove any remaining entities (asteroids, bullets, etc.)
		for( i = 0; i < this.entities.length; i++ ) {
			this.entities[i].kill();
		}
		//set the state appropriately
		this.gameOver = true;
	},
	
	considerSpawningAsteroid: function() {
		//spawn an asteroid if enough time has passed and the maximum amount of asteroids has not been reached
		if(this.asteroidTimer.delta() >= 0 && this.getEntitiesByType(Asteroid).length < this.maxAsteroids) {
			this.spawnAsteroid();
		}
	},
	
	spawnAsteroid: function() {
		//50% chance of spawning on the top or bottom
		if(Math.random() < 0.5) {
			//25% chance of spawning on the top
			if(Math.random() < 0.5)
				this.spawnEntity(AsteroidBig, Math.random() * ig.system.width, -100);
			//25% chance of spawning on the bottom
			else
				this.spawnEntity(AsteroidBig, Math.random() * ig.system.width, ig.system.height + 5);
		}
		//50% chance of spawning on the left or right
		else {
			//25% chance of spawning on the left
			if(Math.random() < 0.5)
				this.spawnEntity(AsteroidBig, -100, Math.random() * ig.system.height);
			//25% chance of spawning on the right
			else
				this.spawnEntity(AsteroidBig, ig.system.width + 5, Math.random() * ig.system.height);
		}
		
		//lower the asteroid timing, so they spawn faster as the time goes on
		if(this.asteroidTiming > this.asteroidMinTiming)	this.asteroidTiming--;
		//and reset the timer to the appropriate time
		this.asteroidTimer.set(this.asteroidTiming);
	},
	
	considerSpawningEnemyShip: function() {
		//if the player has scored enough points, no enemy ships exist, and enough time has passed, spawn an enemy ship
		if(this.score > 50 && this.getEntitiesByType(EnemyShip).length == 0 && this.enemyTimer.delta() >= 0) {
			this.spawnEnemyShip();
		}
	},
	
	spawnEnemyShip: function() {
		//spawn an enemy ship in one of the corners and reset the timer
		if(Math.random() < 0.5) {
			//25% chance of spawning on the top left corner
			if(Math.random() < 0.5)
				this.spawnEntity(EnemyShip, -50, -50);
			//25% chance of spawning on the bottom left corner
			else
				this.spawnEntity(EnemyShip, -50, ig.system.height);
		}
		else {
			//25% chance of spawning on the top right corner
			if(Math.random() < 0.5)
				this.spawnEntity(EnemyShip, ig.system.width, -50);
			//25% chance of spawning on the right
			else
				this.spawnEntity(EnemyShip, ig.system.width, ig.system.height);
		}
		this.enemyTimer.reset();
	}
});

//the canvas our game will be drawn onto, with the current game object set to an AsteroidsGame
//the canvas is 600x800, the game runs at 60fps, and it is not scaled up
ig.main('#canvas', AsteroidsGame, 60, 800, 800, 1);

});
