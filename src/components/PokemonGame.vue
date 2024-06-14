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
        <button 
          v-for="letter in alphabet" 
          :key="letter" 
          @click="guessLetter(letter)" 
          :disabled="guessedLetters.includes(letter) || gameOver"
          :class="guessedLetters.includes(letter) ? 'guessed-letter' : 'not-guessed-letter'"
          class="alphabet-button">
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
      userEmail: null, // Para almacenar el email del usuario
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
      // Extraer el nombre de usuario antes del símbolo '@'
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
      
      // Guardar la puntuación en Firestore
      if (this.userEmail) {
        try {
          await addDoc(collection(db, 'ranking'), {
            userId: auth.currentUser.uid,
            nombre: this.userName, // Usar el nombre antes del '@' del email
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

<style scoped>
.pokemon-game {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: 'Arial', sans-serif;
  color: #333;
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  margin: 0 auto;
}

.loading {
  font-size: 1.5em;
  font-weight: bold;
}

.image-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.pokemon-image {
  max-width: 150px;
}

.word-container {
  margin-bottom: 20px;
}

.word-line {
  display: flex;
  justify-content: center;
  margin: 5px 0;
}

.letter {
  font-size: 2em;
  margin: 0 5px;
  color: #444;
}

.alphabet-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 300px;
  margin-bottom: 20px;
}

.alphabet-button {
  width: 30px;
  height: 30px;
  margin: 5px;
  font-size: 1em;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.guessed-letter {
  background-color: #537be7;
  color: white;
}

.not-guessed-letter {
  background-color: #007bff;
  color: white;
}

.alphabet-button:hover:enabled {
  background-color: #0056b3;
}

.lives-container {
  font-size: 1.2em;
  margin-bottom: 20px;
}

.game-over-container {
  text-align: center;
  margin-top: 20px;
}

.game-over-container p {
  font-size: 1.5em;
  margin-bottom: 10px;
}

.restart-button {
  padding: 10px 20px;
  font-size: 1em;
  color: white;
  background-color: #28a745;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.restart-button:hover {
  background-color: #218838;
}


/* Media Queries */
@media screen and (max-width: 600px) {
  .pokemon-game {
    padding: 10px; /* Ajusta el padding general */
  }

  .image-container {
    margin-bottom: 10px; /* Reduce el margen inferior del contenedor de la imagen */
  }

  .pokemon-image {
    max-width: 120px; /* Reduce el tamaño máximo de la imagen del Pokémon */
  }

  .word-line {
    margin: 3px 0; /* Reduce el margen entre las líneas de letras */
  }

  .letter {
    font-size: 1.5em; /* Reduce el tamaño de las letras */
  }

  .alphabet-container {
    max-width: 250px; /* Reduce el ancho máximo del contenedor de letras */
  }

  .alphabet-button {
    width: 25px; /* Reduce el tamaño de los botones de letras */
    height: 25px; /* Reduce el tamaño de los botones de letras */
    font-size: 0.9em; /* Reduce el tamaño de la fuente en los botones de letras */
  }

  .lives-container {
    font-size: 1em; /* Reduce el tamaño de la fuente en el contenedor de vidas */
    margin-bottom: 10px; /* Reduce el margen inferior del contenedor de vidas */
  }

  .game-over-container p {
    font-size: 1.2em; /* Reduce el tamaño de la fuente en los mensajes de game over */
    margin-bottom: 8px; /* Reduce el margen inferior de los mensajes de game over */
  }

  .restart-button {
    padding: 8px 16px; /* Ajusta el padding del botón de reinicio */
    font-size: 0.9em; /* Reduce el tamaño de la fuente en el botón de reinicio */
  }
}

@media screen and (max-width: 480px) {
  .pokemon-game {
    padding: 8px; /* Ajusta el padding general */
  }

  .image-container {
    margin-bottom: 8px; /* Reduce aún más el margen inferior del contenedor de la imagen */
  }

  .pokemon-image {
    max-width: 100px; /* Reduce aún más el tamaño máximo de la imagen del Pokémon */
  }

  .word-line {
    margin: 2px 0; /* Reduce aún más el margen entre las líneas de letras */
  }

  .letter {
    font-size: 1.2em; /* Reduce aún más el tamaño de las letras */
  }

  .alphabet-container {
    max-width: 200px; /* Reduce aún más el ancho máximo del contenedor de letras */
  }

  .alphabet-button {
    width: 20px; /* Reduce aún más el tamaño de los botones de letras */
    height: 20px; /* Reduce aún más el tamaño de los botones de letras */
    font-size: 0.8em; /* Reduce aún más el tamaño de la fuente en los botones de letras */
  }

  .lives-container {
    font-size: 0.9em; /* Reduce aún más el tamaño de la fuente en el contenedor de vidas */
    margin-bottom: 8px; /* Reduce aún más el margen inferior del contenedor de vidas */
  }

  .game-over-container p {
    font-size: 1em; /* Reduce aún más el tamaño de la fuente en los mensajes de game over */
    margin-bottom: 6px; /* Reduce aún más el margen inferior de los mensajes de game over */
  }

  .restart-button {
    padding: 6px 12px; /* Ajusta aún más el padding del botón de reinicio */
    font-size: 0.8em; /* Reduce aún más el tamaño de la fuente en el botón de reinicio */
  }
}
</style>
