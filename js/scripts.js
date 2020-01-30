/* 
    TIMESWEEPER, a run through time
    7/2019

    Created and idealized by:
        - Daniel Dias Gonçalves
    
    In colaboration with:
        - 

*/


var nCols = 12;
var nRows = 13;
var pieceSize = 50;
var tickMs = 110; // 100ms per tick
var bombsClicked = 0;
var bombsToLoose = 1;
var bombsSurpassed = 0;
var mult = 1; //Score Multiplier
var score = 0;

function gameLost() {
    return bombsToLoose <= bombsClicked + bombsSurpassed;
}

var grid = [[]];
range(nCols).forEach(index => grid[0].push(newUndefinedPiece(index, true)))

var canvasHeight = pieceSize * nRows;
var canvasWidth = pieceSize * nCols;
var canvas = (() => {
    var body = document.getElementsByTagName("BODY")[0]
    var canvas = document.createElement('canvas');
    
    canvas.height = canvasHeight;
    canvas.width = canvasWidth;
    body.appendChild(canvas);

    return canvas;
})()
var ctx = canvas.getContext('2d');

/* Image Resources */

var image_1 = new Image();
image_1.src = 'resources/1.png'

var image_2 = new Image();
image_2.src = 'resources/2.png'

var image_3 = new Image();
image_3.src = 'resources/3.png'

var image_4 = new Image();
image_4.src = 'resources/4.png'

var image_5 = new Image();
image_5.src = 'resources/5.png'

var image_6 = new Image();
image_6.src = 'resources/6.png'

var image_7 = new Image();
image_7.src = 'resources/7.png'

var image_8 = new Image();
image_8.src = 'resources/8.png'

var image_white = new Image();
image_white.src = 'resources/white.png'

var image_bomb = new Image();
image_bomb.src = 'resources/bomb.png'

var image_flagged = new Image();
image_flagged.src = 'resources/flagged.png'

// When unclicked image is loaded, start game
var image_unclicked = new Image();
image_unclicked.src = 'resources/unclicked.png'
image_unclicked.onload = () => setInterval(draw, tickMs); /* 20px per second */


/* END Image Resources */

canvas.addEventListener('click', function (evt) {
    var coords = getCursorPosition(canvas, evt);
    var piece = getPieceByPosition(coords.x, coords.y);

    //console.log("type: {0}, cantBomb: {1}, cantWhite: {2}".format(piece.type, piece.cantBeBomb, piece.cantBeWhite));
    if (gameLost()){
        return;
    }
        
    if (piece && !piece.clicked && !piece.flagged) {

        piece.clicked = true;
        addToScore(piece);
        drawPiece(piece);

        if (piece.type == 'bomb')
            bombsClicked += 1;

        if (piece.type == 'white')
            revealwhiteTiles(piece);

        //if is number
        if (parseInt(piece.type) != NaN) {
            [
                { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 0, y: -1 }
            ]
                .forEach(step => {
                    var adj = getAdjacent(piece, step.x, step.y);
                    if (adj && adj.type == 'white') {
                        if (!adj.clicked) {
                            adj.clicked = true;
                            addToScore(adj);
                        }
                        revealwhiteTiles(adj);
                    }
                });
        }
    }
}, false);

