var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

const Direction = {
    NONE: 0,
    UP: 1,
    DOWN: 2
};

const Ball = {
    new: function () {
        return {
            radius: 8,
            xvel: -4,
            yvel: 0,
            xpos: canvas.width / 2,
            ypos: canvas.height / 2
        }
    }
};

const Paddle = {
    new: function () {
        return {
            w: 10,
            h: 50,
            yvel: 4,
            ydir: Direction.NONE,
            xpos: 0,
            ypos: ((canvas.height / 2))
        }
    }
};

const Game = {
    play: true,
    score_count: [0, 0],
    init: function () {
        // Initialize Game Components
        this.build();
        // Start Listener
        document.addEventListener('keydown', (key) => {
            if (key.code === "ArrowUp") {
                this.p1paddle.ydir = Direction.UP;
            }

            if (key.code === "ArrowDown") {
                this.p1paddle.ydir = Direction.DOWN;
            }
        })

        document.addEventListener('keyup', (key) => {
            this.p1paddle.ydir = Direction.NONE;
        })
        if (this.play) {
            window.requestAnimationFrame(Game.update)
        }
    },
    build: function(){
        this.ball = Ball.new();
        this.p1paddle = Paddle.new();
        this.p2paddle = Paddle.new();
        this.p1paddle.ypos = (canvas.height / 2) - (this.p1paddle.h / 2);
        this.p2paddle.ypos = (canvas.height / 2) - (this.p2paddle.h / 2);
        this.p1paddle.xpos = 20;
        this.p2paddle.xpos = canvas.width - this.p2paddle.w - 20;
        this.p2paddle.yvel = this.p2paddle.yvel - 1;
    },
    update: function () {
        Game.update_phys();
        Game.update_draw();
        if (Game.play) {
            window.requestAnimationFrame(Game.update)
        }

    },
    update_draw: function () {
        // Draw Background
        ctx.beginPath();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#a1aac2";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.closePath();
        ctx.beginPath();
        // Draw ball
        ctx.arc(this.ball.xpos, this.ball.ypos, this.ball.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = "#3d4f92";
        ctx.fill();
        ctx.closePath();
        ctx.beginPath();
        // Draw Paddles
        ctx.rect(this.p1paddle.xpos, this.p1paddle.ypos, this.p1paddle.w, this.p1paddle.h)
        ctx.rect(this.p2paddle.xpos, this.p2paddle.ypos, this.p2paddle.w, this.p2paddle.h)
        ctx.fillStyle = "#616d91";
        ctx.fill();
        ctx.closePath();
        // Draw Scores
        ctx.beginPath()
        ctx.font = "30px Arial";
        ctx.fillText(this.score_count[0].toString(), 10, 30);
        ctx.fillText(this.score_count[1].toString(), canvas.width-30, 30);
        ctx.closePath()
    },
    update_phys: function () {
        // Paddle 1 Movement
        if (this.p1paddle.ydir !== Direction.NONE) {
            if (this.p1paddle.ydir === Direction.UP && this.p1paddle.ypos > 0) {
                this.p1paddle.ypos = this.p1paddle.ypos - this.p1paddle.yvel;
            }
            if (this.p1paddle.ydir === Direction.DOWN && (this.p1paddle.ypos + this.p1paddle.h) < canvas.height) {
                this.p1paddle.ypos = this.p1paddle.ypos + this.p1paddle.yvel;
            }
        }

        // Paddle 2 Movement
        if(this.ball.xvel > 0 && this.ball.xpos > canvas.width/2){
            if(this.ball.ypos < this.p2paddle.ypos + (this.p2paddle.h/2)){
                // Move Paddle Up
                this.p2paddle.ypos = this.p2paddle.ypos - (this.p2paddle.yvel);
            }
            if(this.ball.ypos > this.p2paddle.ypos + (this.p2paddle.h/2)){
                // Move Paddle Down
                this.p2paddle.ypos = this.p2paddle.ypos + (this.p2paddle.yvel);
            }
        }

        // Ball Movement
        this.ball.xpos = this.ball.xpos + this.ball.xvel;
        this.ball.ypos = this.ball.ypos + this.ball.yvel;

        // Ball Collision
        let balltop = [this.ball.xpos, this.ball.ypos - this.ball.radius];
        let ballbottom = [this.ball.xpos, this.ball.ypos + this.ball.radius];
        let ballleft = [this.ball.xpos - this.ball.radius, this.ball.ypos];
        let ballright = [this.ball.xpos + this.ball.radius, this.ball.ypos];

        // Paddle 1 Bounce
        if(ballleft[0] > this.p1paddle.xpos && ballleft[0] < this.p1paddle.xpos + this.p1paddle.w){
            if(balltop[1] < this.p1paddle.ypos + this.p1paddle.h && ballbottom[1] > this.p1paddle.ypos){
                let ydif = this.ball.ypos - this.p1paddle.ypos - (this.p1paddle.h/2);
                ydif = ydif/25;
                this.ball.xvel = Math.abs(this.ball.xvel);
                if (ydif >= -0.2 && ydif <= 0.2){
                    this.ball.xvel = this.ball.xvel + 1;
                }
                this.ball.yvel = 2*Math.sin(ydif);
            }
        }

        // Paddle 2 Bounce
        if(ballright[0] > this.p2paddle.xpos && ballright[0] < this.p2paddle.xpos + this.p2paddle.w){
            if(balltop[1] < this.p2paddle.ypos + this.p2paddle.h && ballbottom[1] > this.p2paddle.ypos){
                this.ball.xvel = this.ball.xvel * -1;
            }
        }

        // Top Bounce
        if(balltop[1] <= 0){
            this.ball.yvel = this.ball.yvel * -1;
        }

        // Bottom Bounce
        if(ballbottom[1] >= canvas.height){
            this.ball.yvel = this.ball.yvel * -1;
        }

        // Score Check
        // Left Side
        if(ballleft[0] <= 0){
            this.score(1);
        }
        // Right Side
        if(ballright[0] >= canvas.width){
            this.score(0);
        }

    },
    reset: function(){
        this.build();
    },

    score: function(player) {
        this.score_count[player] = this.score_count[player] + 1;
        let winner;
        if (this.score_count[0] === 3 || this.score_count[1] === 3) {
            if (this.score_count[0] === 3) {
                winner = 1;
            } else {
                winner = 2;
            }
            game.play = false;
            ctx.beginPath()
            ctx.font = "30px Arial";
            ctx.fillText("Player " + winner + " Wins!", canvas.width, canvas.height / 2);
            console.log("Player " + winner + " Wins!");
            ctx.closePath()
        } else {
            this.reset();
        }
    }

};

let game = Game;
game.init();
