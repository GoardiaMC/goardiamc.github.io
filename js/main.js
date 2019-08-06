/* 
  TIMESWEEPER, a run through time
  7/2019

  Created and idealized by:
      - Daniel Dias Gonçalves
  
  In colaboration with:
      - 
*/


var nCols = 10;
var nRows = 14;
var pieceSize = 50;
var tickMs = 60; // 100ms per tick
var bombsClicked = 0;
var bombsToLoose = 1;
var bombsSurpassed = 0;
var mult = 1; //Score Multiplier
var score = 0;

var screen = {
    'height': window.innerHeight,
    'width': window.innerWidth,
    'heightOffset': 0
};

var canvas = (() => {
    var canvas = document.createElement('canvas');

    if (screen.width > screen.height)
        pieceSize = Math.floor(screen.height * 0.8 / nRows);
    else
        pieceSize = Math.floor(screen.width / nCols);

    screen.heightOffset = screen.height - Math.floor(screen.height * 0.8 / nRows) * nRows

    canvas.height = screen.height;
    canvas.width = screen.width;

    document.body.appendChild(canvas);

    return canvas;
})()

var grid = [[]];
range(nCols).forEach(index => grid[0].push(newUndefinedPiece(index, true)))

var ctx = canvas.getContext('2d');

/* END Image Resources */

canvas.addEventListener('click', function (evt) {
    var coords = getCursorPosition(canvas, evt);
    var piece = getPieceByPosition(coords.x, coords.y);

    if (gameLost()) {
        return;
    }

    if (piece && !piece.clicked && !piece.flagged) {

        piece.clicked = true;
        addToScore(piece);
        drawPiece(piece);
        drawHeader();

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

    if (piece && !piece.clicked)
        piece.flagged = !piece.flagged;

}, false);
function gameLost() {
    return bombsToLoose <= bombsClicked + bombsSurpassed;
}
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

    if (y < screen.heightOffset) {
        return null;
    }

    grid.forEach(line => {
        if (y >= line[0].y + screen.heightOffset && y < line[0].y + pieceSize + screen.heightOffset)
            piece = line[xCorner];
    })

    return piece || null;
}
function drawPiece(piece) {

    var boardY = piece.y + screen.heightOffset;

    if (piece.clicked) {
        ctx.drawImage(img[piece.type], piece.x, boardY, pieceSize, pieceSize);
    }
    else if (piece.flagged) {
        ctx.drawImage(img.flagged, piece.x, boardY, pieceSize, pieceSize);
    }
    else {
        ctx.drawImage(img.unclicked, piece.x, boardY, pieceSize, pieceSize);
    }
}

function addUnflaggedBombs(line) {
    line.forEach(piece => {
        if (!piece.clicked && piece.type == 'bomb' && !piece.flagged)
            bombsSurpassed++;
    })
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
                else if (randInt(100) < 50 && generateNumberPiece(x, 1) != 0) {
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
function drawHeader() {
    ctx.fillStyle = 'rgb(179, 255, 255)';
    ctx.fillRect(0, 0, pieceSize * nCols, screen.heightOffset);

    var emoji_corner = Math.floor(screen.heightOffset / 2);
    ctx.drawImage(img.emoji, Math.floor(pieceSize * nCols / 2) - emoji_corner / 2, emoji_corner / 2, emoji_corner, emoji_corner);
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
    if (grid[grid.length - 1][0].y > pieceSize * nRows) {

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

    //ctx.clearRect(0, 0, pieceSize*nCols, screen.heightOffset);
    drawHeader();
}