canvas.addEventListener('contextmenu', function (evt) {
    // Right click won't open default menu
    evt.preventDefault();

    var coords = getCursorPosition(canvas, evt);
    var piece = getPieceByPosition(coords.x, coords.y);
    //console.log([piece, "rightClick"]);
    if (piece && !piece.clicked)
        piece.flagged = !piece.flagged;

}, false);
function addToScore(piece) {
    score += mult * piece.score;
    console.log('+' + piece.score + ' * ' + mult + ' -> Score: ' + score);
    if (!piece.score)
        console.log('bad score', piece);
}
function revealwhiteTiles(piece) {

    function checkNextPiece(nextPiece) {
        if (nextPiece && nextPiece.type != 'bomb' && nextPiece.type != 'undefined' && !nextPiece.clicked) {
            nextPiece.clicked = true;
            addToScore(nextPiece);

            if (nextPiece.type == 'white')
                revealwhiteTiles(nextPiece);
        }
    }
    [
        { x: -1, y: -1 }, { x: 0, y: -1 }, { x: 1, y: -1 },
        { x: -1, y: 0 }, { x: 1, y: 0 },
        { x: -1, y: 1 }, { x: 0, y: 1 }, { x: 1, y: 1 },
    ]
        .forEach((step) => checkNextPiece(getAdjacent(piece, step.x, step.y)));
}
function getAdjacent(piece, x, y) {
    var nextPiece;

    grid.forEach((line, lineIndex) => {
        // Get line by same Y value
        if (piece.y == line[0].y)
            // Check if adjacent line exists
            if (grid[lineIndex + y])
                // Iterate adjacent line
                grid[lineIndex + y].forEach((_piece, pieceIndex) => {
                    // Get piece by same X value
                    if (piece.x == _piece.x)
                        // Found next piece
                        nextPiece = grid[lineIndex + y][pieceIndex + x];
                });
    });

    return nextPiece || null;
}
function getCursorPosition(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    return { x: x, y: y }
}
// String.format
String.prototype.format = function () {
    a = this;
    for (k in arguments)
        a = a.replace("{" + k + "}", arguments[k])

    return a
}
function getPieceByPosition(x, y) {

    var xCorner = Math.floor(x / pieceSize);
    var piece;

    grid.forEach(line => {
        if (y >= line[0].y && y < line[0].y + pieceSize)
            piece = line[xCorner];
    })

    return piece || null;
}
function drawPiece(piece) {

    if (piece.clicked) {
        switch (piece.type) {
            case "bomb":
                ctx.drawImage(image_bomb, piece.x, piece.y, pieceSize, pieceSize);
                break;
            case "white":
                ctx.drawImage(image_white, piece.x, piece.y, pieceSize, pieceSize);
                break;
            case "1":
                ctx.drawImage(image_1, piece.x, piece.y, pieceSize, pieceSize);
                break;
            case "2":
                ctx.drawImage(image_2, piece.x, piece.y, pieceSize, pieceSize);
                break;
            case "3":
                ctx.drawImage(image_3, piece.x, piece.y, pieceSize, pieceSize);
                break;
            case "4":
                ctx.drawImage(image_4, piece.x, piece.y, pieceSize, pieceSize);
                break;
            case "5":
                ctx.drawImage(image_5, piece.x, piece.y, pieceSize, pieceSize);
                break;
            case "6":
                ctx.drawImage(image_6, piece.x, piece.y, pieceSize, pieceSize);
                break;
            case "7":
                ctx.drawImage(image_7, piece.x, piece.y, pieceSize, pieceSize);
                break;
            case "8":
                ctx.drawImage(image_8, piece.x, piece.y, pieceSize, pieceSize);
                break;
        }
    }
    else if (piece.flagged) {
        ctx.drawImage(image_flagged, piece.x, piece.y, pieceSize, pieceSize);
    }
    else {
        ctx.drawImage(image_unclicked, piece.x, piece.y, pieceSize, pieceSize);
    }

}

function addUnflaggedBombs(line) {
    line.forEach(piece => {
        if (!piece.clicked && piece.type == 'bomb' && !piece.flagged)
            bombsSurpassed++;
    })
}

