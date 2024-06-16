<template>
  <div class="tic-tac-toe">
    <h1>3 en Raya</h1>
    <div class="difficulty-buttons">
      <button v-for="level in difficulties" :key="level" @click="setDifficulty(level)"
        :class="{ selected: difficulty === level }">
        {{ capitalize(level) }}
      </button>
    </div>
    <div class="board">
      <div v-for="(cell, index) in board" :key="index" class="cell" @click="makeMove(index)">
        {{ cell }}
      </div>
    </div>
    <div v-if="gameOver" class="game-over-message">
      <p>{{ gameOverMessage }}</p>
      <button @click="resetGame">Jugar de nuevo</button>
    </div>
  </div>
</template>

<script>
import { db, auth } from '../firebase';
import { addDoc, collection, serverTimestamp, getDoc, doc } from 'firebase/firestore';

export default {
  data() {
    return {
      board: Array(9).fill(''),
      currentPlayer: 'X',
      difficulty: 'Fácil',
      gameOver: false,
      gameOverMessage: '',
      difficulties: ['Fácil', 'Medio', 'Imposible'],
    };
  },
  methods: {
    capitalize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    },
    setDifficulty(level) {
      this.difficulty = level;
      this.resetGame();
    },
    async makeMove(index) {
      if (this.board[index] === '' && !this.gameOver) {
        this.board.splice(index, 1, this.currentPlayer);
        if (this.checkWin(this.currentPlayer)) {
          this.gameOverMessage = `${this.currentPlayer} gana!`;
          this.gameOver = true;
          if (this.currentPlayer === 'X') {
            await this.calculateScoreAndSave();
          }
        } else if (this.board.every(cell => cell !== '')) {
          this.gameOverMessage = 'Empate!';
          this.gameOver = true;
        } else {
          this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
          if (this.currentPlayer === 'O') {
            this.computerMove();
          }
        }
      }
    },
    computerMove() {
      setTimeout(() => {
        let move;
        switch (this.difficulty) {
          case 'Fácil':
            move = this.randomMove();
            break;
          case 'Medio':
            move = Math.random() > 0.5 ? this.randomMove() : this.bestMove();
            break;
          case 'Imposible':
            move = this.bestMove();
            break;
        }
        this.board.splice(move, 1, 'O');
        if (this.checkWin('O')) {
          this.gameOverMessage = 'O gana!';
          this.gameOver = true;
        } else if (this.board.every(cell => cell !== '')) {
          this.gameOverMessage = 'Empate!';
          this.gameOver = true;
        } else {
          this.currentPlayer = 'X';
        }
      }, 500);
    },
    randomMove() {
      const emptyIndices = this.board
        .map((cell, index) => (cell === '' ? index : null))
        .filter(val => val !== null);
      return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    },
    bestMove() {
      const emptyIndices = this.board
        .map((cell, index) => (cell === '' ? index : null))
        .filter(val => val !== null);
      let bestScore = -Infinity;
      let move;
      for (const index of emptyIndices) {
        this.board[index] = 'O';
        const score = this.minimax(this.board, 0, false);
        this.board[index] = '';
        if (score > bestScore) {
          bestScore = score;
          move = index;
        }
      }
      return move;
    },
    minimax(board, depth, isMaximizing) {
      const scores = { 'X': -1, 'O': 1, tie: 0 };
      const result = this.checkWinner(board);
      if (result !== null) {
        return scores[result];
      }
      if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < board.length; i++) {
          if (board[i] === '') {
            board[i] = 'O';
            const score = this.minimax(board, depth + 1, false);
            board[i] = '';
            bestScore = Math.max(score, bestScore);
          }
        }
        return bestScore;
      } else {
        let bestScore = Infinity;
        for (let i = 0; i < board.length; i++) {
          if (board[i] === '') {
            board[i] = 'X';
            const score = this.minimax(board, depth + 1, true);
            board[i] = '';
            bestScore = Math.min(score, bestScore);
          }
        }
        return bestScore;
      }
    },
    checkWinner(board) {
      const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], 
        [0, 3, 6], [1, 4, 7], [2, 5, 8], 
        [0, 4, 8], [2, 4, 6],         
      ];
      for (const pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
          return board[a];
        }
      }
      if (board.every(cell => cell !== '')) {
        return 'tie';
      }
      return null;
    },
    checkWin(player) {
      const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8], 
        [0, 4, 8], [2, 4, 6],          
      ];
      return winPatterns.some(pattern =>
        pattern.every(index => this.board[index] === player)
      );
    },
    async calculateScoreAndSave() {
      let score;
      switch (this.difficulty) {
        case 'Fácil':
          score = 1;
          break;
        case 'Medio':
          score = 3;
          break;
        case 'Imposible':
          score = 30;
          break;
      }

      const user = auth.currentUser;
      if (user) {
        try {
          let userName = user.email.split('@')[0]; 

          await addDoc(collection(db, 'ranking'), {
            userId: user.uid,
            nombre: userName,
            puntos: score,
            fecha: serverTimestamp(),
            juego: '3 en Raya'
          });
        } catch (error) {
          console.error("Error al guardar la puntuación: ", error);
        }
      }
    },
    resetGame() {
      this.board = Array(9).fill('');
      this.currentPlayer = 'X';
      this.gameOver = false;
      this.gameOverMessage = '';
    },
  },
};
</script>



<style scoped>
.tic-tac-toe {
  text-align: center;
  font-family: Arial, sans-serif;
}

.difficulty-buttons {
  margin-bottom: 20px;
}

.difficulty-buttons button {
  padding: 10px 20px;
  margin: 5px;
  border: none;
  border-radius: 5px;
  background-color: #2196f3;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s, color 0.3s;
}

.difficulty-buttons button:hover {
  background-color: #ddd;
}

.difficulty-buttons button.selected {
  background-color: #0d61a5;
  color: white;
}

.board {
  display: grid;
  grid-template-columns: repeat(3, 100px);
  gap: 5px;
  margin: 0 auto;
}

.cell {
  width: 100px;
  height: 100px;
  background-color: #ddd;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2rem;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.3s;
}

.cell:hover {
  background-color: #ccc;
}

.game-over-message {
  margin-top: 20px;
}

.game-over-message button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  background-color: #4caf50;
  color: white;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.game-over-message button:hover {
  background-color: #45a049;
}

@media screen and (max-width: 480px) {

  h1{
    margin-top: 30px;
  }

}
</style>
