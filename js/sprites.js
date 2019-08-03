/* Image Resources */
function newImg(src){
    var image = new Image();
    image.src = src;

    return image;
}

function newImgOnload(src){
    var image = new Image();
    image.onload = () => setInterval(draw, tickMs);
    image.src = src;

    return image;
}

img = {
    '1' : newImg('resources/1.png'),
    '2' : newImg('resources/3.png'),
    '3' : newImg('resources/3.png'),
    '4' : newImg('resources/4.png'),
    '5' : newImg('resources/5.png'),
    '6' : newImg('resources/6.png'),
    '7' : newImg('resources/7.png'),
    'white' : newImg('resources/white.png'),
    'bomb' : newImg('resources/bomb.png'),
    'flagged' : newImg('resources/flagged.png'),
    'unclicked' : newImgOnload('resources/unclicked.png'),
    'emoji' : newImg('resources/emoji-happy.png')
}

