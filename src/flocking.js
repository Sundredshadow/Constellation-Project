import * as edsLIB from "./edsLIB"

class Boid {
    constructor(position,velocity,acceleration){
        this.position=position
        this.velocity=velocity 
        this.acceleration=acceleration 
        this.distance=10000;
        this.maxforce =1;
        this.maxSpeed = 10;
        this.seperationMod=0.1;
        this.alignMod=4;
        this.cohesionMod=0.5;
    }

    update(width,height){
        if(this.position.x+this.velocity.x>width||this.position.x+this.velocity.x<0){
            this.velocity.x= -1*(this.velocity.x*this.maxSpeed);
            this.acceleration.x=-1*this.acceleration.x;
        }else if(this.position.y+this.velocity.y>height||this.position.y+this.velocity.y<0){
            this.velocity.y= -1*(this.velocity.y*this.maxSpeed);
            this.acceleration.y=-1*this.acceleration.y;
        }
        this.position.add(this.velocity.x,this.velocity.y);
        this.velocity.add(this.acceleration.x,this.acceleration.y);


        this.velocity.limit(this.maxSpeed);
    }

    align(steering){    
        //steer towards avg direction
        steering.velocity.sub(this.velocity.x,this.velocity.y);
        steering.velocity.limit(this.maxforce);
        return steering.velocity;
    }

    cohesion(steering){
        
        //steer towards avg direction
        steering.position.sub(this.position.x,this.position.y);
        steering.position.sub(this.velocity.x,this.velocity.y);
        steering.position.limit(this.maxforce);
        return steering.position;
    }

    seperation(steering){
        steering.seperation.sub(this.velocity.x,this.velocity.y);
        steering.seperation.limit(this.maxforce);
        return steering.seperation;
    }

    calculateSteering(Boids){
            //calculate the avg of all values positions
            let steering={position:new Vector2(0,0), velocity:new Vector2(0,0), seperation:new Vector2(0,0)};
            let sum=Boids.reduce((previousValue,currentValue)=>{

            //need to check if within radius
            let d=this.position.distance(currentValue.position);
            if(d>this.distance){
                return previousValue;
            }

            //calculate pos
            previousValue.posx+=currentValue.position.x;
            previousValue.posy+=currentValue.position.y;

            //calculate vel
            previousValue.velx+=currentValue.velocity.x;
            previousValue.vely+=currentValue.velocity.y;

            //calculate seperation force
            let diff =new Vector2(this.position.x,this.position.y);
            diff.sub(currentValue.position.x,currentValue.position.y);
            if(d!=0){
                diff.x=diff.x/d;
                diff.y=diff.y/d;
            }

            previousValue.sepx+=diff.x;
            previousValue.sepy+=diff.y;


            //some have been influenced
            previousValue.influenced++;

            return previousValue;
        },{posx:0,posy:0,velx:0,vely:0,sepx:0,sepy:0,influenced:0});

        //check if influenced by anything within its range if not no reason to steer
        if(sum.influenced==0){
            return steering;
        }

        //calculate avg

        steering.seperation.x=sum.sepx/sum.influenced;
        steering.seperation.y=sum.sepy/sum.influenced;

        steering.position.x=sum.posx/sum.influenced;
        steering.position.y=sum.posy/sum.influenced;

        steering.velocity.x=sum.velx/sum.influenced;
        steering.velocity.y=sum.vely/sum.influenced;

        return steering;
    }

    flock(Boids){

        let steering=this.calculateSteering(Boids)

        let align=this.align(steering);
        let cohesion=this.cohesion(steering);
        let seperation=this.seperation(steering);

        this.acceleration.add(align.x*this.alignMod,align.y*this.alignMod);
        this.acceleration.add(cohesion.x*this.cohesionMod,cohesion.y*this.cohesionMod);
        this.acceleration.add(seperation.x*this.seperationMod,seperation.y*this.seperationMod);
    }

    draw(ctx,opaque=false,opacity=0.5){
        if(!opaque){
        edsLIB.drawCircle(ctx,this.position.x,this.position.y,1,"yellow",0,"yellow");
        }else{
            edsLIB.drawRectangle(ctx,this.position.x,this.position.y,1,1,"yellow",0,"yellow",opacity);
        }
    }
}


class Vector2{
    constructor(x,y){
        this.x =x;
        this.y=y;
    }
    add(x,y){
        this.x+=x;
        this.y+=y;
    }
    sub(x,y){
        this.x-=x;
        this.y-=y;
    }
    //limits the magnitude of vector
    limit(limit){
        if(limit<Math.sqrt((Math.pow(this.x,2)+Math.pow(this.y,2)))){
            this.normalize();
            this.x*=limit;
            this.y*=limit;
        }
    }
    normalize()
    {
        this.x=this.x/Math.sqrt((Math.pow(this.x,2)+Math.pow(this.y,2)));
        this.y=this.y/Math.sqrt((Math.pow(this.x,2)+Math.pow(this.y,2)))
    }
    distance(vector){
        let disVec=new Vector2(this.x-vector.x,this.y-vector.y);

        return Math.sqrt((Math.pow(disVec.x,2)+Math.pow(disVec.y,2)));
    }
}

export{Boid,Vector2};