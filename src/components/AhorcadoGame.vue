<template>
  <div class="ahorcado-game">
    <div class="hint">¡Pista! Lenguajes de programación</div>
    <div class="word">
      <span v-for="(letter, index) in displayedWord" :key="index">
        {{ letter !== '_' ? letter : '_' }}&nbsp;
      </span>
    </div>
    <div class="keyboard">
      <button 
        v-for="letter in alphabet" 
        :key="letter" 
        @click="guessLetter(letter)" 
        :disabled="guessedLetters.includes(letter) || gameOver"
        :class="guessedLetters.includes(letter) ? 'guessed-letter' : 'not-guessed-letter'">
        {{ letter }}
      </button>
    </div>
    <div class="score">Puntos: {{ score }}</div>
    <div class="lives">
      <p>Vidas restantes: {{ lives }}</p>
    </div>
    <div class="game-over" v-if="gameOver">
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
      words: ['JAVASCRIPT', 'VUE', 'PHP', 'ANGULAR', 'REACT','LARAVEL','JAVA','PYTHON','SYMFONY'],
      userName: '', // Agregamos userName para almacenar el nombre del usuario
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
            nombre: this.userName, // Utilizamos this.userName en lugar de user.displayName
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

<style scoped>
.ahorcado-game {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: Arial, sans-serif;
}

.hint {
  font-size: 18px;
  margin-bottom: 10px;
}

.word {
  font-size: 2em;
  margin-bottom: 20px;
}

.keyboard {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 300px;
}

.guessed-letter {
  color: black;
  background-color: gray; 
}

.not-guessed-letter {
  color: rgb(255, 255, 255);
}

.keyboard button {
  width: 30px;
  height: 30px;
  margin: 5px;
  font-size: 1em;
}

.score {
  margin-bottom: 10px;
}

.lives {
  margin-top: 20px;
}

.game-over {
  margin-top: 20px;
}

/* Media Queries */
@media screen and (max-width: 600px) {
  .ahorcado-game {
    padding: 10px; /* Ajusta el padding general */
  }

  .hint {
    font-size: 16px; /* Reduce el tamaño de la fuente de la pista */
    margin-bottom: 8px; /* Reduce el margen inferior de la pista */
  }

  .word {
    font-size: 1.5em; /* Reduce el tamaño de la fuente de la palabra oculta */
    margin-bottom: 15px; /* Reduce el margen inferior de la palabra oculta */
  }

  .keyboard {
    max-width: 250px; /* Reduce el ancho máximo del teclado */
  }

  .keyboard button {
    width: 25px; /* Reduce el tamaño de los botones del teclado */
    height: 25px; /* Reduce el tamaño de los botones del teclado */
    font-size: 0.9em; /* Reduce el tamaño de la fuente en los botones del teclado */
    margin: 3px; /* Reduce el margen entre los botones del teclado */
  }

  .score {
    font-size: 0.9em; /* Reduce el tamaño de la fuente en el puntaje */
    margin-bottom: 8px; /* Reduce el margen inferior del puntaje */
  }

  .lives {
    font-size: 0.9em; /* Reduce el tamaño de la fuente en las vidas */
    margin-top: 15px; /* Reduce el margen superior de las vidas */
  }

  .game-over {
    margin-top: 15px; /* Reduce el margen superior de la sección de game over */
  }

  .game-over p {
    font-size: 1em; /* Reduce el tamaño de la fuente en los mensajes de game over */
    margin-bottom: 8px; /* Reduce el margen inferior de los mensajes de game over */
  }

  .restart-button {
    padding: 8px 16px; /* Ajusta el padding del botón de reinicio */
    font-size: 0.9em; /* Reduce el tamaño de la fuente en el botón de reinicio */
  }
}

@media screen and (max-width: 480px) {
  .ahorcado-game {
    padding: 8px; /* Ajusta el padding general */
  }

  .hint {
    font-size: 14px; /* Reduce aún más el tamaño de la fuente de la pista */
    margin-bottom: 6px; /* Reduce aún más el margen inferior de la pista */
  }

  .word {
    font-size: 1.2em; /* Reduce aún más el tamaño de la fuente de la palabra oculta */
    margin-bottom: 10px; /* Reduce aún más el margen inferior de la palabra oculta */
  }

  .keyboard {
    max-width: 200px; /* Reduce aún más el ancho máximo del teclado */
  }

  .keyboard button {
    width: 20px; /* Reduce aún más el tamaño de los botones del teclado */
    height: 20px; /* Reduce aún más el tamaño de los botones del teclado */
    font-size: 0.8em; /* Reduce aún más el tamaño de la fuente en los botones del teclado */
    margin: 2px; /* Reduce aún más el margen entre los botones del teclado */
  }

  .score {
    font-size: 0.8em; /* Reduce aún más el tamaño de la fuente en el puntaje */
    margin-bottom: 6px; /* Reduce aún más el margen inferior del puntaje */
  }

  .lives {
    font-size: 0.8em; /* Reduce aún más el tamaño de la fuente en las vidas */
    margin-top: 10px; /* Reduce aún más el margen superior de las vidas */
  }

  .game-over {
    margin-top: 10px; /* Reduce aún más el margen superior de la sección de game over */
  }

  .game-over p {
    font-size: 0.9em; /* Reduce aún más el tamaño de la fuente en los mensajes de game over */
    margin-bottom: 6px; /* Reduce aún más el margen inferior de los mensajes de game over */
  }

  .restart-button {
    padding: 6px 12px; /* Ajusta aún más el padding del botón de reinicio */
    font-size: 0.8em; /* Reduce aún más el tamaño de la fuente en el botón de reinicio */
  }
}
</style>
