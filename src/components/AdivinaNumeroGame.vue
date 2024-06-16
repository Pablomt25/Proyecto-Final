<template>
  <div class="game-container">
    <h1>Adivina el Número entre 1 y 100</h1>
    <p v-if="gameOver" class="game-over-message">¡El juego ha terminado! El número era: {{ numberToGuess }}</p>
    <p v-else-if="guessedCorrectly" class="win-message"><span>¡Felicidades! Adivinaste el número {{ numberToGuess
        }}.</span><br><br> Puntuación: {{ score }} puntos</p>
    <div v-else>
      <p v-if="message" class="hint-message">{{ message }}</p>
      <div class="numbers-grid" :class="{ 'five-columns': screenWidth <= 600, 'ten-columns': screenWidth > 600 }">
        <button v-for="num in numbers" :key="num" :disabled="disabledNumbers.includes(num)"
          :class="{ 'disabled': disabledNumbers.includes(num) }" @click="checkGuess(num)">
          {{ num }}
        </button>
      </div>
      <p>Intentos: {{ attempts }}</p>
    </div>
    <button v-if="gameOver || guessedCorrectly" @click="resetGame">Volver a Jugar</button>
  </div>
</template>

<script>
import { db, auth } from '../firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

export default {
  data() {
    return {
      numberToGuess: 0,
      guess: null,
      attempts: 0,
      score: 0,
      message: '',
      gameOver: false,
      guessedCorrectly: false,
      numbers: Array.from({ length: 100 }, (_, i) => i + 1),
      disabledNumbers: [],
      screenWidth: window.innerWidth
    };
  },
  mounted() {
    this.resetGame();
    window.addEventListener('resize', this.updateScreenWidth);
  },
  destroyed() {
    window.removeEventListener('resize', this.updateScreenWidth);
  },
  methods: {
    generateNumber() {
      this.numberToGuess = Math.floor(Math.random() * 100) + 1;
    },
    checkGuess(num) {
      this.guess = num;
      this.attempts++;
      if (this.guess === this.numberToGuess) {
        this.calculateScore();
        this.guessedCorrectly = true;
      } else {
        this.message = this.guess < this.numberToGuess ? 'El número es mayor.' : 'El número es menor.';
        this.disableNumbers();
        if (this.attempts >= 10) {
          this.gameOver = true;
          this.message = `¡Has alcanzado el máximo de intentos! El número era ${this.numberToGuess}.`;
        }
      }
    },
    calculateScore() {
      const scoring = [50, 25, 20, 15, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0];
      this.score = scoring[this.attempts - 1] || 0;
      this.saveScore();
    },
    async saveScore() {
      const user = auth.currentUser;
      if (user) {
        try {
          const userName = this.getUserName(user.email);
          await addDoc(collection(db, 'ranking'), {
            userId: user.uid,
            nombre: userName,
            puntos: this.score,
            fecha: serverTimestamp(),
            juego: 'Adivina el Número'
          });
        } catch (error) {
          console.error("Error al guardar la puntuación: ", error);
        }
      }
    },
    getUserName(email) {
      const atIndex = email.indexOf('@');
      return atIndex !== -1 ? email.slice(0, atIndex) : 'Anónimo';
    },
    disableNumbers() {
      if (this.guess < this.numberToGuess) {
        this.disabledNumbers = [...this.disabledNumbers, ...this.numbers.filter(num => num <= this.guess)];
      } else {
        this.disabledNumbers = [...this.disabledNumbers, ...this.numbers.filter(num => num >= this.guess)];
      }
    },
    resetGame() {
      this.guess = null;
      this.attempts = 0;
      this.score = 0;
      this.message = '';
      this.gameOver = false;
      this.guessedCorrectly = false;
      this.disabledNumbers = [];
      this.generateNumber();
    },
    updateScreenWidth() {
      this.screenWidth = window.innerWidth;
    }
  },
};
</script>

<style>
@import '../assets/CSS/adivinanumero.css';
</style>
