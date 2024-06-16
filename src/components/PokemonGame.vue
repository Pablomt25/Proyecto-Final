<template>
  <div class="pokemon-game">
    <div v-if="loading" class="loading">Cargando...</div>
    <div v-else>
      <div class="image-container">
        <img v-if="pokemon" :src="pokemon.sprites.front_default" alt="pokemon" class="pokemon-image">
      </div>
      <div class="word-container">
        <div v-for="(chunk, index) in chunkedWord" :key="index" class="word-line">
          <span v-for="(letter, letterIndex) in chunk" :key="letterIndex" class="letter">
            {{ letter }}&nbsp;
          </span>
        </div>
      </div>
      <div class="alphabet-container">
        <button v-for="letter in alphabet" :key="letter" @click="guessLetter(letter)"
          :disabled="guessedLetters.includes(letter) || gameOver"
          :class="guessedLetters.includes(letter) ? 'guessed-letter' : 'not-guessed-letter'" class="alphabet-button">
          {{ letter }}
        </button>
      </div>
      <div class="lives-container">
        Vidas restantes: {{ lives }}
      </div>
      <div v-if="gameOver" class="game-over-container">
        <p v-if="didWin">¡Has ganado! El Pokémon era {{ pokemon.name }}.</p>
        <p v-else>¡Has perdido! El Pokémon era {{ pokemon.name }}.</p>
        <button @click="restartGame" class="restart-button">Jugar de nuevo</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { db, auth } from '../firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

export default {
  data() {
    return {
      pokemon: null,
      displayedWord: [],
      alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
      guessedLetters: [],
      gameOver: false,
      didWin: false,
      loading: true,
      lives: 5,
    };
  },
  computed: {
    chunkedWord() {
      const chunkSize = 10;
      const chunks = [];
      for (let i = 0; i < this.displayedWord.length; i += chunkSize) {
        chunks.push(this.displayedWord.slice(i, i + chunkSize));
      }
      return chunks;
    },
  },
  async mounted() {
    await this.fetchPokemon();
    this.userEmail = auth.currentUser ? auth.currentUser.email : null;
    if (this.userEmail) {
      const atIndex = this.userEmail.indexOf('@');
      this.userName = atIndex !== -1 ? this.userEmail.slice(0, atIndex) : this.userEmail;
    }
  },
  methods: {
    async fetchPokemon() {
      this.loading = true;
      const response = await axios.get('https://pokeapi.co/api/v2/pokemon/' + Math.floor(Math.random() * 151));
      this.pokemon = response.data;
      this.displayedWord = Array(this.pokemon.name.length).fill('_');
      this.loading = false;
    },
    guessLetter(letter) {
      this.guessedLetters.push(letter);
      let foundLetter = false;
      if (this.pokemon && this.pokemon.name.toUpperCase().includes(letter)) {
        const nameArray = this.pokemon.name.toUpperCase().split('');
        const newDisplayedWord = this.displayedWord.map((char, index) => {
          if (nameArray[index] === letter) {
            foundLetter = true;
            return letter;
          } else {
            return char;
          }
        });
        this.displayedWord = newDisplayedWord;
        if (!this.displayedWord.includes('_')) {
          this.didWin = true;
          this.gameOver = true;
          this.calculateScoreAndSave();
        }
      } else {
        this.lives--;
        if (this.lives === 0) {
          this.gameOver = true;
          this.calculateScoreAndSave();
        }
      }
    },
    async calculateScoreAndSave() {
      let score;
      if (this.didWin && this.lives === 5) {
        score = 20;
      } else if (this.didWin && this.lives === 4) {
        score = 15;
      } else if (this.didWin && this.lives === 3) {
        score = 10;
      } else if (this.didWin && this.lives === 2) {
        score = 8;
      } else if (this.didWin && this.lives === 1) {
        score = 4;
      } else {
        score = 0;
      }

      if (this.userEmail) {
        try {
          await addDoc(collection(db, 'ranking'), {
            userId: auth.currentUser.uid,
            nombre: this.userName,
            puntos: score,
            fecha: serverTimestamp(),
            juego: 'Adivina el Pokémon'
          });
          console.log('Puntuación guardada correctamente en la base de datos.');
        } catch (error) {
          console.error("Error al guardar la puntuación: ", error);
        }
      }
    },
    restartGame() {
      this.guessedLetters = [];
      this.gameOver = false;
      this.didWin = false;
      this.lives = 5;
      this.fetchPokemon();
    },
  },
};
</script>

<style>
@import '../assets/CSS/pokemon.css';
</style>
