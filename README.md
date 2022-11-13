# sudoku
A Sudoku solver

This app was meant to help solve Sudoku puzzles. It uses three strategies for selecting definitive number choices,
and once exhausted, will apply a brute force algorithm to test potential permutations until failure or success.

To run:

```
npm start [board_filename]
```
...where `board_filename` is a path to the JSON file containing the board.