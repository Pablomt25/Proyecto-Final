<template>
  <div class="ahorcado-game">
    <div class="hint">¡Pista! Lenguajes de programación</div>
    <div class="word">
      <span v-for="(letter, index) in displayedWord" :key="index">
        {{ letter !== '_' ? letter : '_' }}&nbsp;
      </span>
    </div>
    <div class="keyboard">
      <button v-for="letter in alphabet" :key="letter" @click="guessLetter(letter)"
        :disabled="guessedLetters.includes(letter) || gameOver"
        :class="guessedLetters.includes(letter) ? 'guessed-letter' : 'not-guessed-letter'">
        {{ letter }}
      </button>
    </div>
    <div class="score">Puntos: {{ score }}</div>
    <div class="lives">
      <p>Vidas restantes: {{ lives }}</p>
    </div>
    <div class="game-over" style="background-color: black; padding: 15px; border-radius:10px ;" v-if="gameOver">
      <p v-if="didWin">¡Has ganado!</p>
      <p v-else>¡Has perdido! La palabra era: {{ word }}</p>
      <button @click="restartGame">Volver a jugar</button>
    </div>
  </div>
</template>

<script>
import { db, auth } from '../firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

export default {
  name: 'AhorcadoGame',
  data() {
    return {
      word: '',
      displayedWord: [],
      alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
      guessedLetters: [],
      lives: 6,
      gameOver: false,
      didWin: false,
      score: 20,
      words: ['JAVASCRIPT', 'VUE', 'PHP', 'ANGULAR', 'REACT', 'LARAVEL', 'JAVA', 'PYTHON', 'SYMFONY'],
      userName: '',
    };
  },
  mounted() {
    this.startGame();
    this.getUserName();
  },
  methods: {
    startGame() {
      this.word = this.words[Math.floor(Math.random() * this.words.length)];
      this.displayedWord = Array(this.word.length).fill('_');
      this.guessedLetters = [];
      this.lives = 6;
      this.gameOver = false;
      this.didWin = false;
      this.score = 20;
    },
    guessLetter(letter) {
      this.guessedLetters.push(letter);

      if (this.word.includes(letter)) {
        for (let i = 0; i < this.word.length; i++) {
          if (this.word[i] === letter) {
            this.displayedWord[i] = letter;
          }
        }

        if (!this.displayedWord.includes('_')) {
          this.didWin = true;
          this.gameOver = true;
          this.saveScore();
        }
      } else {
        this.lives--;
        this.score -= 2;

        if (this.lives === 0) {
          this.gameOver = true;
          this.saveScore();
        }
      }
    },
    restartGame() {
      this.startGame();
    },
    async saveScore() {
      const user = auth.currentUser;
      if (user) {
        try {
          await addDoc(collection(db, 'ranking'), {
            userId: user.uid,
            nombre: this.userName, 
            puntos: this.score,
            fecha: serverTimestamp(),
            juego: 'Ahorcado'
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
@import '../assets/CSS/ahorcado.css';
</style>
