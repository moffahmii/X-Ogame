// ======= Elements =======
const menu = document.querySelector('#menu');
const difficultyMenu = document.querySelector('#difficulty-menu');
const playerChoiceMenu = document.querySelector('#player-choice-menu');
const boardEl = document.querySelector('.board');
const title = document.querySelector('#title');
const xPlayer = document.querySelector('#xplayer');
const oPlayer = document.querySelector('#oplayer');
const vsComputerBtn = document.querySelector('#vs-computer');
const vsPlayerBtn = document.querySelector('#vs-player');
const levelBtns = document.querySelectorAll('.level-btn');
const cells = document.querySelectorAll('.cell');
const winnerPopup = document.querySelector('#winner-popup');
const winnerText = document.querySelector('#winner-text');
const playAgainBtn = document.querySelector('#popup-play-again');
const restartBtn = document.querySelector('#popup-restart');

// ======= Game Variables =======
let human = 'X';
let computer = 'O';
let turn = 'X';
let gameMode = '';
let isPauseGame = false;
let difficulty = 'easy';
let inputCells = Array(9).fill('');

const winConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

// ======= Event Listeners =======
window.addEventListener('load', () => {
    playAgainBtn.classList.add('hidden');
    restartBtn.classList.add('hidden');
});

vsComputerBtn.addEventListener('click', () => {
    gameMode = 'computer';
    menu.classList.add('hidden');
    difficultyMenu.classList.remove('hidden');
});

vsPlayerBtn.addEventListener('click', () => {
    gameMode = 'player';
    menu.classList.add('hidden');
    playerChoiceMenu.classList.remove('hidden');
});

levelBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        levelBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        difficulty = btn.dataset.level;
        difficultyMenu.classList.add('hidden');
        playerChoiceMenu.classList.remove('hidden');
    });
});

xPlayer.addEventListener('click', () => choosePlayer('X'));
oPlayer.addEventListener('click', () => choosePlayer('O'));

cells.forEach((cell, index) => {
    cell.addEventListener('click', () => tapCell(cell, index));
});

// ======= Game Functions =======
function choosePlayer(selected) {
    human = selected;
    computer = human === 'X' ? 'O' : 'X';
    xPlayer.classList.toggle('player-active', selected === 'X');
    oPlayer.classList.toggle('player-active', selected === 'O');
    playerChoiceMenu.classList.add('hidden');
    startGame();
}

function startGame() {
    inputCells.fill('');
    boardEl.classList.remove('game-over');
    cells.forEach(cell => {
        cell.textContent = '';
        cell.style.background = '';
        cell.classList.remove('winning-cell', 'x-color', 'o-color');
    });
    boardEl.classList.remove('hidden');
    title.textContent = 'Tic Tac Toe';
    isPauseGame = false;
    turn = 'X';
    boardEl.classList.remove('turn-o');
    boardEl.classList.add('turn-x');
    winnerPopup.classList.remove('show');
    playAgainBtn.classList.add('hidden');
    restartBtn.classList.add('hidden');
    if (gameMode === 'computer' && computer === 'X') computerMove();
}

function tapCell(cell, index) {
    if ((gameMode === 'computer' && turn === computer) || cell.textContent !== '' || isPauseGame) return;
    playMove(cell, index, turn);
    if (!checkWinner()) {
        turn = turn === 'X' ? 'O' : 'X';
        boardEl.classList.toggle('turn-x', turn === 'X');
        boardEl.classList.toggle('turn-o', turn === 'O');
        if (gameMode === 'computer' && turn === computer) computerMove();
    }
}

function playMove(cell, index, symbol) {
    cell.textContent = symbol;
    inputCells[index] = symbol;
    cell.classList.add(symbol === 'X' ? 'x-color' : 'o-color');
}

function checkWinner() {
    for (let i = 0; i < winConditions.length; i++) {
        const [a, b, c] = winConditions[i];
        if (inputCells[a] && inputCells[a] === inputCells[b] && inputCells[a] === inputCells[c]) {
            declareWinner(inputCells[a], [a, b, c]);
            return true;
        }
    }
    if (inputCells.every(c => c !== '')) {
        declareDraw();
        return true;
    }
    return false;
}