function draw() {

    if (gameLost()) return;

    // Generate new line
    if (grid[0][0].y == -pieceSize) {
        generateLine();
        // This routine will reveal newly generated white tiles and numbers
        grid[1].forEach(piece => {
            if (piece.type != 'bomb' && piece.type != 'undefined' && !piece.clicked) {
                var adj = getAdjacent(piece, 0, 1);
                if (adj && adj.type == 'white' && adj.clicked) {
                    piece.clicked = true;
                    addToScore(piece);
                    revealwhiteTiles(piece);
                }
                adj = getAdjacent(piece, -1, 1);
                if (adj && adj.type == 'white' && adj.clicked && piece.type != 'white') {
                    piece.clicked = true;
                    addToScore(piece);
                }
                adj = getAdjacent(piece, 1, 1);
                if (adj && adj.type == 'white' && adj.clicked && piece.type != 'white') {
                    piece.clicked = true;
                    addToScore(piece);
                }
            }
        });
    }


    // Check if line passed the end
    if (grid[grid.length - 1][0].y > canvas.height) {

        addUnflaggedBombs(grid[grid.length - 1]);

        //Remove line
        grid.splice(grid.length - 1, 1);
    }

    // Game cycle
    grid.forEach((line, index) => {

        line.forEach(piece => {
            drawPiece(piece);
            //Lower piece by 1 px
            piece.y += 1;
        });
    });

    /*grid[0].forEach(piece => {
        drawPiece(piece);
    });*/


}

