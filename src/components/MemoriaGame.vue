<template>
  <div class="memory-game">
    <h1>Juego de Memoria</h1>
    <div class="timer">Tiempo restante: {{ timeLeft }} segundos</div>
    <div class="board">
      <div v-for="(card, index) in cards" :key="index" class="card"
        :class="{ flipped: card.flipped, matched: card.matched }" @click="flipCard(index)">
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
        this.checkMatch();
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
        setTimeout(() => {
          this.cards[firstIndex].flipped = false;
          this.cards[secondIndex].flipped = false;
        }, 1000); 
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
            nombre: this.userName,
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

<style>
@import '../assets/CSS/memoria.css';
</style>
