

// SELECT CVS
const cvs = document.getElementById("bird");
const ctx = cvs.getContext("2d");

// GAME VARS AND CONSTS
let frames = 0;
const DEGREE = Math.PI/180;
const FPS = 90;
let then = Date.now();
const interval = 1000 / FPS;

// LOAD SPRITE IMAGE
const sprite = new Image();
sprite.src = "img/SpriteMid.png";

// LOAD SOUNDS
const SCORE_S = new Audio();
SCORE_S.src = "audio/sfx_point.wav";

const FLAP = new Audio();
FLAP.src = "audio/sfx_flap.wav";

const HIT = new Audio();
HIT.src = "audio/sfx_hit.wav";

const SWOOSHING = new Audio();
SWOOSHING.src = "audio/sfx_swooshing.wav";

const DIE = new Audio();
DIE.src = "audio/sfx_die.wav";

// GAME STATE
const state = {
    current : 0,
    getReady : 0,
    game : 1,
    over : 2
}

// START BUTTON COORD
const startBtn = {
    x : 0,
    y : 150,
    w : 900,
    h : 400
}

// CONTROL THE GAME
cvs.addEventListener("click", function(evt){
    switch(state.current){
        case state.getReady:
            state.current = state.game;
            SWOOSHING.play();
            break;
        case state.game:
            if(bird.y - bird.radius <= 0) return;
            bird.flap();
            FLAP.play();
            break;
        case state.over:
            let rect = cvs.getBoundingClientRect();
            let clickX = evt.clientX - rect.left;
            let clickY = evt.clientY - rect.top;
            
            // CHECK IF WE CLICK ON THE START BUTTON
            if(clickX >= startBtn.x && clickX <= startBtn.x + startBtn.w && clickY >= startBtn.y && clickY <= startBtn.y + startBtn.h){
                pipes.reset();
                bird.speedReset();
                score.reset();
                state.current = state.getReady;
            }
            break;
    }
});

document.addEventListener("keydown", function(evt){
    if(evt.code === "Space") {
        // Prevent spacebar from scrolling the page
        evt.preventDefault();
        
        switch(state.current){
            case state.getReady:
                state.current = state.game;
                SWOOSHING.play();
                break;
            case state.game:
                if(bird.y - bird.radius <= 0) return;
                bird.flap();
                FLAP.play();
                break;
            case state.over:
                // For spacebar, restart the game directly without button check
                pipes.reset();
                bird.speedReset();
                score.reset();
                state.current = state.getReady;
                break;
        }
    }
});


// BACKGROUND
const bg = {
    sX :2,
    sY : 0,
    w : 558,
    h : 464,
    x : 0,
    y : cvs.height - 464,
    
    draw : function(){
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);
    }
    
}

// FOREGROUND
const fg = {
    sX: 564,
    sY: 2,
    w: 450,
    h: 228,
    x: 0,
    y: cvs.height - 228,
    
    dx : 2,
    
    draw : function(){
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w - 2, this.y, this.w, this.h);  
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w + this.w -4, this.y, this.w, this.h);      
    },
    
    update: function(){
        if(state.current == state.game){
            this.x = (this.x - this.dx)%(this.w);
        }
    }
}

// BIRD
const bird = {
    animation : [
        {sX: 566, sY : 232},
        {sX: 566, sY : 302},
        {sX: 566, sY : 310},
        {sX: 566, sY : 302}
    ],
    x : 100,
    y : 300,
    w : 76,
    h : 60,
    
    radius : 24,
    
    frame : 0,
    
    gravity : 0.3,
    jump : 6,
    speed : 0,
    rotation : 0,
    
    draw : function(){
        let bird = this.animation[this.frame];
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.drawImage(sprite, bird.sX, bird.sY, this.w, this.h,- this.w/2, - this.h/2, this.w, this.h);
        
        ctx.restore();
    },
    
    flap : function(){
        this.speed = - this.jump;
        this.rotation = -25 * DEGREE;  // Quick upward tilt on flap

    },
    
    update: function(){
        // IF THE GAME STATE IS GET READY STATE, THE BIRD MUST FLAP SLOWLY
        this.period = state.current == state.getReady ? 10 : 5;
        // WE INCREMENT THE FRAME BY 1, EACH PERIOD
        this.frame += frames%this.period == 0 ? 1 : 0;
        // FRAME GOES FROM 0 To 4, THEN AGAIN TO 0
        this.frame = this.frame%this.animation.length;
        
        if(state.current == state.getReady){
            this.y = 150; // RESET POSITION OF THE BIRD AFTER GAME OVER
            this.rotation = 0 * DEGREE;
        }else{
            this.speed += this.gravity;
            this.y += this.speed;
            
            if(this.y + this.h/2 >= cvs.height - fg.h){
                this.y = cvs.height - fg.h - this.h/2;
                if(state.current == state.game){
                    state.current = state.over;
                    DIE.play();
                }
            }
            
            // IF THE SPEED IS GREATER THAN THE JUMP MEANS THE BIRD IS FALLING DOWN
            this.rotation = Math.min((this.speed / 10) * 90 * DEGREE, 90 * DEGREE);

        }
        
    },
    speedReset : function(){
        this.speed = 0;
    }
}

