/* eslint import/no-cycle: [2, { ignoreExternal: true }] */
import * as edsLIB from './edsLIB';
import * as flocking from './flocking';

let canvas;
let ctx;

let canvasHidden;
let ctxHidden;
let newImage;

let width = 640;// canvas height and width
let height = 480;

let basetime = Date.now();
const fpsCap = 1000 / 60;// denominator is fps

const play = true;

let ranAI = false;

const stars = [];
let starsinMap = [];
let starsNotInMap = [];

let picEdge = [];

let starCount = 25;
let staticFlockQty = 79;

let timer = 0;
let switchtime = 6;

let opacity = 0.5;
let flockPerStar = 10;

const rainbow = [
  [110, 64, 170], [143, 61, 178], [178, 60, 178], [210, 62, 167],
  [238, 67, 149], [255, 78, 125], [255, 94, 99], [255, 115, 75],
  [255, 140, 56], [239, 167, 47], [217, 194, 49], [194, 219, 64],
  [175, 240, 91], [135, 245, 87], [96, 247, 96], [64, 243, 115],
  [40, 234, 141], [28, 219, 169], [26, 199, 194], [33, 176, 213],
  [47, 150, 224], [65, 125, 224], [84, 101, 214], [99, 81, 195],
];

async function loadBodyPix() {
  const img = document.getElementById('output');
  const net = await window.bodyPix.load();

  const segmentation = await net.estimatePartSegmentation(img);
  console.log(segmentation);

  // the colored part image is an rgb image with a
  // corresponding color from thee rainbow colors for
  // each part at each pixel, and white pixels where there is no part.
  const coloredPartImage = window.bodyPix.toColoredPartImageData(segmentation, rainbow);
  width = coloredPartImage.width;
  height = coloredPartImage.height;
  const opacityPix = 1;
  const flipHorizontal = false;
  const maskBlurAmount = 0;
  const pixelCellWidth = 1.0;
  const tempcanvas = document.getElementById('hiddencanvas');
  // draw the pixelated colored part image on top
  // of the original image onto a canvas.  Each pixel
  // cell's width will be set to 10 px. The pixelated colored
  // part image will be drawn semi-transparent, with an
  // of 0.7, allowing for the original image to be visible under.
  window.bodyPix.drawMask(
    tempcanvas,
    img,
    coloredPartImage,
    opacityPix,
    maskBlurAmount,
    flipHorizontal,
    pixelCellWidth,
  );
}

function initStars() {
  for (let i = 0; i < starCount; i++) {
    stars[i] = edsLIB.drawRandomCircle(ctx, width, height, 2, 'white', 0, 'white');
    stars[i].inMap = false;
  }
}

function initFlock() {
  for (let s = 0; s < stars.length; s++) {
    const flock = [];
    for (let i = 0; i < flockPerStar; i++) {
      // set up info
      const pos = new edsLIB.Vector2(stars[s].x
        + edsLIB.getRandomInt(-10, 10), stars[s].y
        + edsLIB.getRandomInt(-10, 10));
      const vel = new edsLIB.Vector2(edsLIB.getRandomInt(-1, 1), edsLIB.getRandomInt(-1, 1));
      const acc = new edsLIB.Vector2(0, 0);

      flock[i] = new flocking.Boid(pos, vel, acc);
    }
    stars[s].flock = flock;

    const staticflock = [];
    const pos = new edsLIB.Vector2(0, 0);
    const vel = new edsLIB.Vector2(0, 0);
    const acc = new edsLIB.Vector2(0, 0);

    staticflock[0] = new flocking.Boid(pos, vel, acc);

    // create static flock
    stars[s].staticflock = staticflock;
  }
  starsinMap = stars;
}

// core drive functions aka update/draw
function update() {
  const now = Date.now();
  const check = now - basetime;
  if (check / fpsCap >= 1) {
    basetime = now;
    if (play) {
      if (newImage != null) {
        ctx.drawImage(newImage, 0, 0, width, height);
      }
      edsLIB.cls(ctx, width, height);
      edsLIB.draw(ctx, starsinMap, width, height, staticFlockQty, opacity);
      timer++;
    }
    if (timer >= switchtime && ranAI) {
      timer = 0;
      edsLIB.switchFlock(starsinMap);
    }
  }
  window.requestAnimationFrame(update);
}

function myTimer() {
  edsLIB.switchFlock(starsinMap);
}

function createStandingFlock() {
  for (let i = 0; i < starsinMap.length; i++) {
    starsinMap[i].staticflock.splice(1, starsinMap[i].staticflock.length);
  }
  for (let i = 0; i < picEdge.length; i++) {
    const pos = new edsLIB.Vector2(picEdge[i].x, picEdge[i].y);
    const vel = new edsLIB.Vector2(0, 0);
    const acc = new edsLIB.Vector2(0, 0);
    const boid = new flocking.Boid(pos, vel, acc);

    let newStar = 0;
    if (picEdge.x > width / 2) {
      newStar = 1;
    }

    starsinMap[newStar].staticflock.push(boid);
  }

  myTimer();
}

