const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext('2d');
canvas.height = 400;
canvas.width = Math.round(canvas.height * (window.innerWidth / window.innerHeight));

class stack {
	constructor(start) {
		this.array = [start];
	}
	push(x) {
		this.array.push(x);
	}
	pop() {
		this.array.pop();
	}
	peek() {
		return this.array[this.array.length - 1];
	}
	empty() {
		this.array = [];
	}
	isempty() {
		if(this.array.length == 0) {
			return true;
		} else return false;
	}
	change(x) {
		this.array[this.array.length - 1] = x;
	}
}

function RB(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

var generateMaze = (marray,min,max) => {
    for(let i = min[0]; i <= max[0]; i++) {
        if(marray[i] === undefined) {
            marray[i] = new Map();
        }
        for(let j = min[1]; j <= max[1]; j++) {
            marray[i][j] = 1;
        }
    }
    let mstackx = new stack(Math.round((max[0]+min[0])/2));
    let mstacky = new stack(Math.round((max[1]+min[1])/2));
    let maze = 1;
    while(maze == 1) { //maze generation (recursive backtracking)
		let went = 0;
		let direction = RB(1,4); // 1 = front, 2 = back, 3 = left, 4 = right
		let direction2 = RB(1,2);
		let count = 0;
		while(went == 0) {
			let y = mstacky.peek();
			let x = mstackx.peek();
			switch(direction) {
				case 1: //front
					if(marray[x]?.[y - 2] !== 0 && y - 2 >= min[1]) {
						mstacky.push(y - 2);
						mstackx.push(x);
						marray[x][y - 1] = 0;
						marray[x][y - 2] = 0;
						went = 1;
					}
				break;
				case 2: //back
					if(marray[x]?.[y + 2] !== 0 && y + 2 <= max[1]) {
						mstacky.push(y + 2);
						mstackx.push(x);
						marray[x][y + 1] = 0;
						marray[x][y + 2] = 0;
						went = 1;
					}
				break;
				case 3: //left
					if(map[x - 2]?.[y] !== 0 && x - 2 >= min[0]) {
						mstacky.push(y);
						mstackx.push(x - 2);
						marray[x - 1][y] = 0;
						marray[x - 2][y] = 0;
						went = 1;
					}
				break;
				case 4: //right
					if(map[x + 2]?.[y] !== 0 && x + 2 <= max[0]) {
						mstacky.push(y);
						mstackx.push(x + 2);
						marray[x + 1][y] = 0;
						marray[x + 2][y] = 0;
						went = 1;
					}
				break;
			}
			if(went == 0) {
				count++;
				if(direction2 == 1) {
					direction--;
					if(direction < 1) direction = 4;
				} else if(direction2 == 2) {
					direction++;
					if(direction > 4) direction = 1;
				}
				if(count >= 3) {
					count = 0;
					direction = RB(1,4);
					direction2 = RB(1,2);
					mstackx.pop();
					mstacky.pop();
					if(mstackx.isempty() || mstacky.isempty()) {
						maze = 0;
                        went = 1;
					}
				}
			}
		}
	}
}


var distance = (x0,y0,x2,y2) => {
    //d=√((x_2-x_0)²+(y_2-y_0)²)
    return Math.sqrt((x2-x0)**2+(y2-y0)**2);
}

var size = (a) => {
    return Math.sqrt(a[0]**2+a[1]**2);
}

var mouse = {
    x: 1,
    y: 1
}

var point = [0,0];

var tfactor = 1 //time factor
var store = tfactor;

class player {
	constructor() {
        this.pos = [0,0];
        this.mpos = [0,0];
        this.cpos = [0,0];
        this.s = [0,0] //distance that will be added to pos array
        this.v = [0,0]; //m/s
        this.a = [0,0]; //m/(s^2)
        this.FF = [0,0]; //friction force
        this.FP = [0,0]; //player force
        //this.FN = [0,0]; //normal force vector
        this.f = [0,0]; //force sum
        this.m = 5; //kg
        this.date = 0;
        this.apply = false;
        this.Vmax = 200; //for 5 kg player yeah
        this.Fmax = 1000;
        this.friction = (this.Fmax*this.m)/(this.Vmax*5);
        this.Pangle = 0; //player angle
        this.vcut = 0.05;
        this.timecheck = 1;
        this.rlength = 20;
        this.noclip = false;
        this.FOV = Math.PI/2;
        this.raycasting = false;
        this.raydD = 50;
        this.rays = 20;
        this.Rdebug = false;
        for(let i = 0; i <= 1; i++) {
            this.mpos[i] = this.pos[i]/space+(msize/2);
            this.cpos[i] = this.mpos[i]/msize;
        }
	}
	update(delta) {
        if(delta == 0) {
            this.timecheck = 0;
            return 0;
        } else if(this.timecheck == 0) {
            this.timecheck = 1;
            return 0;
        }
        delta /= 1000;
        if(this.Pangle > 2*Math.PI) {
            this.Pangle = 2*Math.PI - this.Pangle;
        }
        this.friction = (this.Fmax*this.m)/(this.Vmax*5);
        let fsize = this.friction*size(this.v);
        for(let i = 0; i <= 2; i++) {
            if(gspace != space) {
                this.pos[i] = (this.mpos[i]-msize/2)*space;
            }
            if(size(this.v) > 0) {
                this.FF[i] = this.v[i] * (fsize/size(this.v));
            } else this.FF = [0,0];
            this.f[i] = /*this.FN[i] +*/ this.FP[i] - this.FF[i];
            this.a[i] = this.f[i] / this.m; //a = f/m
            this.s[i] = ((this.v[i] + (this.v[i]+this.a[i]*delta) )/2) * delta//s = ((v0+v)/2)*t, t is delta
            this.v[i] = this.v[i] + this.a[i]*delta//v = v0+at
            if(Math.abs(this.v[i]) < this.vcut) {
                this.v[i] = 0;
            }
        }
        if(!this.noclip && size(this.s) <= 1) {
            this.colisionCheck(space,this.pos,false,this.m);
        } else if(!this.noclip) { //colision check between frames
            let ss = size(this.s); 
            let ns = [this.s[0]/ss,this.s[1]/ss];
            for(let i = 1; i <= ss; i++) { //this can get laggy if player is very fast but luckily there is a max speed and this game takes place in a maze
                if(this.colisionCheck(space,[this.pos[0]+ns[0]*i,this.pos[1]+ns[1]*i],false,this.m)) {
                    this.s = [ns[0]*i,ns[1]*i];
                    break;
                }
            }
        }
        for(let i = 0; i <= 1; i++) {
            this.pos[i] += this.s[i];
            this.mpos[i] = this.pos[i]/space+(msize/2);
            this.cpos[i] = this.mpos[i]/msize;
        }
	}
    spacesync(vspace) {
        for(let i = 0; i <= 1; i++) this.pos[i] = (this.mpos[i]-msize/2)*vspace;
    }
    colisionCheck(vspace,coords,ray,mass) {
        let c = true;
        for(let l = 0; l <= c; l++) {
            for(let i = -1; i <= 1; i++) {
                for(let j = -1; j <= 1; j++) {
                    if((Math.abs(i) == Math.abs(j) && l == 0) || (Math.abs(i) != Math.abs(j) && l != 0)) continue;
                    let x = Math.round((coords[0]+(mass/2)*i)/vspace+(msize/2));
                    let y = Math.round((coords[1]+(mass/2)*j)/vspace+(msize/2));
                    if(map[y]?.[x] === undefined) {
                        continue;
                    }
                    if(map[y][x] == 1) {
                        c = false;
                        if(ray == false) {
                            if(i != 0 && ((this.v[0] > 0) == (i > 0))) {
                                this.v[0] = this.v[0] * -1;
                            }
                            if(j != 0 && ((this.v[1] > 0) == (j > 0))) {
                                this.v[1] = this.v[1] * -1;
                            }
                        }
                    }
                }
            }
        }
        if(c == false) {
            return true;
        } else return false;
    }
    mapc(num,vspace) {return num/vspace+(msize/2)}
    wall(acords) {
        return this.colisionCheck(space,acords,true,1); //lazy
    }
    draw() {
        ctx.fillStyle = "red";
        ctx.fillText("m: "+this.m,0,20,canvas.width);
        ctx.fillText("F: ["+Math.round(this.f[0])+","+Math.round(this.f[1])+"], " + Math.round(size(this.f)),0,30,canvas.width);
        ctx.fillText("a: ["+Math.round(this.a[0])+","+Math.round(this.a[1])+"], " + Math.round(size(this.a)),0,40,canvas.width);
        ctx.fillText("v: ["+Math.round(this.v[0])+","+Math.round(this.v[1])+"], " + Math.round(size(this.v)),0,50,canvas.width);
        ctx.fillText("pos: ["+Math.round(this.pos[0])+","+Math.round(this.pos[1])+"], " + Math.round(size(this.pos)),0,60,canvas.width);
        ctx.fillText("mpos: ["+Math.round(this.mpos[0])+","+Math.round(this.mpos[1])+"], " + Math.round(size(this.mpos)),0,70,canvas.width);
        ctx.fillText("cpos: ["+Math.floor(this.cpos[0])+","+Math.floor(this.cpos[1])+"], " + Math.round(size(this.cpos)),0,80,canvas.width);
        ctx.fillText("GENERATED CELLS: " + generated,0,90,canvas.width);
        ctx.fillStyle = "green";
        RelativeDraw(this.pos[0],this.pos[1],this.m,this.m);

        if(this.raycasting == true) {
            let screen = [[Math.cos(this.Pangle-this.FOV/2)*this.raydD,Math.sin(this.Pangle-this.FOV/2)*this.raydD],[Math.cos(this.Pangle+this.FOV/2)*this.raydD,Math.sin(this.Pangle+this.FOV/2)*this.raydD]];
            for(let r = 0; r < this.rays; r++) {
                let co = r/this.rays;
                let screenv = [screen[0][0]+(screen[1][0]-screen[0][0])*co,screen[0][1]+(screen[1][1]-screen[0][1])*co];
                ctx.fillStyle = "black";
                RelativeDraw(this.pos[0]+screenv[0],this.pos[1]+screenv[1],3);
                let t = Math.atan(screenv[1]/screenv[0])+(Math.PI*(screenv[0]<0));
                if(t<Math.PI+0.1&&t>Math.PI-0.1) t -= 0.0001;
                t += Math.PI*4;
                let ray = [[this.mpos[0],this.mpos[1]],[this.mpos[0],this.mpos[1]]];
                let rayn = [Math.cos(t),Math.sin(t)];
                let rayv = [[1,rayn[1]/rayn[0]],[rayn[0]/rayn[1],1]];
                for(let i = 0; i <= 1; i++) {
                    if((rayn[0] < 0 && rayv[i][0] > 0) || (rayn[0] > 0 && rayv[i][0] < 0)) rayv[i][0] *= -1;
                    if((rayn[1] < 0 && rayv[i][1] > 0) || (rayn[1] > 0 && rayv[i][1] < 0)) rayv[i][1] *= -1;
                }
                if(rayn[1] < 0) {
                    ray[1][0] += rayv[1][0] * (ray[1][1] - Math.floor(ray[1][1])-0.5);
                    ray[1][1] -= ray[1][1] - Math.floor(ray[1][1])-0.5;
                } else {
                    ray[1][0] += rayv[1][0] * (Math.ceil(ray[1][1]) - ray[1][1]-0.5);
                    ray[1][1] += Math.ceil(ray[1][1]) - ray[1][1]-0.5;
                }
                if(rayn[0] < 0) {
                    ray[0][1] += rayv[0][1] * (ray[0][0] - Math.floor(ray[0][0])-0.5);
                    ray[0][0] -= ray[0][0] - Math.floor(ray[0][0])-0.5;
                } else {
                    ray[0][1] += rayv[0][1] * (Math.ceil(ray[0][0]) - ray[0][0]-0.5);
                    ray[0][0] += Math.ceil(ray[0][0]) - ray[0][0]-0.5;
                }
                //let c = 0;
                let compare = 0;
                for(let a = 0; a <= 1; a++) {
                    for(let k = 0; k < Math.ceil(this.rlength/size(rayv[a])); k++) {
                        let apos = [space*(ray[a][0]-msize/2),space*(ray[a][1]-msize/2)];
                        let check = ((apos[0]>this.pos[0])==(this.pos[0]+rayn[0]>this.pos[0])&&(apos[1]>this.pos[1])==(this.pos[1]+rayn[1]>this.pos[1]));
                        
                        
                        if(check && this.Rdebug) {
                            ctx.fillStyle = "red";
                            RelativeDraw(apos[0],apos[1],3);
                        }
                        

                        if(check&&this.wall(apos)) {
                            if(this.Rdebug) drawline(this.pos[0],this.pos[1],apos[0],apos[1],"red");
                            compare = 1;
                            let rx = space*(ray[0][0]-msize/2);
                            let ry = space*(ray[0][1]-msize/2);
                            if(distance(apos[0],apos[1],this.pos[0],this.pos[1]) < distance(rx,ry,this.pos[0],this.pos[1]) && a == 1) {
                                if(this.Rdebug) drawline(this.pos[0],this.pos[1],rx,ry,"red");
                                drawline(this.pos[0],this.pos[1],apos[0],apos[1],"lime");
                                RelativeDraw(apos[0],apos[1],3);
                            } else if(a==1) {
                                if(this.Rdebug) drawline(this.pos[0],this.pos[1],apos[0],apos[1],"red");
                                drawline(this.pos[0],this.pos[1],rx,ry,"yellow");
                                RelativeDraw(rx,ry,3);
                            }
                            break;
                        } else if(a==1&&compare==1&&k==Math.ceil(this.rlength/size(rayv[a]))-1) {
                            let rx = space*(ray[0][0]-msize/2);
                            let ry = space*(ray[0][1]-msize/2);
                            if(this.Rdebug) drawline(this.pos[0],this.pos[1],apos[0],apos[1],"red");
                            drawline(this.pos[0],this.pos[1],rx,ry,"yellow");
                            RelativeDraw(rx,ry,3);
                        }
                        for(let j = 0; j <= 1; j++) {
                            ray[a][j] += rayv[a][j];
                        }
                        //c++;
                    }
                }
                //console.log(c);
            }
            drawline(this.pos[0],this.pos[1],this.pos[0]+Math.cos(this.Pangle-this.FOV/2)*this.Fmax,this.pos[1]+Math.sin(this.Pangle-this.FOV/2)*this.Fmax,"red")
            drawline(this.pos[0],this.pos[1],this.pos[0]+Math.cos(this.Pangle+this.FOV/2)*this.Fmax,this.pos[1]+Math.sin(this.Pangle+this.FOV/2)*this.Fmax,"red")
            drawline(this.pos[0]+screen[0][0],this.pos[1]+screen[0][1],this.pos[0]+screen[1][0],this.pos[1]+screen[1][1],"red");
        } else drawline(this.pos[0],this.pos[1],this.pos[0]+Math.cos(this.Pangle)*this.Fmax,this.pos[1]+Math.sin(this.Pangle)*this.Fmax,"red");
    }
}

var RelativeDraw = (x,y,size) => {
    let xx = Math.round(canvas.width/2 + (x - player1.pos[0]) - size/2)
    let yy = Math.round(canvas.height/2 + (y - player1.pos[1]) - size/2)
    ctx.fillRect(xx,yy,size,size);
    if((xx < 0-size || xx > canvas.width+size) || (yy < 0-size || yy > canvas.height+size)) {
        return false
    } else {
        return true
    }
}

var map = new Map();
var cells = new Map();

let msize = 100;
var space = 100;
var gspace = 100;

var generated = 0;

var player1 = new player();

var DrawMap = () => {
    let starti = Math.floor((player1.pos[1]-canvas.height-space*2)/space+(msize/2));
    let startj = Math.floor((player1.pos[0]-canvas.width-space*2)/space+(msize/2));
    let endi = Math.floor((player1.pos[1]+canvas.height+space*2)/space+(msize/2));
    let endj = Math.floor((player1.pos[0]+canvas.width+space*2)/space+(msize/2));
    for(let i = starti; i < endi; i++) {
        for(let j = startj; j < endj; j++) {
            if(map[i]?.[j] === undefined) {
                if(cells[Math.floor(i/msize)] === undefined) {
                    cells[Math.floor(i/msize)] = new Map();
                    cells[Math.floor(i/msize)][Math.floor(j/msize)] = 1;
                    generateMaze(map,[Math.floor(i/msize)*msize,Math.floor(j/msize)*msize],[Math.floor(i/msize)*msize+msize,Math.floor(j/msize)*msize+msize]);
                    generated++;
                } else if(cells[Math.floor(i/msize)]?.[Math.floor(j/msize)] === undefined) {
                    cells[Math.floor(i/msize)][Math.floor(j/msize)] = 1;
                    generateMaze(map,[Math.floor(i/msize)*msize,Math.floor(j/msize)*msize],[Math.floor(i/msize)*msize+msize,Math.floor(j/msize)*msize+msize]);
                    generated++;
                }
                continue;
            }
            let x = space*(j-(msize/2));
            let y = space*(i-(msize/2));
            //j = x/space+(msize/2)
            if(map[i][j] == 1) {
                ctx.fillStyle = "white";
                RelativeDraw(x,y,space + (Math.round(space) != space));
            } else if(map[i][j] == 0) {
                ctx.fillStyle = "darkblue";
                RelativeDraw(x,y,space + (Math.round(space) != space));
            }
        }
    }
}


var drawline = (x,y,x2,y2,color) => { //yeah there is a problem if the 2 points are outside the FOV but meh im lazy and dont have any reason to fix it right now. I could fix it if I did a bit of math and caluclated where x/y is in respect to x/y when they r at the border of FOV and then draw that if they r withing the FOV
    ctx.fillStyle = color;
    let d = distance(x,y,x2,y2);
    let kx = (x2-x)/d;
    let ky = (y2-y)/d;
    for(let i = 0; i < d; i++) {
        if(!RelativeDraw(Math.round(x+i*kx),Math.round(y+i*ky),1,1)) return 0;
    }
}

var keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

var checkKeys = (delta) => {
    delta /= 1000
        if(keys["KeyW"] || keys["ArrowUp"]) {//w or up arrrow
            player1.FP = [Math.cos(player1.Pangle)*player1.Fmax,Math.sin(player1.Pangle)*player1.Fmax];
        } else if(keys["KeyS"] || keys["ArrowDown"]) { //s or down arrow
            player1.FP = [0-Math.cos(player1.Pangle)*player1.Fmax,0-Math.sin(player1.Pangle)*player1.Fmax];
	    } else {
            player1.FP = [0,0];
        }
        if(keys["KeyD"] || keys["ArrowRight"]) { //d and right arrow
            player1.Pangle += (delta*2*Math.PI)/1.5;
        }
        if(keys["KeyA"] || keys["ArrowLeft"]) { //a and left arrow
            player1.Pangle -= (delta*2*Math.PI)/1.5;
        }
        if(keys["KeyO"]) {
            if(canvas.height < 1000) {
                canvas.height += Math.ceil((canvas.height/4)*delta);
                canvas.width = Math.round(canvas.height * (window.innerWidth / window.innerHeight));
            }
        }
        if(keys["KeyI"]) {
            if(canvas.height > 100) {
                canvas.height -= (canvas.height/4)*delta;
                canvas.width = Math.round(canvas.height * (window.innerWidth / window.innerHeight));
            }
        }
}

var expandRate = 0.05;

var spaceset = true;

var start = performance.now();
var fps = 1000/60;
var hold = false;
var game = () => {
    checkKeys((1000/fps)*tfactor);
    if(hold) {
        p = [mouse.x-canvas.width/2,mouse.y-canvas.height/2];
        player1.Pangle = Math.atan(p[1]/p[0])+(Math.PI*(p[0]<0));
    }
    ctx.clearRect(0,0,canvas.width,canvas.height);
    if(space < gspace-1) {
        space += expandRate*(1000/fps)*tfactor;
        spaceset = false;
    } else if(space > gspace+1) {
        space -= expandRate*(1000/fps)*tfactor;
        spaceset = false;
    } else {
        space = gspace;
        if(!spaceset) {
            player1.spacesync(space);
            spaceset = true;
        }
    }
    player1.update((1000/fps)*tfactor);
    DrawMap();
    player1.draw();
    ctx.fillStyle = "red";
    ctx.fillText("FPS: " + Math.round(fps),0,10,canvas.width);
    fps = 1000/(performance.now()-start)
    start = performance.now();
    requestAnimationFrame(game);
}

addEventListener("blur", (e) => {
    keys = {};
    hold = false;
    store = tfactor;
    tfactor = 0;
})

addEventListener("focus", (e) => {
    tfactor = store;
    start = performance.now();
})

addEventListener("resize", (e) => {
    canvas.width = Math.round(canvas.height * (window.innerWidth / window.innerHeight));
})

addEventListener("mousemove", (e) => {
    mouse.y = (e.y / window.innerHeight) * canvas.height;
    mouse.x = (e.x / window.innerWidth) * canvas.width;
})

addEventListener("touchmove", (e) => {
    let touch = e.touches[0];
    mouse.x = (touch.clientX / window.innerWidth) * canvas.width;
    mouse.y = (touch.clientY / window.innerHeight) * canvas.height;
    e.preventDefault();
})

addEventListener("mousedown", (e) => {
    hold = true;
    keys["KeyW"] = true;
})

addEventListener("mouseup", (e) => {
    hold = false;
    keys["KeyW"] = false;
})

addEventListener("touchstart", (e) => {
    let touch = e.touches[0];
    mouse.x = (touch.clientX / window.innerWidth) * canvas.width;
    mouse.y = (touch.clientY / window.innerHeight) * canvas.height;
    hold = true;
    keys["KeyW"] = true;
})

addEventListener("touchend", (e) => {
    hold = false;
    keys["KeyW"] = false;
})

addEventListener("contextmenu", (e) => {
    e.preventDefault();
})

requestAnimationFrame(game);