function randInt(start, end) {
    if (end == undefined)
        return randInt(0, start);
    return start + Math.floor(Math.random() * (end - start))
}
function unrandInt(start, end) {
    if (end == undefined)
        return unrandInt(0, start);

    if (end > 6)
        return unrandInt(start, 6);

    var choice;
    range(start, end).reverse().forEach((index) => {
        if (Math.random() < 0.7)
            choice = index;
    });
    return choice || start + Math.floor((end - start) / 2)

}
function range(start, end) {
    if (end == undefined)
        return range(0, start);

    var list = [];
    for (var i = start; i < end; i++)
        list.push(i);
    return list;
}
function randChoice(choiceList) {
    return choiceList[randInt(choiceList.length)];
}
function newUndefinedPiece(i, isFirstLine) {
    return {
        x: i * pieceSize,
        y: (isFirstLine ? -1 : -2) * pieceSize,
        type: 'undefined',
        clicked: false,
        cantBeBomb: false,
        cantBeWhite: false,
        flagged: false,
        score: 0
    }
}
function getPossibleBombs(x, y) {
    var possibleBombs = [];
    var plantedBombs = [];

    [
        { y: y - 1, x: x - 1 }, { y: y - 1, x: x }, { y: y - 1, x: x + 1 },
        { y: y, x: x - 1 }, { y: y, x: x + 1 },
        { y: y + 1, x: x - 1 }, { y: y + 1, x: x }, { y: y + 1, x: x + 1 },
    ]
        .forEach((coord, index) => {
            if (grid[coord.y] && grid[coord.y][coord.x]) {

                var piece = grid[coord.y][coord.x];

                //First game row cant have bombs
                if (coord.y == grid.length - 1) {

                }
                // Can be planted
                else if (piece.type == 'undefined' && !piece.cantBeBomb) {
                    possibleBombs.push(coord);

                }
                // Already planted
                else if (piece.type == 'bomb') {
                    plantedBombs.push(coord);
                }
            }
        });

    return { possibleBombs: possibleBombs, plantedBombs: plantedBombs }
}
function getRandomBombChoice(amount, bombChoices) {
    var chosenBombs = []
    range(amount).forEach(i => {
        var randomNumber = randInt(amount - i);
        chosenBombs.push(bombChoices[randomNumber])
        bombChoices.splice(randomNumber, 1);
    });
    return chosenBombs;
}
function setBombsWithWhiteRule(choices) {

    choices.forEach(coord => {
        grid[coord.y][coord.x].type = 'bomb';
        grid[coord.y][coord.x].score = 2;

        [
            { y: coord.y - 1, x: coord.x - 1 }, { y: coord.y - 1, x: coord.x + 1 },
            { y: coord.y - 1, x: coord.x },
            { y: coord.y, x: coord.x - 1 }, { y: coord.y, x: coord.x + 1 },
            { y: coord.y + 1, x: coord.x }
        ]
            .forEach(coord2 => {
                if (grid[coord2.y] && grid[coord2.y][coord2.x]) {
                    grid[coord2.y][coord2.x].cantBeWhite = true;
                }
            })
    });
}
function changeInvalidWhites(choices) {
    choices.forEach(bomb => {
        var adj;
        adj = getAdjacent(bomb, 1, 1);
        if (adj && adj.type == 'white')
            generateNumberPiece(adj.x, adj.y);

        adj = getAdjacent(bomb, -1, 1);
        if (adj && adj.type == 'white')
            generateNumberPiece(adj.x, adj.y);
    });
}
function generateNumberPiece(x, y) {
    var bombInfo = getPossibleBombs(x, y);
    if (bombInfo.possibleBombs.length + bombInfo.plantedBombs.length == 0)
        return 0;
    var minBombs = bombInfo.plantedBombs.length;
    var numberChosen = unrandInt(minBombs, minBombs + bombInfo.possibleBombs.length + 1);

    var choices = getRandomBombChoice(numberChosen - minBombs, bombInfo.possibleBombs);
    // Set bombs and set adjacent tiles as 'cant be white'
    setBombsWithWhiteRule(choices);

    bombInfo.possibleBombs.forEach(coord => grid[coord.y][coord.x].cantBeBomb = true);
    // Set piece as number
    grid[y][x].type = '{0}'.format(numberChosen);
    grid[y][x].score = numberChosen;

    return numberChosen;
}
function setSurroundingWhiteRule(piece, y) {
    var x = piece.x / pieceSize;
    [
        { y: y - 1, x: x - 1 }, { y: y - 1, x: x }, { y: y - 1, x: x + 1 },
        { y: y, x: x - 1 }, { y: y, x: x + 1 },
        { y: y + 1, x: x },
    ]
        .forEach((_piece, i) => {
            if (grid[_piece.y] && grid[_piece.y][_piece.x]) {
                grid[_piece.y][_piece.x].cantBeBomb = true;
            }
        })
}
// Set rule on newline that was not generated at the time
function setMissingWhiteBombRule(piece, y) {
    var x = piece.x / pieceSize;
    if (piece.type == 'bomb') {
        [
            { y: y - 1, x: x - 1 }, { y: y - 1, x: x + 1 },
            { y: y - 1, x: x }
        ].forEach(piece2 => {
            if (grid[piece2.y] && grid[piece2.y][piece2.x]) {
                grid[piece2.y][piece2.x].cantBeWhite = true;
            }
        })
    }
}
function generateLine() {

    // Fill new line with undefined pieces
    var newLine = [];
    range(nCols).forEach(index => newLine.push(newUndefinedPiece(index)));
    // Add new line
    grid.splice(0, 0, newLine);

    var curLine = grid[1];
    curLine.forEach(piece => {
        setMissingWhiteBombRule(piece, 1);
    });

    //Calculate empty cluster spaces
    range(nCols).forEach(x => {
        // If not a bomb
        if (curLine[x].type == 'undefined') {
            // Has to be a number
            if (curLine[x].cantBeWhite) {
                generateNumberPiece(x, 1);
            }
            // Can be any piece
            else {
                var adj1 = getAdjacent(curLine[x], 1, -1);
                var adj2 = getAdjacent(curLine[x], -1, -1);

                if (adj1 && adj1.type == 'bomb' || adj2 && adj2.type == 'bomb') {
                    generateNumberPiece(x, 1);
                }
                else if (randInt(100) < 25 && generateNumberPiece(x, 1) != 0) {
                    //Try to generate number here
                }
                else {
                    // Must try cantBeBomb on 3 pieces on top
                    curLine[x].type = 'white';
                    curLine[x].score = 1
                    grid[0][x].cantBeBomb = true;
                    setSurroundingWhiteRule(curLine[x], 1);
                }
            }
        }
    });
}





