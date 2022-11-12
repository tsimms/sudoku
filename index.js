const Board = require("./src/board");

const board = new Board();
board
    .set(3,1,8) .set(3,2,3) .set(3,3,9)
    .set(3,4,4) .set(3,5,6)
    .set(2,7,3) .set(1,9,9)
    .set(4,2,4) .set(5,2,5) .set(5,3,7)
    .set(4,4,5)
    .set(5,7,8) .set(6,7,5) .set(5,8,2) .set(6,8,1) .set(5,9,4)
    .set(7,1,4) .set(8,1,9) .set(9,2,8)
    .set(8,5,2) .set(9,5,4)
    .set(8,7,4) .set(9,7,2) .set(8,8,6) .set(9,8,3) .set(8,9,1) .set(9,9,7)

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
