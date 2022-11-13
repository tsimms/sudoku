const Board = require("./src/board");

const boardFile = process.argv[2];
if (!boardFile) {
    console.error("Board file not found. Please specify path to file containing the board.");
    process.exit();
}
const board = new Board();
board.load(boardFile);

const nextMove = (col, row, val) => {
    if (!board.get(col, row).isSet()) {
        board.set(col, row, val);
        return true;
    }
}

let repeat = true;
while (repeat) {
    repeat = false;
    board.setPossible();
    if (board.getAbsolutes().length > 0) {
        console.log("Absolutes found.");
        board.setAbsolutes();
        repeat = true;
    } else {
        console.log("Ambiguous. Checking other empties.");
        if (board.checkOtherEmpties())
            repeat = true;
    }
    if (!board.hasFailed()) {
        console.log("Board still alive!");
    } else {
        console.log("Uh oh... borked.");
        repeat = false;
        return;
    }
    console.log( board.show() );

    // Add solution steps here
    //if (!repeat && nextMove(col,row,number))
    //   repeat = true;

    if (!repeat) {
        console.log(board.elements()
            .map((r,y) => r.map((e, x) => ({ ...e, col:x+1, row:y+1 })))
            .flat().filter(e => !e.isSet()).filter(e => e.getPossible().length < 3) )
    }
    console.log( board.show() );
    console.log(board.getEmptyCount());
}
