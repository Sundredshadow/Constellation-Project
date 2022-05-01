// fill random array before load so can use psuedo randomint
const randoms = new Float32Array(1000).fill(0);
for (let z = 0; z < 5000; z++) {
  randoms[z] = Math.random();
}

class Vector2 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  add(x, y) {
    this.x += x;
    this.y += y;
  }

  sub(x, y) {
    this.x -= x;
    this.y -= y;
  }

  // limits the magnitude of vector
  limit(limit) {
    if (limit < Math.sqrt((this.x ** 2 + this.y ** 2))) {
      this.normalize();
      this.x *= limit;
      this.y *= limit;
    }
  }

  normalize() {
    this.x /= Math.sqrt((this.x ** 2 + this.y ** 2));
    this.y /= Math.sqrt((this.x ** 2 + this.y ** 2));
  }

  distance(vector) {
    const disVec = new Vector2(this.x - vector.x, this.y - vector.y);

    return Math.sqrt((disVec.x ** 2 + disVec.y ** 2));
  }
}

function drawFlock(ctx, flock, stars, staticflock, width, height, staticFlockQty, borderOpacity) {
  const tempFlock = JSON.parse(JSON.stringify(flock));
  // for(let sf=0;sf<staticflock.length;sf++){
  //    tempFlock.push(staticflock[sf]);
  // }
  for (let f = 0; f < staticFlockQty; f++) {
    tempFlock.push(staticflock[0]);
  }

  for (let f = 0; f < staticflock.length; f++) {
    staticflock[f].draw(ctx, true, borderOpacity);
  }

  for (let f = 0; f < flock.length; f++) {
    flock[f].flock(tempFlock);
    flock[f].update(width, height);
    flock[f].draw(ctx, false);
  }
}

function switchFlock(stars) {
  for (let i = 0; i < stars.length; i++) {
    if (i !== 0) {
      const boid = stars[i].flock.shift();
      stars[i].flock.unshift(stars[i - 1].flock.pop());
      stars[i - 1].flock.unshift(boid);
    }
    if (i + 1 !== stars.length) {
      const boid = stars[i].flock.shift();
      stars[i].flock.unshift(stars[i + 1].flock.pop());
      stars[i + 1].flock.unshift(boid);
    }
  }
}

function drawCircle(ctx, x, y, radius, fillStyle = 'black', lineWidth = 0, strokeStyle = 'black', alpha = 255) {
  ctx.fillStyle = fillStyle;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2, false);
  ctx.closePath();
  ctx.fill();
  if (lineWidth > 0) {
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = strokeStyle;
    ctx.stroke();
  }
  ctx.restore();

  return { x, y };
}

function drawRectangle(ctx, x, y, width, height, fillStyle = 'black', lineWidth = 0, strokeStyle = 'black', alpha = 255) {
  ctx.fillStyle = fillStyle;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.closePath();
  ctx.fill();
  if (lineWidth > 0) {
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = strokeStyle;
    ctx.stroke();
  }
  ctx.restore();
}

// root draw function
function draw(ctx, stars, width, height, staticFlockQty = 10, borderOpacity = 10) {
  for (let i = 0; i < stars.length; i++) {
    const { flock } = stars[i];
    drawCircle(ctx, stars[i].x, stars[i].y, 2, 'white', 0, 'white');
    const { staticflock } = stars[i];
    staticflock[0].position = new Vector2(stars[i].x, stars[i].y);

    drawFlock(ctx, flock, stars, staticflock, width, height, staticFlockQty, borderOpacity);
  }
}

// clear screen
function cls(ctx, width, height) { // clear screen
  ctx.clearRect(0, 0, width, height);
  drawRectangle(ctx, 0, 0, width, height);
}

// base draws//////////////////////////////////////////////////
function drawLine(ctx, x1, y1, x2, y2, lineWidth = 1, strokeStyle = 'black') {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.closePath();
  if (lineWidth <= 0) {
    ctx.lineWidth = 1;
  } else {
    ctx.lineWidth = lineWidth;
  }
  ctx.strokeStyle = strokeStyle;
  ctx.stroke();
  ctx.restore();
}

// randoms///////////////////////////////////////////

// psuedo random got a bunch of randoms before window loaded and iterates through
// not used here but useful as a library tool
let posRand = 0;
function getRandomInt(min, max) {
  if (posRand >= 1000) { posRand = 0; }
  const temp = Math.floor(randoms[posRand] * (max - min + 1)) + min;
  posRand++;
  return temp;
}

function getRandomColor() {
  return `#${parseInt(getRandomInt(0, 255), 2).toString(16).toUpperCase()}${parseInt(getRandomInt(0, 255), 2).toString(16).toUpperCase()}${parseInt(getRandomInt(0, 255), 2).toString(16).toUpperCase()}`;
}

function drawRandomRect(ctx, canvasWidth, canvasHeight) {
  drawRectangle(
    ctx,
    getRandomInt(0, canvasWidth),
    getRandomInt(0, canvasHeight),
    2,
    getRandomInt(0, 2),
    getRandomInt(0, 2),
    getRandomColor(),
  );
}

function drawRandomCircle(
  ctx,
  canvasWidth,
  canvasHeight,
  radius = getRandomInt(20, 300),
  color = getRandomColor(),
  lineWidth = getRandomInt(0, 2),
  strokeStyle = getRandomColor(),
) {
  return drawCircle(
    ctx,
    getRandomInt(0, canvasWidth),
    getRandomInt(0, canvasHeight),
    radius,
    color,
    lineWidth,
    strokeStyle,
  );
}

function drawRandomLine(ctx, canvasWidth, canvasHeight) {
  drawLine(
    ctx,
    getRandomInt(0, canvasWidth),
    getRandomInt(0, canvasHeight),
    getRandomInt(0, canvasWidth),
    getRandomInt(0, canvasHeight),
    getRandomInt(1, 5),
    getRandomColor(),
  );
}

function GetRandomIntegerArr() {
  return randoms;
}

export {

  // getters that will always be in libarary file and other stuff
  Vector2, getRandomInt, GetRandomIntegerArr, cls, draw, drawRandomRect, drawRandomCircle,
  drawRandomLine, drawLine, drawCircle, drawRectangle, switchFlock, drawFlock,
};