// move boids
function moveFlocks() {
  // figure out which stars are part of map and which aren't
  starsinMap = [];
  starsNotInMap = [];
  for (let s = 0; s < stars.length; s++) {
    if (stars[s].inMap) {
      starsinMap.push(stars[s]);
    } else {
      starsNotInMap.push(stars[s]);
    }
  }
  // stars not in map sacrifice their flock to the other stars
  const homelessFlocks = [];
  for (let i = 0; i < starsNotInMap.length; i++) {
    homelessFlocks.push(starsNotInMap[i].flock);
    starsNotInMap[i].flock = [];
  }

  for (let f = 0; f < homelessFlocks.length; f++) {
    const flock = homelessFlocks[f];
    for (let b = 0; b < flock.length; b++) {
      const boid = flock[b];
      const newStar = edsLIB.getRandomInt(0, starsinMap.length - 1);
      starsinMap[newStar].flock.push(boid);
    }
  }

  createStandingFlock(stars, picEdge);
}
function SortStars(imageDataHidden) {
  const colorstars = [];// testing
  console.log(starsinMap);
  // need to figure out math so i can skip this for loop
  for (let i = 0; i < imageDataHidden.data.length; i += 4) {
    const x = (i / 4) % width;// x coordinate
    const y = Math.floor((i / 4) / width);// y coordinate

    for (let s = 0; s < starsinMap.length; s++) {
      if (starsinMap[s].x === x && starsinMap[s].y === y) {
        for (let r = 0; r < rainbow.length; r++) {
          const color = rainbow[r];
          if (imageDataHidden.data[i] === color[0]
            || imageDataHidden.data[i + 1] === color[1]
            || imageDataHidden.data[i + 2] === color[2]) {
            starsinMap[s].part = r;
            colorstars.push(starsinMap[s]);
          }
        }
      }
    }
  }
  starsinMap.sort(((a, b) => ((a.part < b.part) ? -1 : 1)));
  // all colors have been added now can sort by color
}
function DetermineStars(imageDataHidden) {
  let transparent = false;
  let notTransparent = false;
  // determine if star is within img subject
  // better way to do this might change
  // determines edge
  for (let i = 0; i < imageDataHidden.data.length; i += 4) {
    const x = (i / 4) % width;// x coordinate
    const y = Math.floor((i / 4) / width);// y coordinate
    if (imageDataHidden.data[i + 3] !== 0) { // not transparent
      for (let s = 0; s < stars.length; s++) {
        if (stars[s].x === x && stars[s].y === y) {
          stars[s].inMap = true;
        }
      }
      if (notTransparent === true) {
        picEdge.push(new edsLIB.Vector2(x, y));
      }

      transparent = true;
      notTransparent = false;
    } else {
      if (transparent === true) {
        picEdge.push(new edsLIB.Vector2(x, y));
      }

      transparent = false;
      notTransparent = true;
    }
  }

  // moving unused boids to their new stars
  moveFlocks();
}
async function ReadMap() {
  // clear the context
  ctxHidden.clearRect(0, 0, width, height);

  // get the image data
  newImage = new Image();
  newImage.src = document.getElementById('output').src;

  picEdge = [];

  newImage.onload = async function () {
    ctxHidden.drawImage(newImage, 0, 0, width, height);

    // getting the data without body parts organized just png with subject cutout
    let imageDataHidden = ctxHidden.getImageData(0, 0, width, height);

    // changes ctx to use the new image with body parts organized by type

    DetermineStars(imageDataHidden);

    await loadBodyPix();

    // now sort stars based on body part

    imageDataHidden = ctxHidden.getImageData(0, 0, width, height);
    SortStars(imageDataHidden);
  };
}

// setup button events
function setupUI() {
  // block section
  document.querySelector('#Play').onclick = function () {
    ReadMap();
    ranAI = true;
  };

  // sliders
  document.querySelector('#flockSizeSlider').oninput = function () {
    flockPerStar = this.value;
    ranAI = false;
    initFlock();
  };
  document.querySelector('#staticflockSizeSlider').oninput = function () {
    staticFlockQty = this.value;
  };
  document.querySelector('#starSlider').oninput = function () {
    starCount = this.value;
    ranAI = false;
    initStars();
    initFlock();
  };
  document.querySelector('#opacity').oninput = function () {
    opacity = this.value / 255;
  };

  document.querySelector('#switchFrequency').oninput = function () {
    switchtime = this.value;
  };

  document.querySelector('#getImage').onclick = () => {
    // 2. Create an XHR object to download the web service
        // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/
        const xhr = new XMLHttpRequest();
        const url = '/src/removeBg';
        
        // 3. set `onerror` handler
        xhr.onerror = () => console.log("error");
        
        // 4. set `onload` handler
        xhr.onload = () => {
            
        }; // end xhr.onload
        
        // 5. open the connection using the HTTP GET method
        xhr.open("GET",url);
        
        // 6. we could send request headers here if we wanted to
        // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/setRequestHeader
        
        // 7. finally, send the request
        xhr.send();
        
        ReadMap();
        ranAI=true;
  }; // end onclick
}

function initCanvas() {
  // A - canvas variable points at <canvas> tag
  canvas = document.querySelector('#maincanvas');
  canvas.height = height;
  canvas.width = width;
  // B - the ctx variable points at a "2D drawing context"
  ctx = canvas.getContext('2d');

  canvasHidden = document.querySelector('#hiddencanvas');
  ctxHidden = canvasHidden.getContext('2d');

  // event listeners

  edsLIB.cls(ctx, width, height);
  initStars();
  initFlock();

  setupUI();
  update(ctx);
}

// intialize
const init = async function () {
  // #2 Now that the page has loaded, start drawing!
  console.log('init called');

  // setup image and its heights
  await loadBodyPix();
  initCanvas();
};

function GetOpacity() {
  return opacity;
}

function GetCanvasWidth() {
  return width;
}
function GetCanvasHeight() {
  return height;
}
function GetStaticFlockQty() {
  return staticFlockQty;
}

export {
  GetStaticFlockQty, GetOpacity, GetCanvasHeight, GetCanvasWidth, init,
};
