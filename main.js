document.addEventListener("DOMContentLoaded", startGame);

var myGameArea;
var myGamePiece;
var myObstacles = [];
var myscore;
var musicOn = false;

window.addEventListener('click', function(event) {
    if (musicOn === false) {
        musicOn = true;
        // noinspection JSUnresolvedVariable
        let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        let xhr = new XMLHttpRequest();
        xhr.open('GET', './music.mp3');
        xhr.responseType = 'arraybuffer';
        xhr.addEventListener('load', () => {
            let playsound = (audioBuffer) => {
                let source = audioCtx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioCtx.destination);
                source.loop = false;
                source.start();
            };

            audioCtx.decodeAudioData(xhr.response).then(playsound);
        });
        xhr.send();
    }
}, false);

function restartGame() {
    document.getElementById("myfilter").style.display = "none";
    document.getElementById("myrestartbutton").style.display = "none";
    myGameArea.stop();
    myGameArea.clear();
    myGameArea = {};
    myGamePiece = {};
    myObstacles = [];
    myscore = {};
    document.getElementById("canvascontainer").innerHTML = "";
    startGame()
}

function startGame() {
    let gameWidth = ((window.innerWidth > 0) ? window.innerWidth : screen.width) - 20;
    let gameHeight = ((window.innerHeight > 0) ? window.innerHeight : screen.height) - 20;
    myGameArea = new gamearea(gameWidth, gameHeight);
    let myGamePieceWidth = 120;
    let myGamePieceHeight = 120;
    // myGamePiece = new component(myGamePieceWidth, myGamePieceHeight, "red", gameWidth/2 - myGamePieceWidth/2, gameHeight - myGamePieceHeight - 20);
    myGamePiece = new component(myGamePieceWidth, myGamePieceHeight, "vika_ok.jpg", gameWidth/2 - myGamePieceWidth/2, gameHeight - myGamePieceHeight - 20,'image');

    myscore = new component("15px", "Consolas", "black", gameWidth-100, 25, "text");
    myGameArea.start();
}

function gamearea(width = 320, height = 180) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = width;
    this.canvas.height = height;
    document.getElementById("canvascontainer").appendChild(this.canvas);
    this.context = this.canvas.getContext("2d");
    this.pause = false;
    this.frameNo = 0;
    this.start = function() {
        myGamePiece.update();
        this.interval = setInterval(updateGameArea, 20);
    }
    this.stop = function() {
        clearInterval(this.interval);
        this.pause = true;
    }
    this.clear = function(){
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    let leftTapHandler = new component(this.canvas.width/2, this.canvas.height, "transparent", 0, 0);
    let rightTapHandler = new component(this.canvas.width/2, this.canvas.height, "transparent", this.canvas.width/2, 0);

    this.canvas.addEventListener('touchstart', function(event) {
        var x = event.touches[0].clientX - this.offsetLeft,
            y = event.touches[0].clientX - this.offsetTop;

        if (y > leftTapHandler.y &&
            y < leftTapHandler.y + leftTapHandler.height &&
            x > leftTapHandler.x &&
            x < leftTapHandler.x + leftTapHandler.width
        ) {
            moveleft();
        } else {
            if (y > rightTapHandler.y &&
                y < rightTapHandler.y + rightTapHandler.height &&
                x > rightTapHandler.x &&
                x < rightTapHandler.x + rightTapHandler.width
            ) {
                moveright();
            }
        }

    }, false);
    this.canvas.addEventListener('touchend', function(event) {
        clearmove();
    }, false);


    this.canvas.addEventListener('mousedown', function(event) {
        var x = event.pageX - this.offsetLeft,
            y = event.pageY - this.offsetTop;

        if (y > leftTapHandler.y &&
            y < leftTapHandler.y + leftTapHandler.height &&
            x > leftTapHandler.x &&
            x < leftTapHandler.x + leftTapHandler.width
        ) {
            moveleft();
        } else {
            if (y > rightTapHandler.y &&
                y < rightTapHandler.y + rightTapHandler.height &&
                x > rightTapHandler.x &&
                x < rightTapHandler.x + rightTapHandler.width
            ) {
                moveright();
            }
        }

    }, false);
    this.canvas.addEventListener('mouseup', function(event) {
        clearmove();
    }, false);
}

