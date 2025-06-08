const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext('2d');
canvas.height = 400;
canvas.width = Math.round(canvas.height * (window.innerWidth / window.innerHeight));

class stack {
	constructor() {
		this.array = [0];
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

var generateMaze = (marray) => {
    for(let i = 0; i < marray.length; i++) {
        for(let j = 0; j < marray[i].length; j++) {
            marray[i][j] = 1;
        }
    }
    let mstackx = new stack();
    let mstacky = new stack();
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
					if(marray[x]?.[y - 2] !== 0 && y - 2 >= 0) {
						mstacky.push(y - 2);
						mstackx.push(x);
						marray[x][y - 1] = 0;
						marray[x][y - 2] = 0;
						went = 1;
					}
				break;
				case 2: //back
					if(marray[x]?.[y + 2] !== 0 && y + 2 < marray[0].length) {
						mstacky.push(y + 2);
						mstackx.push(x);
						marray[x][y + 1] = 0;
						marray[x][y + 2] = 0;
						went = 1;
					}
				break;
				case 3: //left
					if(map[x - 2]?.[y] !== 0 && x - 2 >= 0) {
						mstacky.push(y);
						mstackx.push(x - 2);
						marray[x - 1][y] = 0;
						marray[x - 2][y] = 0;
						went = 1;
					}
				break;
				case 4: //right
					if(map[x + 2]?.[y] !== 0 && x + 2 < marray.length) {
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
        let d = 2000;
        this.pos = [Math.cos(Math.random()*2*Math.PI)*d,Math.sin(Math.random()*2*Math.PI)*d];
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
        while(this.colisionCheck(gspace)) this.pos = [Math.cos(Math.random()*2*Math.PI)*d,Math.sin(Math.random()*2*Math.PI)*d];
	}
	update(delta) {
        if(delta == 0) {
            this.timecheck = 0;
            return 0;
        } else if(this.timecheck == 0) {
            this.timecheck = 1;
            return 0;
        } else if(space != gspace) return 0;
        delta /= 1000;
        if(this.Pangle > 2*Math.PI) {
            this.Pangle = 2*Math.PI - this.Pangle;
        }
        this.friction = (this.Fmax*this.m)/(this.Vmax*5);
        let fsize = this.friction*size(this.v);
        for(let i = 0; i <= 2; i++) {
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
        this.pos[0] += this.s[0];
        this.pos[1] += this.s[1];
        this.colisionCheck(space);
	}
    colisionCheck(vspace) {
        let c = true;
        for(let l = 0; l <= c; l++) {
            for(let i = -1; i <= 1; i++) {
                for(let j = -1; j <= 1; j++) {
                    if((Math.abs(i) == Math.abs(j) && l == 0) || (Math.abs(i) != Math.abs(j) && l != 0)) continue;
                    let x = Math.round((this.pos[0]+(this.m/2)*i)/vspace+(msize/2));
                    let y = Math.round((this.pos[1]+(this.m/2)*j)/vspace+(msize/2));
                    if(x < 0 || x >= msize || y < 0 || y >= msize) {
                        continue;
                    }
                    if(map[y][x] == 1) {
                        c = false;
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
        if(c == false) {
            return true;
        } else return false;
    }
    draw() {
        ctx.fillStyle = "red";
        ctx.fillText("m: "+this.m,0,20,canvas.width);
        ctx.fillText("F: ["+Math.round(this.f[0])+","+Math.round(this.f[1])+"], " + Math.round(distance(this.f[0],this.f[1],0,0)),0,30,canvas.width);
        ctx.fillText("a: ["+Math.round(this.a[0])+","+Math.round(this.a[1])+"], " + Math.round(distance(this.a[0],this.a[1],0,0)),0,40,canvas.width);
        ctx.fillText("v: ["+Math.round(this.v[0])+","+Math.round(this.v[1])+"], " + Math.round(distance(this.v[0],this.v[1],0,0)),0,50,canvas.width);
        ctx.fillText("pos: ["+Math.round(this.pos[0])+","+Math.round(this.pos[1])+"], " + Math.round(distance(this.pos[0],this.pos[1],0,0)),0,60,canvas.width);
        ctx.fillStyle = "green";
        RelativeDraw(this.pos[0],this.pos[1],this.m,this.m);
        ctx.globalAlpha = 0.5;
        drawline(this.pos[0],this.pos[1],this.pos[0]+Math.cos(this.Pangle)*this.Fmax,this.pos[1]+Math.sin(this.Pangle)*this.Fmax,"red");
        ctx.globalAlpha = 1;
        drawline(this.pos[0],this.pos[1],this.f[0] + this.pos[0],this.f[1] + this.pos[1],"grey");
    }
}

var RelativeDraw = (x,y,size) => {
    let xx = Math.round(canvas.width/2 + (x - player1.pos[0]) - size/2)
    let yy = Math.round(canvas.height/2 + (y - player1.pos[1]) - size/2)
    if((xx < 0-size || xx > canvas.width+size) || (yy < 0-size || yy > canvas.height+size)) {
        return false
    } else {
        ctx.fillRect(xx,yy,size,size);
        return true
    }
}

var map = [[]];

let msize = 2000;
var space = 10;
var gspace = 101

for(let i = 0; i < msize; i++) {
    map.push([]);
    for(let j = 0; j < msize; j++) {
        map[i].push(0);
    }
}

generateMaze(map);

var player1 = new player();

var DrawMap = () => {
    let startj = 0;
    let starti = 0;
    let ij = 1;
    let ii = 1;
    ctx.fillStyle = "grey";
    for(let i = starti; i < canvas.width; i += ii) {
        if(Math.round(Math.abs(player1.pos[0] + i)) % space == 0 || ii == space) {
            ctx.fillRect(i,1,1,canvas.height);
            if(ii == 1) { 
                starti = i;
                ii = space;
            }
        }
        for(let j = startj; j < canvas.height; j += ij) {
            if(Math.round(Math.abs(player1.pos[1] + j)) % space == 0 || ij == space) {
                ctx.fillRect(1,j,canvas.width,1);
                if(ij == 1) {
                    startj = j;
                    ij = space;
                }
            }
        }
    }
    starti = Math.floor((player1.pos[1]-canvas.height-space)/space+(msize/2));
    startj = Math.floor((player1.pos[0]-canvas.width-space)/space+(msize/2));
    let endi = Math.floor((player1.pos[1]+canvas.height+space)/space+(msize/2));
    let endj = Math.floor((player1.pos[0]+canvas.width+space)/space+(msize/2));
    for(let i = starti; i < endi; i++) {
        for(let j = startj; j < endj; j++) {
            if(i < 0 || j < 0 || i >= msize || j >= msize) {
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


var drawline = (x,y,x2,y2,color) => {
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
        space += 0.05*(1000/fps)*tfactor;
    } else if(space > gspace+1) {
        space -= 0.05*(1000/fps)*tfactor;
    } else {
        space = gspace;
    }
    DrawMap();
    player1.update((1000/fps)*tfactor)
    player1.draw()
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
