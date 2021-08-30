const { init, GameLoop, Text, Sprite, imageAssets, track, pointer, Button} = kontra;

//get components from index
const { canvas, context } = init();


//console.log(canvas);
console.log(canvas);
console.log(context);

//Grid Calcs / variables
var gridX = 39; //number of grid spaces, from 2 - 32
var gridY = 19; //number of grid spaces, from 2 - 32

var areaX = 16 * gridX; //size of grid area 
var areaY = 16 * gridY;

var gDim = areaX / gridX;
var pixThic = 1;

var redraw = true;
var refresh = true;
//Array for cells
let cells = [];

let Area1 = null;
let Area1Col = null;

//player/(s) data
let players = []; //user data
let opponents = []; //opponents to render

let cPlayer = null;
let cPlayerID = null;
let pX = -10;
let pY = -10;

function createGrid(xIn, yIn) {
    const gridSQR = Sprite({
        x: xIn,
        y: yIn,
        color: 'grey',
        width: gDim - pixThic,
        height: gDim - pixThic,

        // text properties
        text: {
            text: 'X',
            color: 'black',
            font: '10px Arial, sans-serif',
            anchor: {x: 0.5, y: 0.5}
        },
    });

    cells.push(gridSQR);
    Area1.addChild(gridSQR);
}

function BuildPixelGrid() {

    //grid area container
    Area1 = Sprite({
        type: 'obj',
        x: 8,
        y: 8,
        width: areaX,
        height: areaY,
        
        render() {
            //this.context.setLineDash([2,10]);
            this.context.lineWidth = 3;
            this.context.strokeStyle = 'black';
            this.context.strokeRect(0, 0, this.width, this.height);
        }
    });
    console.log('areax:' + areaX);

    //block fill colour since render() somehow breaks it
    Area1Col = Sprite({
        x: 0,
        y: 0,
        color: 'black',
        width: Area1.width,
        height: Area1.height,
    });
    Area1.addChild(Area1Col);


    cPlayer = Sprite({
        x: pX,
        y: pY,
        color: 'white',
        width: gDim/2,
        height: gDim/2,
    });
    //Area1.addChild(cPlayer);

    for (let i=0; i < gridX; i++) {
        for (let j=0; j < gridY; j++) {
            createGrid(i*gDim,j*gDim);
        }
    }

}

function CreateUserObj(xIn, yIn) {
    const userObj = Sprite({
        x: xIn,
        y: yIn,
        color: 'red',
        width: gDim/2,
        height: gDim/2,

    });

    opponents.push(userObj);
    //console.log("new player object created, x:" + xIn + ", " + yIn);

}

//rebuild player positions
function RefreshPlayers() {
    //cleanup
    for(let i=0; i < opponents.length; i++) {
        opponents[i].isActive = false;
    }
    opponents.length = 0;
    opponents = []

    console.log("rebuilding " + players.length + " user objects:");

    //rebuild
    for(let i=0; i < players.length; i++) {
        console.log("listing user obj #" + i + ": " + players[i].id);
        CreateUserObj(players[i].x, players[i].y);

        console.log("rebuilding opponent " + players[i].id 
            + " @ pos " + players[i].x + ", " + players[i].y);
    }
}

//Functions called by CLIENT 
export function SetClientPosition(id, x, y) {

    pX = (x * gDim) - (gDim/4);
    pY = (y * gDim) - (gDim/4);

    if(cPlayerID == null) {
        cPlayerID = id; //set ID
    }
    console.log("Setup Client " + cPlayerID + " at pos: " + x + ", " + y);
        
}

//for updating opponent positions
export function SetOpponentPosition(id, x, y) {
    
    for(let i=0; i < players.length; i++) {
        if(players[i].id == id) {
            players[i].x = (x * gDim) - (gDim/4);
            players[i].y = (y * gDim) - (gDim/4);
            
            console.log("Moving player " + id + " to pos: " + x + ", " + y);

            RefreshPlayers()
            return;
        }
    }

    console.log("opponent not found: " + id);
    
}

export function SetUser(id, val, x, y) {  
    if (val == 0) {
        console.log("Remove opponent: " + id);
        players.splice(players.indexOf(id), 1);
        //console.log("player object deleted");

        RefreshPlayers();
        
    } else if (val == 1) {
        console.log("Adding new opponent: " + id);
        
        const user = new User(id, x, y);
        players.push(user);
        console.log("new player object created, x:" + x + ", " + y);

        for(let i=0; i < players.length; i++) {
            console.log("SetUser() listing user obj #" + i + ": " + players[i].id);
        }

        RefreshPlayers();

    } else {
        console.log("ERROR Unknown User Setting Requested??")
    }
}

//GameLoop setup
//Requires update & render functions
const loop = GameLoop({
    update: () => {
        
        if(redraw) {
            console.log("rebuilding grid");
            redraw = false;
            //CleanUpGrid();

            BuildPixelGrid()
        }

        // if(refresh) {
        //     RefreshPlayers();
        // }

        if(cPlayer != null) {
            cPlayer.x = pX;
            cPlayer.y = pY;

        }

        cells.map(gridSQR => {
            gridSQR.update();
        });


    },
    render: () => {
        if(Area1) {
            Area1.render();
        }

        opponents.map(userObj => userObj.render());

        if(cPlayer) {
            cPlayer.render();
        }


    },
});

//Kick off the gameloop
loop.start();




/**
 * Client side user class
 */
 class User {

	/**
	 * @param {Socket} socket
	 */
	constructor(id, x, y) {
		this.id = id;
		this.x = (x * gDim) - (gDim/4);
		this.y = (y * gDim) - (gDim/4);

        //CreateUserObj(this.x, this.y);
	}

}