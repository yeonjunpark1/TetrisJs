document.addEventListener('DOMContentLoaded', () => {
  //create divs for individual squares
  for (var i = 0; i < 210; i++) {
    if (i <= 199) {
      const d = document.createElement('div');
      document.querySelector('.grid').append(d);
    } else {
      //create divs to create a wall on the bottom of the play area to know when to stop dropping down.
      const d = document.createElement('div');
      d.className = 'taken';
      document.querySelector('.grid').append(d);
    }
  }
  //create divs for place to show upcoming next piece
  for (var i = 0; i < 16; i++) {
    const d = document.createElement('div');
    document.querySelector('.mini-grid').append(d);
  }
  //width of the play screen. 10 divs wide
  const width = 10;
  //get all divs in play grid and call them squares
  const grid = document.querySelector('.grid');
  let squares = Array.from(document.querySelectorAll('.grid div'));
  const scoreDisplay = document.querySelector('#score');
  const startButton = document.querySelector('#start-button');
  let timerId;
  let nextRandom = 0;
  let score = 0;

  //colors of play blocks
  const colors = ['#D62828', '#F77F00', '#fcbf49', '#eae2b7', '#027878'];

  //all possible rotations of each piece type
  const lTetromino = [
    [1, width + 1, width * 2 + 1, 2],
    [width, width + 1, width + 2, width * 2 + 2],
    [1, width + 1, width * 2 + 1, width * 2],
    [width, width * 2, width * 2 + 1, width * 2 + 2],
  ];

  const zTetromino = [
    [0, width, width + 1, width * 2 + 1],
    [width + 1, width + 2, width * 2, width * 2 + 1],
    [0, width, width + 1, width * 2 + 1],
    [width + 1, width + 2, width * 2, width * 2 + 1],
  ];

  const tTetromino = [
    [1, width, width + 1, width + 2],
    [1, width + 1, width + 2, width * 2 + 1],
    [width, width + 1, width + 2, width * 2 + 1],
    [1, width, width + 1, width * 2 + 1],
  ];

  const oTetromino = [
    [0, 1, width, width + 1],
    [0, 1, width, width + 1],
    [0, 1, width, width + 1],
    [0, 1, width, width + 1],
  ];

  const iTetromino = [
    [1, width + 1, width * 2 + 1, width * 3 + 1],
    [width, width + 1, width + 2, width + 3],
    [1, width + 1, width * 2 + 1, width * 3 + 1],
    [width, width + 1, width + 2, width + 3],
  ];

  // every type of tetrimino.
  const tetrominos = [
    lTetromino,
    zTetromino,
    tTetromino,
    oTetromino,
    iTetromino,
  ];

  let currentPosition = 4;
  let currentRotation = 0;
  //select a random piece
  let randomPiece = Math.floor(Math.random() * tetrominos.length);
  //variable for current active piece
  let current = tetrominos[randomPiece][currentRotation];

  //draw first rotation in first tetromino
  //actually draw the piece on the screen
  function draw() {
    current.forEach((index) => {
      squares[currentPosition + index].classList.add('tetromino');
      squares[currentPosition + index].style.backgroundColor =
        colors[randomPiece];
    });
  }
  // undraw the piece so it can be redrawn in the next location. ex. as it travels down. you undraw and then draw again in the new location
  function undraw() {
    current.forEach((index) => {
      squares[currentPosition + index].classList.remove('tetromino');
      squares[currentPosition + index].style.backgroundColor = '';
    });
  }

  // event listener for the key inputs W,A,S,D and Space
  document.addEventListener('keyup', (e) => {
    if (e.keyCode === 65) {
      moveLeft();
    } else if (e.keyCode === 68) {
      moveRight();
    } else if (e.keyCode === 87) {
      rotate();
    } else if (e.keyCode === 83) {
      moveDown();
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.keyCode === 77) {
      speedDown();
    }
  });

  //automatic drop down
  function moveDown() {
    undraw();
    currentPosition += width;
    draw();
    halt();
  }

  //
  function halt() {
    if (
      //index refers to each index of the squares that make the tetromino pieces from the 'current' object.
      //check if the square right below the current indexes are next to any other squares of the taken class, in which case means
      //the current block should also stop and be added to the taken class.
      current.some((index) =>
        squares[currentPosition + index + width].classList.contains('taken')
      )
    ) {
      current.forEach((index) =>
        squares[currentPosition + index].classList.add('taken')
      );
      //start a new tetromino falling
      //set up next piece
      randomPiece = nextRandom;
      nextRandom = Math.floor(Math.random() * tetrominos.length);
      current = tetrominos[randomPiece][currentRotation];
      currentPosition = 4;
      draw();
      displayShape();
      addScore();
      gameOver();
    }
  }

  function speedDown() {
    undraw();

    if (
      //index refers to each index of the squares that make the tetromino pieces from the 'current' object.
      //check if the square right below the current indexes are next to any other squares of the taken class, in which case means
      //the current block should also stop and be added to the taken class.
      current.some((index) =>
        squares[currentPosition + index + width * 2].classList.contains('taken')
      )
    ) {
      currentPosition += width;

      draw();
      halt();
    } else {
      currentPosition += width * 2;
      draw();
      halt();
    }
  }

  function moveLeft() {
    undraw();
    //check if any of the squares in the piece are touching the left wall.
    const isLeftEdge = current.some(
      (index) => (currentPosition + index) % width === 0
    );
    //if there is non on the wall, then move left one by subtracting one from current position, then draw into new position on line 168
    if (!isLeftEdge) {
      currentPosition -= 1;
    }
    //if the block is on a block that is already halted then move right one
    if (
      current.some((index) =>
        squares[currentPosition + index].classList.contains('taken')
      )
    ) {
      currentPosition += 1;
    }
    draw();
  }
  //same as left, but for right
  function moveRight() {
    undraw();
    const isRightEdge = current.some(
      (index) => (currentPosition + index) % width === width - 1
    );
    if (!isRightEdge) {
      currentPosition += 1;
    }
    if (
      current.some((index) =>
        squares[currentPosition + index].classList.contains('taken')
      )
    ) {
      currentPosition -= 1;
    }
    draw();
  }
  //returns bool value if at right wall
  function isAtRight() {
    return current.some((index) => (currentPosition + index + 1) % width === 0);
  }
  // or left
  function isAtLeft() {
    return current.some((index) => (currentPosition + index) % width === 0);
  }

  function checkRotatedPosition(P) {
    P = P || currentPosition; //get current position.  Then, check if the piece is near the left side.
    if ((P + 1) % width < 4) {
      // checkin to see if after rotation, a portion of the block has wrapped over to the other side.
      //add 1 because the position index can be 1 less than where the piece is (with how they are indexed).
      if (isAtRight()) {
        //use actual position to check if it's flipped over to right side
        currentPosition += 1; //if so, add one to wrap it back around
        checkRotatedPosition(P); //check again.  Pass position from start, since long block might need to move more.
      }
    } else if (P % width > 5) {
      if (isAtLeft()) {
        currentPosition -= 1;
        checkRotatedPosition(P);
      }
    }
  }

  //When 'W' key is pressed, the piece rotates
  function rotate() {
    undraw();
    currentRotation++; //get next rotation by using index in next element of array that holds all possible rotations of the piece
    if (currentRotation === current.length) {
      currentRotation = 0; //if at the last permutation of rotations, restart it by going back to the first rotation of the same block
    }
    current = tetrominos[randomPiece][currentRotation];
    checkRotatedPosition(); //check to see rotated block has not wrapped around to the other edge of play grid
    draw();
  }

  const displaySquares = document.querySelectorAll('.mini-grid div'); //mini grid for displaying upcoming next piece
  const displayWidth = 4;
  let displayIndex = 1;

  const upNext = [
    [1, displayWidth + 1, displayWidth * 2 + 1, 2],
    [0, displayWidth, displayWidth + 1, displayWidth * 2 + 1],
    [1, displayWidth, displayWidth + 1, displayWidth + 2],
    [0, 1, displayWidth, displayWidth + 1],
    [1, displayWidth + 1, displayWidth * 2 + 1, displayWidth * 3 + 1],
  ];

  function displayShape() {
    displaySquares.forEach((square) => {
      square.classList.remove('tetromino');
      square.style.backgroundColor = '';
    });
    upNext[nextRandom].forEach((index) => {
      displaySquares[displayIndex + index].classList.add('tetromino');
      displaySquares[displayIndex + index].style.backgroundColor =
        colors[nextRandom];
    });
  }

  startButton.addEventListener('click', () => {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    } else {
      draw();
      timerId = setInterval(moveDown, 800);
      nextRandom = Math.floor(Math.random() * tetrominos.length);
      displayShape();
    }
  });
  function addScore() {
    for (let i = 0; i < 199; i += width) {
      const row = [
        i,
        i + 1,
        i + 2,
        i + 3,
        i + 4,
        i + 5,
        i + 6,
        i + 7,
        i + 8,
        i + 9,
      ];

      if (row.every((index) => squares[index].classList.contains('taken'))) {
        score += 10;
        scoreDisplay.innerHTML = score;
        row.forEach((index) => {
          squares[index].classList.remove('taken');
          squares[index].classList.remove('tetromino');
          squares[index].style.backgroundColor = '';
        });
        const squaresRemoved = squares.splice(i, width);
        squares = squaresRemoved.concat(squares);
        squares.forEach((cell) => grid.appendChild(cell));
      }
    }
  }
  function gameOver() {
    if (
      current.some((index) =>
        squares[currentPosition + index].classList.contains('taken')
      )
    ) {
      scoreDisplay.innerHTML = 'Game Over!';
      alert('Final Score ' + score + '. Game Over!');
      clearInterval(timerId);
    }
  }
});
