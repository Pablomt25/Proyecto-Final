<template>
  <div class="guess-color-game">
    <div class="color-box"
      :style="{ backgroundColor: targetColor, boxShadow: correctColor ? '0px 0px 20px green' : (incorrectColor ? '0px 0px 20px red' : 'none') }">
      <p>¿Qué color es este?</p>
    </div>
    <div class="color-options">
      <div v-for="(color, index) in options" :key="index" class="option" :style="{ backgroundColor: color }"
        @click="checkAnswer(color)" :disabled="gameOver"></div>
    </div>
    <div class="lives">
      <p>Vidas: {{ lives }}</p>
    </div>
    <div class="score">
      <p class="aciertos">Aciertos: {{ correctGuesses }}</p>
      <p v-if="gameOver && correctGuesses >= 15">Puntos: {{ calculatePoints() }}</p>
    </div>
    <div class="game-over" style="background-color: black; padding: 15px; border-radius:10px ;" v-if="gameOver">
      <p v-if="correctGuesses >= 15">¡Has ganado!</p>
      <p v-else>¡Has perdido!</p>
      <p v-if="livesLost > 0">Has perdido {{ livesLost }} vidas</p>
      <p v-if="correctGuesses >= 15 && !timeUp">Tu puntuación final es: {{ calculatePoints() }}</p>
      <button @click="restartGame">Volver a jugar</button>
    </div>
    <div class="timer">
      <p>{{ minutes }}:{{ seconds }}</p>
    </div>
  </div>
</template>

<script>
import { db, auth } from '../firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

export default {
  name: 'GuessColorGame',
  data() {
    return {
      targetColor: '',
      options: [],
      correctColor: false,
      incorrectColor: false,
      lives: 3,
      livesLost: 0,
      correctGuesses: 0,
      minutes: 1,
      seconds: 0,
      timer: null,
      gameOver: false,
    };
  },
  mounted() {
    this.generateRandomColor();
    this.startTimer();
    this.getUserName();
  },
  methods: {
    generateRandomColor() {
      const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);

      this.targetColor = randomColor;

      const randomColors = [randomColor];
      while (randomColors.length < 4) {
        const newColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
        if (!randomColors.includes(newColor)) {
          randomColors.push(newColor);
        }
      }

      this.options = this.shuffle(randomColors);
    },
    shuffle(array) {
      let currentIndex = array.length, randomIndex;

      while (currentIndex != 0) {

        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [array[currentIndex], array[randomIndex]] = [
          array[randomIndex], array[currentIndex]];
      }

      return array;
    },
    checkAnswer(color) {
      if (!this.gameOver) {
        if (color === this.targetColor) {
          this.correctColor = true;
          this.incorrectColor = false;
          this.correctGuesses++;
        } else {
          this.correctColor = false;
          this.incorrectColor = true;
          this.lives--;
          this.livesLost++;
        }

        if (this.correctGuesses === 15 || this.lives === 0 || (this.minutes === 0 && this.seconds === 0)) {
          clearInterval(this.timer);
          this.gameOver = true;
          this.calculateScoreAndSave();
        }

        if (this.correctColor || this.incorrectColor) {
          setTimeout(() => {
            this.correctColor = false;
            this.incorrectColor = false;
            this.generateRandomColor();
          }, 1000);
        }
      }
    },
    startTimer() {
      this.timer = setInterval(() => {
        if (this.seconds > 0) {
          this.seconds--;
        } else if (this.minutes > 0) {
          this.minutes--;
          this.seconds = 59;
        } else {
          clearInterval(this.timer);
          this.gameOver = true;
          this.calculateScoreAndSave();
        }
      }, 1000);
    },
    calculatePoints() {
      let points = 0;
      if (this.correctGuesses >= 15) {
        points += (this.minutes * 60) + this.seconds;
        points -= this.livesLost * 5;
        return points;
      }
      return points;
    },
    async calculateScoreAndSave() {
      const user = auth.currentUser;
      if (user) {
        try {
          await addDoc(collection(db, 'ranking'), {
            userId: user.uid,
            nombre: this.userName,
            puntos: this.correctGuesses >= 15 ? this.calculatePoints() : 0,
            fecha: serverTimestamp(),
            juego: 'Adivina el Color'
          });
        } catch (error) {
          console.error("Error al guardar la puntuación: ", error);
        }
      }
    },
    restartGame() {
      this.correctGuesses = 0;
      this.lives = 3;
      this.livesLost = 0;
      this.minutes = 1;
      this.seconds = 0;
      this.gameOver = false;
      this.generateRandomColor();
      this.startTimer();
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
@import '../assets/CSS/color.css';
</style>