// GET READY MESSAGE
const getReady = {
    sX : 1,
    sY : 486,
    w : 344,
    h : 572,
    x : cvs.width/2 - 173,
    y : 160,
    
    draw: function(){
        if(state.current == state.getReady){
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        }
    }
    
}

// GAME OVER MESSAGE
const gameOver = {
    sX : 350,
    sY : 486,
    w : 806,
    h : 898,
    x : cvs.width/2 - 225,
    y : 180,
    
    draw: function(){
        if(state.current == state.over){
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);   
        }
    }
    
}

const gameTrophy = {
    bronze: {
        sX: 758,
        sY: 327,
    },
    silver: {
        sX: 758,
        sY: 233,
        
    },
    gold: {
        sX: 758,
        sY: 139,
    },
    platinum: {
        sX: 758,
        sY: 45,
    },
    w : 88,
    h : 86,
    x : cvs.width/2 - 175,
    y : 356,
    
    draw: function(){
        if(state.current == state.over && score.value >= 5 && score.value < 10){
            ctx.drawImage(sprite, this.bronze.sX, this.bronze.sY, this.w, this.h, this.x, this.y, this.w, this.h);   
        }
        if(state.current == state.over && score.value >= 10 && score.value < 20){
            ctx.drawImage(sprite, this.silver.sX, this.silver.sY, this.w, this.h, this.x, this.y, this.w, this.h);   
        }
        if(state.current == state.over && score.value >= 20 && score.value < 50){
            ctx.drawImage(sprite, this.gold.sX, this.gold.sY, this.w, this.h, this.x, this.y, this.w, this.h);   
        }
        if(state.current == state.over && score.value >= 50){
            ctx.drawImage(sprite, this.platinum.sX, this.platinum.sY, this.w, this.h, this.x, this.y, this.w, this.h);   
        }
    }
    
}

// PIPES
const pipes = {
    position : [],
    
    top : {
        sX : 1118,
        sY : 0
    },
    bottom:{
        sX : 1018,
        sY : 0
    },
    
    w : 106,
    h : 800,
    gap : 140,
    maxYPos : -300,
    dx : 4,
    
    draw : function(){
        for(let i  = 0; i < this.position.length; i++){
            let p = this.position[i];
            
            let topYPos = p.y;
            let bottomYPos = p.y + this.h + this.gap;
            
            // top pipe
            ctx.drawImage(sprite, this.top.sX, this.top.sY + 60, this.w, this.h, p.x, topYPos, this.w, this.h);  
            
            // bottom pipe
            ctx.drawImage(sprite, this.bottom.sX, this.bottom.sY, this.w, this.h, p.x, bottomYPos, this.w, this.h);  
        }
    },
    
    update: function(){
        if(state.current !== state.game) return;
        
        if(frames%100 == 0){
            this.position.push({
                x : cvs.width,
                y : this.maxYPos * ( Math.random() + 1)
            });
        }
        for(let i = 0; i < this.position.length; i++){
            let p = this.position[i];
            
            let bottomPipeYPos = p.y + this.h + this.gap;
            
            // COLLISION DETECTION
            // TOP PIPE
            if(bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w && bird.y + bird.radius > p.y && bird.y - bird.radius < p.y + this.h){
                state.current = state.over;
                HIT.play();
            }
            // BOTTOM PIPE
            if(bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w && bird.y + bird.radius > bottomPipeYPos && bird.y - bird.radius < bottomPipeYPos + this.h){
                state.current = state.over;
                HIT.play();
            }
            
            // MOVE THE PIPES TO THE LEFT
            p.x -= this.dx;
            
            // if the pipes go beyond canvas, we delete them from the array
            if(p.x + this.w <= 0){
                this.position.shift();
                score.value += 1;
                SCORE_S.play();
                score.best = Math.max(score.value, score.best);
                localStorage.setItem("best", score.best);
            }
        }
    },
    
    reset : function(){
        this.position = [];
    }
    
}

// SCORE
const score= {
    best : parseInt(localStorage.getItem("best")) || 0,
    value : 0,
    
    draw : function(){
        ctx.fillStyle = "#FFF";
        ctx.strokeStyle = "#000";
        
        if(state.current == state.game){
            ctx.lineWidth = 2;
            ctx.font = "35px Teko";
            ctx.fillText(this.value, cvs.width/2, 100);
            ctx.strokeText(this.value, cvs.width/2, 100);
            
        }else if(state.current == state.over){
            // SCORE VALUE
            ctx.font = "50px Teko";
            ctx.fillText(this.value, 450, 372);
            ctx.strokeText(this.value, 450, 372);
            // BEST SCORE
            ctx.fillText(this.best, 450, 456);
            ctx.strokeText(this.best, 450, 456);
        }
    },
    
    reset : function(){
        this.value = 0;
    }
}

// DRAW
function draw(){
    ctx.fillStyle = "#ffccaa";
    ctx.fillRect(0, 0, cvs.width, cvs.height);
    
    bg.draw();
    pipes.draw();
    fg.draw();
    bird.draw();
    getReady.draw();
    gameOver.draw();
    score.draw();
    gameTrophy.draw();
}

// UPDATE
function update(){
    bird.update();
    fg.update();
    pipes.update();
}

// LOOP
function loop() {
    requestAnimationFrame(loop);
    
    const now = Date.now();
    const delta = now - then;
    
    if (delta > interval) {
        then = now - (delta % interval);
        
        update();
        draw();
        frames++;
    }
}
loop();