function component(width, height, color, x, y, type) {

    this.type = type;
    if (type == "text") {
        this.text = color;
    } else if (type == "image") {
        this.imgSrc = color;
        this.img = new Image();
        this.img.src = this.imgSrc;
        this.img.onload = () => {
            this.update();
        };
    }
    this.score = 0;    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.speedY = 0;
    this.x = x;
    this.y = y;

    this.update = function() {
        ctx = myGameArea.context;
        if (this.type == "text") {
            ctx.font = this.width + " " + this.height;
            ctx.fillStyle = color;
            ctx.fillText(this.text, this.x, this.y);
        } else if (this.type === "image") {
            ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
        } else {
            ctx.fillStyle = color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
    this.crashWith = function(otherobj) {
        var myleft = this.x;
        var myright = this.x + (this.width);
        var mytop = this.y;
        var mybottom = this.y + (this.height);
        var otherleft = otherobj.x;
        var otherright = otherobj.x + (otherobj.width);
        var othertop = otherobj.y;
        var otherbottom = otherobj.y + (otherobj.height);
        var crash = true;
        if ((mybottom < othertop) || (mytop > otherbottom) || (myright < otherleft) || (myleft > otherright)) {
            crash = false;
        }
        return crash;
    }
}

function updateGameArea() {
    var x, y, min, max, height, gap;
    for (i = 0; i < myObstacles.length; i += 1) {
        if (myGamePiece.crashWith(myObstacles[i])) {
            myGamePiece.img.src = 'vika_neok.jpg';
            myGameArea.stop();
            document.getElementById("myfilter").style.display = "block";
            document.getElementById("myrestartbutton").style.display = "block";
            return;
        }
    }
    if (myGameArea.pause == false) {
        myGameArea.clear();
        myGameArea.frameNo += 1;
        myscore.score +=1;
        if (myGameArea.frameNo == 1 || everyinterval(80)) {
            x = myGameArea.canvas.width;
            y = myGameArea.canvas.height;

            minGap = myGamePiece.width + 20;
            maxGap = myGamePiece.width * 2;
            gap = Math.floor(Math.random()*(maxGap-minGap+1)+minGap);

            min = 20;
            max = x - maxGap - min ;
            width = Math.floor(Math.random()*(max-min+1)+min);

            let colors = ['LightGreen', 'Yellow', 'SeaGreen', 'DeepPink', 'CadetBlue', 'Plum'];
            let colorNumber = Math.floor(Math.random() * (7) + 0);
            myObstacles.push(new component(width, 30, colors[colorNumber], 0, 0));
            colorNumber = Math.floor(Math.random() * (7) + 0)
            myObstacles.push(new component(x - width - gap, 30, colors[colorNumber], width + gap, 0));
        }
        for (i = 0; i < myObstacles.length; i += 1) {
            myObstacles[i].y += 3;
            myObstacles[i].update();
        }
        myscore.text="SCORE: " + myscore.score;
        myscore.update();
        let newX = myGamePiece.x + myGamePiece.speedX;
        if (newX > 0 && newX < myGameArea.canvas.width - myGamePiece.width) {
            myGamePiece.x = newX;
        }

        myGamePiece.update();
    }
}

function everyinterval(n) {
    if ((myGameArea.frameNo / n) % 1 == 0) {return true;}
    return false;
}

function moveup(e) {
    myGamePiece.speedY = -1;
}

function movedown() {
    myGamePiece.speedY = 1;
}

function moveleft() {
    myGamePiece.speedX = -2;
}

function moveright() {
    myGamePiece.speedX = 2;
}

function clearmove(e) {
    myGamePiece.speedX = 0;
    myGamePiece.speedY = 0;
}

