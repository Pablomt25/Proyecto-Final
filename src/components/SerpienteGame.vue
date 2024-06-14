<template>
  <div>
    <div
      ref="snakeGame"
      tabindex="0"
      @keydown="handleKeyDown"
      style="width: 400px; height: 400px; border: 1px solid black; position: relative;"
    >
      <div
        v-for="(segment, index) in snake"
        :key="index"
        :style="{ left: segment.x + 'px', top: segment.y + 'px', width: gridSize + 'px', height: gridSize + 'px', background: 'green', position: 'absolute' }"
      ></div>
      <div
        :style="{ left: food.x + 'px', top: food.y + 'px', width: gridSize + 'px', height: gridSize + 'px', background: 'red', position: 'absolute' }"
      ></div>
    </div>
    <button v-if="gameOver" @click="resetGame">Volver a Jugar</button>
    <p v-else>Puntuación: {{ score }}</p>
  </div>
</template>

<script>
import { db, auth } from '../firebase'; // Asegúrate de importar la configuración de Firebase
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

export default {
  data() {
    return {
      gridSize: 20, // Tamaño de la cuadrícula
      snake: [{ x: 20, y: 20 }, { x: 40, y: 20 }], // Posición inicial de la serpiente
      food: { x: 200, y: 200 }, // Posición inicial de la comida
      score: 0, // Puntuación inicial
      direction: 'right', // Dirección inicial
      gameOver: false, // Estado del juego
    };
  },
  mounted() {
    this.setupGame();
  },
  methods: {
    setupGame() {
      this.$refs.snakeGame.focus(); // Focalizar el elemento para capturar eventos de teclado
      setInterval(this.moveSnake, 100); // Mover la serpiente cada 100ms
    },
    async moveSnake() {
      if (this.gameOver) return;

      const newHead = { ...this.snake[this.snake.length - 1] }; // Crear una nueva cabeza para la serpiente

      // Mover la cabeza en la dirección actual
      switch (this.direction) {
        case 'up':
          newHead.y -= this.gridSize;
          break;
        case 'down':
          newHead.y += this.gridSize;
          break;
        case 'left':
          newHead.x -= this.gridSize;
          break;
        case 'right':
          newHead.x += this.gridSize;
          break;
      }

      // Verificar si la cabeza colisiona con el borde del cuadrado
      if (
        newHead.x < 0 ||
        newHead.x >= 400 ||
        newHead.y < 0 ||
        newHead.y >= 400 ||
        this.checkCollisionWithSelf(newHead)
      ) {
        this.gameOver = true;
        await this.saveScore(); // Guardar la puntuación en Firebase
        return;
      }

      // Verificar si la cabeza choca con la comida
      if (this.checkCollision(newHead, this.food)) {
        this.score++; // Incrementar la puntuación
        this.generateFood(); // Generar nueva comida
      } else {
        // Eliminar la cola
        this.snake.shift();
      }

      // Agregar la nueva cabeza
      this.snake.push(newHead);
    },
    checkCollision(head, target) {
      // Verificar si la cabeza colisiona con la comida
      return head.x === target.x && head.y === target.y;
    },
    checkCollisionWithSelf(head) {
      // Verificar si la cabeza choca con el cuerpo de la serpiente
      return this.snake.some(segment => segment.x === head.x && segment.y === head.y);
    },
    generateFood() {
      // Generar una nueva posición para la comida
      this.food = {
        x: Math.floor(Math.random() * (400 / this.gridSize)) * this.gridSize,
        y: Math.floor(Math.random() * (400 / this.gridSize)) * this.gridSize,
      };
    },
    handleKeyDown(event) {
      switch (event.key) {
        case 'ArrowUp':
          if (this.direction !== 'down') {
            this.direction = 'up';
          }
          break;
        case 'ArrowDown':
          if (this.direction !== 'up') {
            this.direction = 'down';
          }
          break;
        case 'ArrowLeft':
          if (this.direction !== 'right') {
            this.direction = 'left';
          }
          break;
        case 'ArrowRight':
          if (this.direction !== 'left') {
            this.direction = 'right';
          }
          break;
      }
    },
    async saveScore() {
      const user = auth.currentUser;
      if (user) {
        try {
          // Obtener el nombre de usuario a partir del correo electrónico
          let userName = user.email.split('@')[0]; // Obtener la parte antes del '@'
          
          await addDoc(collection(db, 'ranking'), {
            userId: user.uid, // ID del Usuario (string)
            nombre: userName,
            puntos: this.score,
            fecha: serverTimestamp(),
            juego: 'Snake Game' // Nombre del juego
          });
        } catch (error) {
          console.error("Error al guardar la puntuación: ", error);
        }
      }
    },
    resetGame() {
      this.snake = [{ x: 20, y: 20 }, { x: 40, y: 20 }]; // Posición inicial de la serpiente
      this.food = { x: 200, y: 200 }; // Posición inicial de la comida
      this.score = 0; // Puntuación inicial
      this.direction = 'right'; // Dirección inicial
      this.gameOver = false; // Reiniciar el estado del juego
    },
  },
};
</script>

<style scoped>
.snake-game {
  text-align: center;
}

.game-board {
  display: inline-block;
  border: 2px solid #333;
}

.row {
  display: flex;
}

.cell {
  width: 20px;
  height: 20px;
  border: 1px solid #ccc;
}

.snake {
  background-color: green;
}

.food {
  background-color: red;
}

@media (max-width: 600px) {
  .game-board {
    width: 300px; /* Reducir el ancho del tablero */
    height: 300px; /* Reducir la altura del tablero */
  }

  .cell {
    width: 15px; /* Reducir el tamaño de las celdas */
    height: 15px; /* Reducir el tamaño de las celdas */
    border-width: 0.5px; /* Reducir el ancho del borde */
  }
}

@media (max-width: 400px) {
  .game-board {
    width: 200px; /* Reducir aún más el ancho del tablero */
    height: 200px; /* Reducir aún más la altura del tablero */
  }

  .cell {
    width: 12px; /* Reducir aún más el tamaño de las celdas */
    height: 12px; /* Reducir aún más el tamaño de las celdas */
    border-width: 0.3px; /* Reducir aún más el ancho del borde */
  }
}
</style>
