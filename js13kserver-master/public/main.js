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

//player data
let players = [];

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

    for (let i=0; i < gridX; i++) {
        for (let j=0; j < gridY; j++) {
            createGrid(i*gDim,j*gDim);
        }
    }

}

//rebuild player positions
function RefreshPlayers() {


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

        if(refresh) {
            RefreshPlayers();
        }

        cells.map(gridSQR => {
            gridSQR.update();
        });


    },
    render: () => {
        if(Area1) {
            Area1.render();
        }
    },
});

//Kick off the gameloop
loop.start();