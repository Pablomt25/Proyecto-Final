<template>
  <div class="memory-game">
    <h1>Juego de Memoria</h1>
    <div class="timer">Tiempo restante: {{ timeLeft }} segundos</div>
    <div class="board">
      <div
        v-for="(card, index) in cards"
        :key="index"
        class="card"
        :class="{ flipped: card.flipped, matched: card.matched }"
        @click="flipCard(index)"
      >
        <div class="card-inner">
          <div class="card-front">?</div>
          <div class="card-back">{{ card.value }}</div>
        </div>
      </div>
    </div>
    <div v-if="gameOver" class="game-over-message">
      <p>{{ gameOverMessage }}</p>
      <button @click="restartGame">Reiniciar Juego</button>
    </div>
  </div>
</template>

<script>
import { db, auth } from '../firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

export default {
  data() {
    return {
      cards: [
        { value: '1', flipped: false, matched: false },
        { value: '2', flipped: false, matched: false },
        { value: '3', flipped: false, matched: false },
        { value: '4', flipped: false, matched: false },
        { value: '5', flipped: false, matched: false },
        { value: '6', flipped: false, matched: false },
        { value: '7', flipped: false, matched: false },
        { value: '8', flipped: false, matched: false },
        { value: '1', flipped: false, matched: false },
        { value: '2', flipped: false, matched: false },
        { value: '3', flipped: false, matched: false },
        { value: '4', flipped: false, matched: false },
        { value: '5', flipped: false, matched: false },
        { value: '6', flipped: false, matched: false },
        { value: '7', flipped: false, matched: false },
        { value: '8', flipped: false, matched: false },
      ],
      flippedCards: [],
      timeLeft: 60,
      gameOver: false,
      gameOverMessage: '',
      timer: null,
      userName: '', // Agregamos userName para almacenar el nombre del usuario
    };
  },
  mounted() {
    this.shuffleCards();
    this.startTimer();
    this.getUserName();
  },
  methods: {
    flipCard(index) {
      if (this.flippedCards.length === 2 || this.cards[index].flipped || this.cards[index].matched || this.gameOver) {
        return;
      }
      this.cards[index].flipped = true;
      this.flippedCards.push(index);
      if (this.flippedCards.length === 2) {
        setTimeout(this.checkMatch, 1000); // Delay to show the second card before checking
      }
    },
    checkMatch() {
      const [firstIndex, secondIndex] = this.flippedCards;
      if (this.cards[firstIndex].value === this.cards[secondIndex].value) {
        this.cards[firstIndex].matched = true;
        this.cards[secondIndex].matched = true;
        if (this.cards.every(card => card.matched)) {
          this.gameOver = true;
          this.gameOverMessage = `¡Ganaste! Puntos: ${this.timeLeft}`;
          this.saveScore(this.timeLeft);
          clearInterval(this.timer);
        }
      } else {
        this.cards[firstIndex].flipped = false;
        this.cards[secondIndex].flipped = false;
      }
      this.flippedCards = [];
    },
    shuffleCards() {
      this.cards = this.shuffle([...this.cards]);
    },
    shuffle(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    },
    restartGame() {
      this.cards.forEach(card => {
        card.flipped = false;
        card.matched = false;
      });
      this.flippedCards = [];
      this.shuffleCards();
      this.timeLeft = 60;
      this.gameOver = false;
      this.gameOverMessage = '';
      clearInterval(this.timer);
      this.startTimer();
    },
    startTimer() {
      this.timer = setInterval(() => {
        this.timeLeft--;
        if (this.timeLeft === 0) {
          clearInterval(this.timer);
          this.gameOver = true;
          this.gameOverMessage = '¡Tiempo agotado! Puntos: 0';
          this.saveScore(0);
        }
      }, 1000);
    },
    async saveScore(points) {
      const user = auth.currentUser;
      if (user) {
        try {
          await addDoc(collection(db, 'ranking'), {
            userId: user.uid,
            nombre: this.userName, // Utilizamos this.userName en lugar de user.displayName
            puntos: points,
            fecha: serverTimestamp(),
            juego: 'Juego de Memoria'
          });
        } catch (error) {
          console.error("Error al guardar la puntuación: ", error);
        }
      }
    },
    getUserName() {
      const user = auth.currentUser;
      if (user) {
        const atIndex = user.email.indexOf('@');
        this.userName = atIndex !== -1 ? user.email.slice(0, atIndex) : 'Anónimo';
      }
    },
  },
};
</script>

<style scoped>
.memory-game {
  text-align: center;
}

.timer {
  font-size: 20px;
  margin-bottom: 20px;
}

.board {
  display: grid;
  grid-template-columns: repeat(4, 100px);
  gap: 10px;
  justify-content: center;
  margin: 0 auto;
}

.card {
  width: 100px;
  height: 100px;
  perspective: 1000px;
  cursor: pointer;
}

.card-inner {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s;
}

.card.flipped .card-inner {
  transform: rotateY(180deg);
}

.card-front, .card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
}

.card-front {
  background-color: #81b3dc;
  color: #fff;
}

.card-back {
  background-color: #fff;
  border: 2px solid #2196f3;
  color: #000;
  transform: rotateY(180deg);
}

.card.matched .card-back {
  background-color: #8bc34a;
  border-color: #8bc34a;
  color: #fff;
}

.game-over-message {
  margin-top: 20px;
}

/* Media Queries */
@media screen and (max-width: 768px) {
  .board {
    grid-template-columns: repeat(2, 1fr); /* Dos columnas por fila en pantallas más pequeñas */
  }

  .card {
    width: 120px; /* Ancho de las cartas */
    height: 120px; /* Alto de las cartas */
  }

  .card-inner {
    width: 100%; /* Ancho del contenido interno de la carta */
    height: 100%; /* Alto del contenido interno de la carta */
  }

  .card-front, .card-back {
    font-size: 20px; /* Tamaño de la fuente en las caras de las cartas */
  }
}

@media screen and (max-width: 480px) {
  .board {
    grid-template-columns: repeat(2, 1fr); /* Dos columnas por fila en pantallas más pequeñas */
  }

  .card {
    width: 100px; /* Ancho de las cartas */
    height: 100px; /* Alto de las cartas */
  }

  .card-inner {
    width: 100%; /* Ancho del contenido interno de la carta */
    height: 100%; /* Alto del contenido interno de la carta */
  }

  .card-front, .card-back {
    font-size: 16px; /* Tamaño de la fuente en las caras de las cartas */
  }
}
</style>