function declareWinner(symbol, indices) {
    title.textContent = `${symbol} WINS!`;
    isPauseGame = true;
    boardEl.classList.add('game-over');
    indices.forEach(i => cells[i].classList.add('winning-cell'));
    winnerText.textContent = ` Congratulations ${symbol} ! `;
    winnerPopup.className = '';
    winnerPopup.classList.add('show', `${symbol.toLowerCase()}-win`);
    playAgainBtn.classList.remove('hidden');
    restartBtn.classList.remove('hidden');
    setTimeout(() => {
        winnerPopup.classList.remove('show');
        isPauseGame = false;
    }, 2000);
}

function declareDraw() {
    title.textContent = 'DRAW !';
    isPauseGame = true;
    boardEl.classList.add('Game-Over');
    winnerText.textContent = ` It's a Draw! `;
    winnerPopup.className = '';
    winnerPopup.classList.add('show', 'draw');
    playAgainBtn.classList.remove('hidden');
    restartBtn.classList.remove('hidden');
    setTimeout(() => {
        winnerPopup.classList.remove('show');
        isPauseGame = false;
    }, 2000);
}

playAgainBtn.addEventListener('click', () => {
    inputCells.fill('');
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('winning-cell', 'x-color', 'o-color');
    });
    boardEl.classList.remove('game-over', 'hidden');
    isPauseGame = false;
    turn = 'X';
    boardEl.classList.remove('turn-o');
    boardEl.classList.add('turn-x');
    choosePlayer(human);
    playAgainBtn.classList.add('hidden');
    restartBtn.classList.add('hidden');
});

restartBtn.addEventListener('click', () => {
    resetGame();
    playAgainBtn.classList.add('hidden');
    restartBtn.classList.add('hidden');
});

// ======= AI Functions =======
function getEmptyIndices(board) {
    return board.map((val, index) => val === '' ? index : null).filter(v => v !== null);
}

function checkTerminalState(board) {
    for (const [a, b, c] of winConditions) {
        if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
    }
    if (getEmptyIndices(board).length === 0) return 'Draw';
    return null;
}

function minimax(newBoard, player) {
    const terminal = checkTerminalState(newBoard);
    if (terminal) {
        if (terminal === computer) return { score: 10 };
        if (terminal === human) return { score: -10 };
        return { score: 0 };
    }
    const availableMoves = getEmptyIndices(newBoard);
    const moves = [];
    for (let i = 0; i < availableMoves.length; i++) {
        const move = {};
        move.index = availableMoves[i];
        newBoard[availableMoves[i]] = player;
        move.score = (player === computer ? minimax(newBoard, human) : minimax(newBoard, computer)).score;
        newBoard[availableMoves[i]] = '';
        moves.push(move);
    }
    let bestMove;
    if (player === computer) {
        let bestScore = -Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }
    return moves[bestMove];
}

function findBestMove(symbol) {
    for (let [a, b, c] of winConditions) {
        let line = [inputCells[a], inputCells[b], inputCells[c]];
        if (line.filter(v => v === symbol).length === 2 && line.includes('')) {
            return [a, b, c][line.indexOf('')];
        }
    }
    return null;
}

function findRandomMove() {
    const emptyCells = getEmptyIndices(inputCells);
    if (emptyCells.length > 0) return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    return null;
}

function computerMove() {
    if (isPauseGame) return;
    isPauseGame = true;
    setTimeout(() => {
        let move = null;
        if (difficulty === 'easy') move = findRandomMove();
        else if (difficulty === 'medium') move = findBestMove(computer) || findBestMove(human) || findRandomMove();
        else if (difficulty === 'hard') move = minimax([...inputCells], computer).index;
        if (move === null) move = findRandomMove();
        playMove(cells[move], move, computer);
        if (!checkWinner()) {
            turn = human;
            isPauseGame = false;
            boardEl.classList.toggle('turn-x', turn === 'X');
            boardEl.classList.toggle('turn-o', turn === 'O');
        }
    }, 600);
}

// ======= Reset Game =======
function resetGame() {
    boardEl.classList.add('hidden');
    menu.classList.remove('hidden');
    difficultyMenu.classList.add('hidden');
    playerChoiceMenu.classList.add('hidden');
    levelBtns.forEach(b => b.classList.remove('active'));
    xPlayer.classList.remove('player-active');
    oPlayer.classList.remove('player-active');
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('winning-cell', 'x-color', 'o-color');
    });
    winnerPopup.classList.remove('show');
    title.textContent = "Bored ? Let's play!";
    isPauseGame = false;
}
