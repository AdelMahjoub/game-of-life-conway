/////////////////////////////////////////////////////////////////////////
//Conway's game of life :
//-----------------------------------------------------------------------
//Rules :
//1-Any live cell with fewer than two live neighbours dies
//2-Any live cell with two live neighbours lives
//3-Any live cell with more than three live neighbours dies
//4-Any dead cell with exactly three live neighbours becomes a live cell
//------------------------------------------------------------------------
//A first multidimensional array represent the current cells state
//A second multidimensional array represent the next state of the cells following the rules above
//Example : 
//current state         next state
//[                       [
//  [0,1,0]                 [0,0,0]
//  [0,1,0]     ------->    [1,1,1]                     
//  [0,1,0]                 [0,0,0]       
// ]                      ]
// for a cell of coordinates (x,y) neghbours cells are :
// (x-1,y-1) | (x-1, y) | (x-1,y+1)
// (x,y-1)   | target   | (x,y+1)
// (x+1,y-1) | (x+1,y)  | (x+1,y+1)
//the sum of the neighbours will decide of the next cell state
//---------------------------------------------------------------------------
//At first we represent the current state
//Then at a given interval we represent the next state and 
//After animation the current state is updated and so on
//---------------------------------------------------------------------------
window.onload = () => {
    ///////////////////////////////////////////////////////////////////////////////////////
    //Variables
    ///////////////////////////////////////////////////////////////////////////////////////
    //Board 
    var matrixBoard = []; //multidimensional array
    var nextMatrix = []; //next state of matrixBoard
    var liveCellCount = 0; //live cells counter
    var generationsCount = 1; //generations counter
    var width = 70; //number of rows of matrixBoard
    var height = 150; //number of column of matrixBoard 
    //DOM, user Interactions
    var htmlBoard = document.getElementById('board'); //DOM representation of matrixBoard
    var startBtn = document.querySelector('.btn[data-start]'); //start button, animate the board
    var stopBtn = document.querySelector('.btn[data-stop]'); //stop button, stop animation
    var clearBtn = document.querySelector('.btn[data-clear]'); //clear button, reset matrixBoard and its DOM representation
    var counter = document.querySelector('[data-cells-counter]'); //shows the number of live cells
    var generations = document.querySelector('[data-generations-counter]');//shows the number of generation
    var randomBoard = document.querySelector('[data-random]');//generate a random matrixBoard, and its DOM representation
    var framesUp = document.querySelector('[data-farmes-up]');//frames +, button
    var framesDown = document.querySelector('[data-frames-down]');//frames -, button
    var selectPresets = document.querySelector('[data-presets]');//some presets, more will be added
    //Animation
    var start = true;
    var then = Date.now();// last timestamp
    var now; //current timestamp
    var frames = 20; //frames per second
    var timer;//animation id
    var interval = 1000/frames;//fps in ms
    var delta;// now - then difference => trigger a function if delta > interval
    //////////////////////////////////////////////////////////////////////////////////////
    //Functions
    //////////////////////////////////////////////////////////////////////////////////////
    //Return a multidimensional array
    Array.matrix = (lastRow, numcols,initial) => {
        var arr = [];
        for (var i = 0; i < lastRow; i++) {
            var columns = [];
            for (var j = 0; j < numcols; j++) {
                columns[j] = initial;
            }
            arr[i] = columns;
        }
        return arr;
    }
    matrixBoard = Array.matrix(width,height,0);
    //set the class .live-cell to a DOM obj, if the passed num equal 1
    function initialCellStatus(obj, num){
        if(num === 1){
            if(!obj.classList.contains('live-cell')){
                obj.classList.add('live-cell');
            }
        }else{
            if(obj.classList.contains('live-cell')){
                obj.classList.remove('live-cell');
            }
        }
    }
    //create a DOM representation of matrixBoard and append it to the htmlBoard DOM object 
    function createBoard(){
        var tbody = document.createElement('tbody');
        matrixBoard.forEach((row,x) => {
            var tr = document.createElement('tr');
            row.forEach((col,y) => {
                if(col === 1) liveCellCount ++;
                counter.innerHTML = liveCellCount;
                var td = document.createElement('td');
                td.classList.add('cell');
                td.id=`cell-${x}-${y}`;
                td.onclick=onCellClick;
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        htmlBoard.appendChild(tbody);
    }
    //reset all Variables to their initial values and remove .live-cell class
    function clearBoard(){
        liveCellCount = 0;
        generationsCount = 1;
        generations.innerHTML = generationsCount;
        counter.innerHTML = liveCellCount;
        cancelAnimationFrame(timer);
        matrixBoard.forEach((row, x) => {
            row.forEach((col, y) => {
                if(document.getElementById(`cell-${x}-${y}`).classList.contains('live-cell')){
                    document.getElementById(`cell-${x}-${y}`).classList.remove('live-cell')
                }
                matrixBoard[x][y] = 0;
            })
        })
    }
    //generate a random matrixBoard, should be names randomBoard instead of init() I guess
    function init(){
        var liveCells = 0;
        matrixBoard.forEach((row,x) => {
            row.forEach((col,y) =>{
                matrixBoard[x][y] = Math.round(Math.random());
                initialCellStatus(document.getElementById(`cell-${x}-${y}`),  matrixBoard[x][y]);
                if(matrixBoard[x][y] === 1) liveCells++;
            })
        })
        liveCellCount = liveCells;
        counter.innerHTML = liveCells;
        generations.innerHTML = generationsCount;
    }
    //id should be like this : <element id="cell-x-y", extract x and y from the element we clicked one
    //then set the matrxBoard[x][y] to either 1 or 0, and update the clicked element class
    function onCellClick(e){
        var x = Number(e.target.id.split('-')[1]);
        var y = Number(e.target.id.split('-')[2]);
        if(matrixBoard[x][y] === 0){
            matrixBoard[x][y] = 1;
            liveCellCount ++;
            counter.innerHTML = liveCellCount;
            e.target.classList.add('live-cell');
        }else{
            matrixBoard[x][y] = 0;
            e.target.classList.remove('live-cell');
        }
    }
    //loop through an array, then count all the "1"
    function countLiveCells(arr){
        var liveCells = 0;
        arr.forEach((row, x) => {
            row.forEach((col, y) => {
                if(col === 1) liveCells ++;
            })
        })
        return liveCells;
    }
    //this maybe considered the core function of the game
    function nextCycleMatrix(){
        var lastRow = matrixBoard.length - 1;// index of the last row of matrixBoard
        var lastCol = matrixBoard[0].length -1; //index of the last colomn of a row in matrixBoard
        nextMatrix = Array.matrix(lastRow+1, lastCol+1, 0); // a new array "nextMatrix", it will represent the nex matrixBoard state
        //initialize newMatrix 
        matrixBoard.forEach( (row, i) =>{
            row.forEach((col, j) => {
                nextMatrix[i][j] = col;
            })
        })
        //loop through matrixBoard
        matrixBoard.forEach( (row, x) =>{
            row.forEach((col, y) => {
                var neighbours = []; //will contains the values of all neighbours values of a cell
                var sum = 0; // will contain the sum of the neighbours of a cell
                var prevRow, prevCol, nextRow, nextCol;
                //borderless board
                //go to index 0 if either nextRow or nexCol do not exist
                //go to index lastRow or lastCol if either prevRow or prevCol do not exist
                nextRow = (x+1) > lastRow ? 0 : x + 1; //next row
                prevRow = (x-1) < 0 ? lastRow : x - 1; //previous row
                nextCol = (y+1) > lastCol ? 0 : y + 1; //next column
                prevCol = (y-1) < 0 ? lastCol : y - 1; //previous column
                //the 8 neighbours of a cell (target)
                // (x-1,y-1) | (x-1, y) | (x-1,y+1)
                // (x,y-1)   | target   | (x,y+1)
                // (x+1,y-1) | (x+1,y)  | (x+1,y+1)
                //the values of the neighbours are pushed in the neighbours array
                //their sum decides either the cell live or die in the next cycle
                //while looping through matrixBoard we define the nextMatrix
                neighbours.push(
                    matrixBoard[prevRow][prevCol], matrixBoard[prevRow][y], matrixBoard[prevRow][nextCol],
                    matrixBoard[x][prevCol], matrixBoard[x][nextCol],
                    matrixBoard[nextRow][prevCol], matrixBoard[nextRow][y], matrixBoard[nextRow][nextCol]
                )
                sum = neighbours.reduce( (pre, next) => pre + next );
                if(col === 1){
                    if(sum < 2){
                        nextMatrix[x][y] = 0;
                    } 
                    if(sum > 3){
                        nextMatrix[x][y] = 0;
                    }
                }else if(col === 0){
                    if(sum === 3){
                        nextMatrix[x][y] = 1;
                    };
                }
            })
        })
        return nextMatrix;
    }
    //check the difference between to array
    //this function will check the differences between matrixBoard and nextMatrix
    //if there is a difference that means that either new cells are born or cells are dying
    //if there is a difference we count a new generation
    function compareGenerations(pre, next){
        var diff = 0;
        pre.forEach((row, x) => {
            row.forEach((col, y) =>{
                if(next[x][y] !== col) diff++;
            })
        })
        if(diff > 0) return true;
        return false;
    }
    //Update the cells state i.e give it or remove the .live-cell class 
    //according to nextMatrix, 
    //updating matrixBoard
    function nextCycle(){
        nextCycleMatrix().forEach( (row, x) => {
            row.forEach((col,y) => {
                matrixBoard[x][y] = col;
                if(col === 1){
                    if(!document.getElementById(`cell-${x}-${y}`).classList.contains('live-cell')){
                        document.getElementById(`cell-${x}-${y}`).classList.add('live-cell');
                    }
                }else if(col === 0){
                    if(document.getElementById(`cell-${x}-${y}`).classList.contains('live-cell')){
                        document.getElementById(`cell-${x}-${y}`).classList.remove('live-cell');
                    }
                }
            })
        })
    }
    //animate the whole process
    //trigger nextCycle in a given interval
    //the interval is 1000/frame rate
    //if the time difference (delta) between now and then > interval
    //we trigger nextCycle, then update "then"" 
    function liveCycle(){
        timer = requestAnimationFrame(liveCycle);
        now = Date.now()
        delta = now - then;
        if(delta > interval){
            nextCycle();
            then = now - (delta % interval);
        }
        liveCellCount = countLiveCells(matrixBoard);
        counter.innerHTML = liveCellCount;
        //no need to animate if all cells are dead
        if(liveCellCount === 0){
            enableControls();
            cancelAnimationFrame(timer);
        }
        //no need to count new generation if cells are stable
        if(compareGenerations(matrixBoard, nextCycleMatrix())) generationsCount ++;
        else{
            enableControls();
            cancelAnimationFrame(timer);
        }
        generations.innerHTML = generationsCount;
    }
    //no setups allowed while animation
    //this function allow setups
    function enableControls(){
        startBtn.style.pointerEvents = "initial";
        randomBoard.style.pointerEvents = "initial";
        selectPresets.removeAttribute('disabled')
    }
    //this function disable setups
    function disableControls(){
        startBtn.style.pointerEvents = "none";
        randomBoard.style.pointerEvents = "none";
        selectPresets.setAttribute('disabled', 'true');
    }
    //if we click on start, animation starts so we disable setups
    //else i.e (stop, clear button) we enable setups
    function eventWatcher(e){
        if(e.target.hasAttribute('data-start')){
            disableControls();
        }else{
            enableControls();
        }
    }
    ////////////////////////////////////////////////
    //start by creating a random board and animate it 
    //when the user enter the page
    createBoard();
    init();
    liveCycle();
    disableControls();
    ////////////////////////////////////////////////
    //start button, onclick
    startBtn.addEventListener('click', (e) => {
        start = true;
        liveCycle(); //animate
        eventWatcher(e);
        if(liveCellCount === 0){ //no animation if the board is emty
            cancelAnimationFrame(timer);
            enableControls();
        }
    });
    //stop button, onclick
    stopBtn.addEventListener('click', (e) => {
        start = false;
        cancelAnimationFrame(timer); //stop animation
        eventWatcher(e);
    });
    //clear button, onclick
    clearBtn.addEventListener('click', (e) => {
        clearBoard(); //clear the board, reset all values
        eventWatcher(e);
    });
    //random button, onclick
    randomBoard.addEventListener('click', (e) => {
        clearBoard(); //clear the board, reset all values
        init(); //generate a random board
        eventWatcher(e);
    });
    //frames rates input field, set the new frames rate
    framesUp.addEventListener('click', (e) => {
        if(start){
            cancelAnimationFrame(timer); //stop animation
            if(frames <= 50)frames += 10;
            interval = 1000/frames;
            console.log(frames)
            liveCycle(); //animate
        }
    });
    framesDown.addEventListener('click', (e) => {
        if(start){
            cancelAnimationFrame(timer); //stop animation
            if(frames >= 11) frames -= 10;
            interval = 1000/frames;
            console.log(frames)
            liveCycle(); //animate
        }
    });
    //select some presets : more will be added
    selectPresets.addEventListener('change', (e) => {
        switch(e.target.value){ 
            case "galaxy":
                Galaxy();
                break;
            case "pulsar-1":
                PulsarOne();
                break;
            case "pulsar-2":
                PulsarTwo();
                break;
            case "clock":
                Clock();
                break;
            case "heavy-space-ship":
                HeavySC();
                break;
            case "glider-gun":
                GliderGun();
                break;
            case "r-pentomino":
                Rpentomino();
                break;
            case "a-corn":
                Acorn();
                break;
            case "rocket" :
                Rocket();
                break;
            default:
        }
    })
    /////////////////////////////////////////////////
    //Presets
    /////////////////////////////////////////////////
    //Galaxy
    function Galaxy(){
        clearBoard();
        var galaxy = [[0,0,0,0,0,0,0,0,0,0],[0,1,1,0,1,1,1,1,1,1],[0,1,1,0,1,1,1,1,1,1],[0,1,1,0,0,0,0,0,0,0],[0,1,1,0,0,0,0,0,1,1],[0,1,1,0,0,0,0,0,1,1],[0,1,1,0,0,0,0,0,1,1],[0,0,0,0,0,0,0,0,1,1],[0,1,1,1,1,1,1,0,1,1],[0,1,1,1,1,1,1,0,1,1]];
        galaxy.forEach((row,x) => {
            row.forEach((col, y) => {
                matrixBoard[x+30][y+30] = col;
                initialCellStatus(document.getElementById(`cell-${x+30}-${y+30}`), col);
            })
        
        })
        liveCellCount = countLiveCells(matrixBoard);
        counter.innerHTML = liveCellCount;
    }
    //Pulsar 1
    function PulsarOne(){
        clearBoard();
        var pulsar = [[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,1,1,0,1,1,0,0,0,0],[1,0,0,1,0,0,1,0,0,0],[0,1,1,0,1,1,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0]]; 
        pulsar.forEach((row,x) => {
            row.forEach((col, y) => {
                matrixBoard[x+30][y+30] = col;
                initialCellStatus(document.getElementById(`cell-${x+30}-${y+30}`), col);
            })
        
        })
        liveCellCount = countLiveCells(matrixBoard);
        counter.innerHTML = liveCellCount;
    }
    //Pulsar 2
    function PulsarTwo(){
        clearBoard();
        var pulsar = [[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,1,0,1,0,1,0,0,0,0],[0,1,0,0,0,1,0,0,0,0],[0,1,0,0,0,1,0,0,0,0],[0,1,0,0,0,1,0,0,0,0],[0,1,0,1,0,1,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0]];
        pulsar.forEach((row,x) => {
            row.forEach((col, y) => {
                matrixBoard[x+30][y+30] = col;
                initialCellStatus(document.getElementById(`cell-${x+30}-${y+30}`), col);
            })
        
        })
        liveCellCount = countLiveCells(matrixBoard);
        counter.innerHTML = liveCellCount;
    }
    //Heavy space ship
    function HeavySC(){
        clearBoard();
        var heavySC = [[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,1,1,1,1,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]];
        heavySC.forEach((row,x) => {
            row.forEach((col, y) => {
                matrixBoard[x+30][y+30] = col;
                initialCellStatus(document.getElementById(`cell-${x+30}-${y+30}`), col);
            })
        
        })
        liveCellCount = countLiveCells(matrixBoard);
        counter.innerHTML = liveCellCount;
    }
    //Clock
    function Clock(){
        clearBoard();
        var clock = [[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0],[1,1,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],[1,1,0,1,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,1,0,0,1,0,1,0,1,1,0,0,0,0,0,0,0,0],[0,0,0,1,0,1,0,0,1,0,1,1,0,0,0,0,0,0,0,0],[0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]];
        clock.forEach((row,x) => {
            row.forEach((col, y) => {
                matrixBoard[x+30][y+30] = col;
                initialCellStatus(document.getElementById(`cell-${x+30}-${y+30}`), col);
            })
        
        })
        liveCellCount = countLiveCells(matrixBoard);
        counter.innerHTML = liveCellCount;
    }
    //Glider Gun
    function GliderGun(){
        clearBoard();
        var gliderGun = [[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0],[0,1,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,1,1,0,0,0,0,0,0,0,0,1,0,0,0,1,0,1,1,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]]; 
        gliderGun.forEach((row,x) => {
            row.forEach((col, y) => {
                matrixBoard[x+30][y+40] = col;
                initialCellStatus(document.getElementById(`cell-${x+30}-${y+40}`), col);
            })
        
        })
        liveCellCount = countLiveCells(matrixBoard);
        counter.innerHTML = liveCellCount;
    }
    //R-pentomino
    function Rpentomino(){
        clearBoard();
        var rPentomino = [[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,1,1,0,0,0,0],[0,0,0,1,1,0,0,0,0,0],[0,0,0,0,1,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0]];
        rPentomino.forEach((row,x) => {
            row.forEach((col, y) => {
                matrixBoard[x+30][y+30] = col;
                initialCellStatus(document.getElementById(`cell-${x+30}-${y+30}`), col);
            })
        
        })
        liveCellCount = countLiveCells(matrixBoard);
        counter.innerHTML = liveCellCount;
    }
    //A Corn
    function Acorn(){
        clearBoard();
        var aCorn = [[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,1,0,0,0,0,0,0,0],[0,0,0,0,1,0,0,0,0,0],[0,1,1,0,0,1,1,1,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0]];
         aCorn.forEach((row,x) => {
            row.forEach((col, y) => {
                matrixBoard[x+30][y+30] = col;
                initialCellStatus(document.getElementById(`cell-${x+30}-${y+30}`), col);
            })
        
        })
        liveCellCount = countLiveCells(matrixBoard);
        counter.innerHTML = liveCellCount;
    }
    //Rocket
    function Rocket(){
        clearBoard();
        var rocket = [[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,1,1,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,1,0,0,0,1,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,1,1,0,0,0,1,0,1,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,1,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,1,0,1,1,0,1,0,1,0,1,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]]
         rocket.forEach((row,x) => {
            row.forEach((col, y) => {
                matrixBoard[x+30][y+30] = col;
                initialCellStatus(document.getElementById(`cell-${x+30}-${y+30}`), col);
            })
        
        })
        liveCellCount = countLiveCells(matrixBoard);
        counter.innerHTML = liveCellCount;
    }
}
