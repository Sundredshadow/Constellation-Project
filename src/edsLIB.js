import * as index from "./index"
import * as flocking from "./flocking"
//fill random array before load so can use psuedo randomint
let randoms= new Float32Array(1000).fill(0);
for(let z=0;z<5000;z++)
{  
    randoms[z]=Math.random();
}   

function drawFlock(ctx,flock,stars,staticflock,width,height){
    let tempFlock=JSON.parse(JSON.stringify(flock));
    // for(let sf=0;sf<staticflock.length;sf++){
    //    tempFlock.push(staticflock[sf]);
    // }
    for(let f = 0; f <index.GetStaticFlockQty();f++){
        tempFlock.push(staticflock[0]);
    }

    for(let f = 0; f <staticflock.length;f++){
        staticflock[f].draw(ctx,true,index.GetOpacity());
    }

    for(let f = 0; f <flock.length;f++){
        flock[f].flock(tempFlock);
        flock[f].update(width,height);
        flock[f].draw(ctx,false);
    }
    
}

function switchFlock(stars){
    for(let i =0; i<stars.length;i++){
        if(i!=0){
            let boid=stars[i].flock.shift();
            stars[i].flock.unshift(stars[i-1].flock.pop());
            stars[i-1].flock.unshift(boid);
        }
        if(i+1!=stars.length){
            let boid=stars[i].flock.shift();
            stars[i].flock.unshift(stars[i+1].flock.pop());
            stars[i+1].flock.unshift(boid);
        }
    }
}

//root draw function
function draw(ctx,stars,width,height){
    for(let i =0; i<stars.length;i++){
        let flock=stars[i].flock;
        drawCircle(ctx,stars[i].x,stars[i].y,2,"white",0,"white");   
        let staticflock=stars[i].staticflock;
        staticflock[0].position=new flocking.Vector2(stars[i].x,stars[i].y);

        drawFlock(ctx,flock,stars, staticflock,width,height);
    }

}

//clear screen
function cls(ctx,width,height){//clear screen
    ctx.clearRect(0,0,width,height);
    drawRectangle(ctx,0,0,width,height);
}


//base draws//////////////////////////////////////////////////
function drawRectangle(ctx,x,y,width,height,fillStyle="black",lineWidth=0,strokeStyle="black",alpha=255)
{
    ctx.fillStyle=fillStyle;
    ctx.save();
    ctx.globalAlpha=alpha;
    ctx.beginPath();
    ctx.rect(x,y,width,height);
    ctx.closePath(); 
    ctx.fill();
    if(lineWidth>0){
        ctx.lineWidth=lineWidth;
        ctx.strokeStyle=strokeStyle;
        ctx.stroke();
    }
    ctx.restore();
}

function drawCircle(ctx,x,y,radius, fillStyle="black",lineWidth=0,strokeStyle="black",alpha=255)
{
    ctx.fillStyle=fillStyle;
    ctx.save();
    ctx.globalAlpha=alpha;
    ctx.beginPath();
    ctx.arc(x,y,radius,0,Math.PI*2,false); 
    ctx.closePath();
    ctx.fill();
    if(lineWidth>0)
    {
        ctx.lineWidth=lineWidth;
        ctx.strokeStyle=strokeStyle;
        ctx.stroke();
    }
    ctx.restore();

    return {x:x,y:y}
}
function drawLine(ctx,x1,y1,x2,y2,lineWidth=1,strokeStyle="black")
{
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x1,y1);
    ctx.lineTo(x2,y2);
    ctx.closePath(); 
    if(lineWidth<=0)
    {
        lineWidth=1;
    }
    ctx.lineWidth=lineWidth;
    ctx.strokeStyle=strokeStyle
    ctx.stroke();
    ctx.restore();
}


//randoms///////////////////////////////////////////

//psuedo random got a bunch of randoms before window loaded and iterates through
//not used here but useful as a library tool
let posRand=0;
function getRandomInt(min, max) {
    if(posRand>=1000){posRand=0;}
    let temp=Math.floor(randoms[posRand] * (max - min + 1)) + min;
    posRand++;
    return temp;
}

function getRandomColor(){
    return "#"+parseInt(getRandomInt(0,255),2).toString(16).toUpperCase()+parseInt(getRandomInt(0,255),2).toString(16).toUpperCase()+parseInt(getRandomInt(0,255),2).toString(16).toUpperCase();
}

function drawRandomRect(ctxm,canvasWidth,canvasHeight){
    drawRectangle(ctx,getRandomInt(0,canvasWidth),getRandomInt(0,canvasHeight),2,getRandomInt(0,2),getRandomInt(0,2),edsLIB.getRandomColor());
}

function drawRandomCircle(ctx,canvasWidth,canvasHeight,radius=getRandomInt(20,300),color=getRandomColor(),lineWidth=getRandomInt(0,2),strokeStyle=getRandomColor()){
    return drawCircle(ctx,getRandomInt(0,canvasWidth),getRandomInt(0,canvasHeight),radius,color,lineWidth,strokeStyle); 
}

function drawRandomLine(ctx,canvasWidth,canvasHeight){
    drawLine(ctx,getRandomInt(0,canvasWidth),getRandomInt(0,canvasHeight),getRandomInt(0,canvasWidth),getRandomInt(0,canvasHeight),getRandomInt(drawParams.minStrokeWidth,drawParams.maxStrokeWidth),edsLIB.getRandomColor())
}

function GetRandomIntegerArr()
{
    return randoms;
}

export {
  
    // getters that will always be in libarary file and other stuff
    getRandomInt, GetRandomIntegerArr, cls, draw, drawRandomRect, drawRandomCircle,
    drawRandomLine, drawLine, drawCircle,drawRectangle,switchFlock,drawFlock
};