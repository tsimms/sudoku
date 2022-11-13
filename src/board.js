const Element = require("./element");
const fs = require('fs');


class Board {
    constructor() {
        this.element = Array
            .from({ length: 9 }, () => Array.from({ length: 9 }, () => new Element()))
    }

    elements = () => this.element;
    show = () => `[ ${this.element.map((rows,i) => (`[ ${this.getRowVals(i+1).toString()} ]`) )} ]`;
    get = (col, row) => this.element[row-1][col-1];
    #getBox = ({x, y}) => this.element
        .map((row, yIndex) => row.map((col, xIndex) => ({...col, col:xIndex+1, row:yIndex+1})))
        .slice((y-1)*3, y*3).map(row => row.slice((x-1)*3, x*3))
    #getRow = (row) => this.element.slice(row-1, row)[0];
    #getCol = (col) => this.element.map(row => row[col-1]);

    getBoxCoord = (col, row) => ({ x: Math.trunc((col+2)/3), y: Math.trunc((row+2)/3) });
    getBoxVals = ({x, y}) => this.#getBox({x, y}).map(rows => rows.map(col => col.get()));
    getRowVals = (row) => this.#getRow(row).map(e => e.get());
    getColVals = (col) => this.#getCol(col).map(e => e.get());

    set = (col, row, number) => { this.get(col, row).set(number); return this; }
    load = (file) => {
        const contents = fs.readFileSync(file);
        const json = JSON.parse(contents);
        json.forEach((row, y) => row.forEach((cell, x) => {
            if (cell) { this.set(x+1, y+1, cell); }
        }))
    }
    

    #getEmptyList = () => {
        const list = [];
        this.element.forEach((r, rIndex) => r.forEach((c, cIndex) => {
            const col = cIndex+1;
            const row = rIndex+1;
            if (!this.get(col,row).isSet())
                list.push({ col, row });
        }));
        return list;
    }

    getEmptyCount = () => this.#getEmptyList().length;
    setPossible = () => {
        const empties = this.#getEmptyList();
        empties.forEach(({ col, row }) => {
            const numbersInRow = this.getRowVals(row).filter(Number);
            const numbersInCol = this.getColVals(col).filter(Number);
            const numbersInBox = this.getBoxVals(
                    this.getBoxCoord(col, row)
                ).flat().filter(Number);
            const takenNumbers = [...new Set([...numbersInRow, ...numbersInCol, ...numbersInBox])];
            takenNumbers.forEach((number) => this.get(col, row).cantBe(number));
        })
    }

    getAbsolutes = () => {
        const empties = this.#getEmptyList();
        return empties.filter(({ col, row }) => this.get(col, row).hasAbsolute())
    }

    setAbsolutes = () => {
        this.getAbsolutes().forEach(({ col, row }) => {
            const element = this.get(col, row);
            console.log(`Setting (${col}, ${row}) to ${element.getPossible()[0]}`);
            element.setAbsolute();
        })
    }

    #testOtherEmpties = (col, row) => {
        const empties = this.#getEmptyList();
        const testPossible = (list, test) => {
            const testVal = list.map(value => {
                const { val, c, r } = value;
                if (!val) {
                    const element = this.get(c, r);
                    if (element.getPossible().indexOf(test) > -1) {
                        return true;
                    }
                }
            }).some(test => test);
            if (!testVal) {
                console.log(`Inferred that (${col}, ${row}) has to be ${test}.`);
                this.set(col, row, test);
                return true;
            }
        }
        
        const testNotPossible = (col, row, test) => {
            const baseBox = this.getBoxCoord(col, row);
            const testCol = this.#getCol(col)
                .map((cell, index) => ({ ...cell, c: col, r: index+1 }))
                .filter((cell, index) => (
                    JSON.stringify(this.getBoxCoord(col, index+1)) !== JSON.stringify(baseBox)
                ))
                .filter(cell => ( !cell.isSet() ))
                .filter(cell => ( cell.getPossible().includes(test) ))
                .map(cell => {
                    const { c, r } = cell;
                    const boxList = this.#getBox(this.getBoxCoord(c, r)).flat()
                        .filter(cell => !cell.isSet())
                        .filter(cell => cell.getPossible().includes(test))
                    const result = boxList
                        .every((cell) => (cell.col === col));
                    return result
                })
                .some(t => t)
            if (testCol) {
                console.log(`Found at (${col}, ${row}), there's a column restriction on ${test}`);
                this.get(col, row).cantBe(test);
            }

            const testRow = this.#getRow(row)
                .map((cell, index) => ({ ...cell, c: index+1, r: row }))
                .filter((cell, index) => (
                    JSON.stringify(this.getBoxCoord(index+1, row)) !== JSON.stringify(baseBox)
                ))
                .filter(cell => ( !cell.isSet() ))
                .filter(cell => ( cell.getPossible().includes(test) ))
                .map(cell => {
                    const { c, r } = cell;
                    const boxList = this.#getBox(this.getBoxCoord(c, r)).flat()
                        .filter(cell => !cell.isSet())
                        .filter(cell => cell.getPossible().includes(test))
                    const result = boxList
                        .every((cell) => (cell.row === row));
                    return result
                })
                .some(t => t)
            if (testRow) {
                console.log(`Found at (${col}, ${row}), there's a row restriction on ${test}`);
                this.get(col, row).cantBe(test);
            }

        }

        let found = false;
        const possibles = this.get(col, row).getPossible();
        possibles.every(possible => {

            testNotPossible(col, row, possible);

            if (testPossible(this.getColVals(col)
                .map((cell, i) => ({ val: cell, c: col, r: i+1 }))
                .filter(cell => !(cell.c === col && cell.r === row)), possible)
            ) {
                found = true;
                return false;
            }
            
            if (testPossible(this.getRowVals(row)
                .map((cell, i) => ({ val: cell, c: i+1, r: row }))
                .filter(cell => !(cell.c === col && cell.r === row)), possible)
            ) {
                found = true;
                return false;
            }
            
            if (testPossible(this.getBoxVals(this.getBoxCoord(col, row)).flat()
                .map((cell, i) => ({
                    val: cell, 
                    c: (i % 3)+ Math.trunc((col-1) / 3)*3 + 1, 
                    r: Math.trunc(i / 3)+ Math.trunc((row-1) / 3)*3 + 1
                }))
                .filter(cell => !(cell.c === col && cell.r === row)), possible)
            ) {
                found = true;
                return false;
            }
            return true;
        });
        return found;
    }

    checkOtherEmpties = () => {
        const empties = this.#getEmptyList();
        for (let i = 0; i < empties.length; i++) {
            const {col, row} = empties[i];
            if (this.#testOtherEmpties(col, row))
                return true;
        };
    }

    hasFailed = () => {
        const empties = this.#getEmptyList();
        return empties.some(({ col, row }) => this.get(col, row).hasFailed())
    }

}

module.exports = Board;