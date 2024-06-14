<template>
  <div class="guess-color-game">
    <div class="color-box" :style="{ backgroundColor: targetColor, boxShadow: correctColor ? '0px 0px 20px green' : (incorrectColor ? '0px 0px 20px red' : 'none') }">
      <p>¿Qué color es este?</p>
    </div>
    <div class="color-options">
      <div
        v-for="(color, index) in options"
        :key="index"
        class="option"
        :style="{ backgroundColor: color }"
        @click="checkAnswer(color)"
        :disabled="gameOver"
      ></div>
    </div>
    <div class="lives">
      <p>Vidas: {{ lives }}</p>
    </div>
    <div class="score">
      <p>Aciertos: {{ correctGuesses }}</p>
      <p v-if="gameOver && correctGuesses >= 15">Puntos: {{ calculatePoints() }}</p>
    </div>
    <div class="game-over" v-if="gameOver">
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
      userName: '', // Agregamos userName para almacenar el nombre del usuario
    };
  },
  mounted() {
    this.generateRandomColor();
    this.startTimer();
    this.getUserName();
  },
  methods: {
    generateRandomColor() {
      // Generar un color aleatorio hexadecimal
      const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
      
      // Asignar el color aleatorio como el color objetivo
      this.targetColor = randomColor;

      // Generar tres colores aleatorios adicionales (incluyendo el color objetivo)
      const randomColors = [randomColor];
      while (randomColors.length < 4) {
        const newColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
        if (!randomColors.includes(newColor)) {
          randomColors.push(newColor);
        }
      }

      // Barajar los colores aleatorios
      this.options = this.shuffle(randomColors);
    },
    shuffle(array) {
      // Función para barajar un array
      let currentIndex = array.length, randomIndex;

      // Mientras queden elementos que barajar
      while (currentIndex != 0) {

        // Elegir un elemento restante
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // E intercambiarlo con el elemento actual
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
            nombre: this.userName, // Utilizamos this.userName en lugar de user.displayName
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

<style scoped>
.guess-color-game {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.color-box {
  width: 200px;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  color: white;
}

.color-options {
  display: flex;
}

.option {
  width: 80px;
  height: 80px;
  margin: 0 10px;
  cursor: pointer;
}

.lives {
  margin-top: 10px;
}

.score {
  margin-top: 10px;
}

.game-over {
  margin-top: 20px;
}
  
.timer {
  margin-top: 10px;
}

/* Media Queries */
@media screen and (max-width: 600px) {
  .guess-color-game {
    height: 100vh; /* Ajusta la altura del juego para ocupar toda la pantalla en dispositivos pequeños */
  }

  .color-box {
    width: 150px; /* Reduce el tamaño del color-box */
    height: 150px; /* Reduce el tamaño del color-box */
    font-size: 18px; /* Reduce el tamaño del texto dentro del color-box */
  }

  .option {
    width: 60px; /* Reduce el tamaño de las opciones de color */
    height: 60px; /* Reduce el tamaño de las opciones de color */
    margin: 0 5px; /* Reduce el margen entre las opciones de color */
  }

  .lives,
  .score,
  .game-over,
  .timer {
    font-size: 14px; /* Reduce el tamaño del texto en los elementos de información */
  }

  .game-over button {
    padding: 8px 16px; /* Ajusta el padding del botón de reinicio */
  }
}

@media screen and (max-width: 480px) {
  .guess-color-game {
    height: 100vh; /* Ajusta la altura del juego para ocupar toda la pantalla en dispositivos muy pequeños */
  }

  .color-box {
    width: 120px; /* Reduce aún más el tamaño del color-box */
    height: 120px; /* Reduce aún más el tamaño del color-box */
    font-size: 16px; /* Reduce el tamaño del texto dentro del color-box */
  }

  .option {
    width: 50px; /* Reduce el tamaño de las opciones de color */
    height: 50px; /* Reduce el tamaño de las opciones de color */
    margin: 0 3px; /* Reduce el margen entre las opciones de color */
  }

  .lives,
  .score,
  .game-over,
  .timer {
    font-size: 12px; /* Reduce el tamaño del texto en los elementos de información */
  }

  .game-over button {
    padding: 6px 12px; /* Ajusta el padding del botón de reinicio */
    font-size: 12px; /* Reduce el tamaño del texto del botón de reinicio */
  }
}

</style>
