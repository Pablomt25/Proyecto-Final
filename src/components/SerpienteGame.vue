<template>
  <div>
    <div class="cuadrado"
      ref="snakeGame"
      tabindex="0"
      @keydown="handleKeyDown"
      style="width: 300px; height: 300px; border: 1px solid black; position: relative; background-color: rgb(132, 185, 132);;"
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
import { db, auth } from '../firebase'; 
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

export default {
  data() {
    return {
      gridSize: 20, 
      snake: [{ x: 20, y: 20 }, { x: 40, y: 20 }], 
      food: { x: 200, y: 200 }, 
      score: 0, 
      direction: 'right', 
      gameOver: false, 
    };
  },
  mounted() {
    this.setupGame();
  },
  methods: {
    setupGame() {
      this.$refs.snakeGame.focus(); 
      setInterval(this.moveSnake, 100); 
    },
    async moveSnake() {
      if (this.gameOver) return;

      const newHead = { ...this.snake[this.snake.length - 1] }; 

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

      if (
        newHead.x < 0 ||
        newHead.x >= 300 ||
        newHead.y < 0 ||
        newHead.y >= 300 ||
        this.checkCollisionWithSelf(newHead)
      ) {
        this.gameOver = true;
        await this.saveScore(); 
        return;
      }

      if (this.checkCollision(newHead, this.food)) {
        this.score++; 
        this.generateFood(); 
      } else {
        this.snake.shift();
      }

      this.snake.push(newHead);
    },
    checkCollision(head, target) {
      return head.x === target.x && head.y === target.y;
    },
    checkCollisionWithSelf(head) {
      return this.snake.some(segment => segment.x === head.x && segment.y === head.y);
    },
    generateFood() {
      this.food = {
        x: Math.floor(Math.random() * (300 / this.gridSize)) * this.gridSize,
        y: Math.floor(Math.random() * (300 / this.gridSize)) * this.gridSize,
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
          let userName = user.email.split('@')[0];
          
          await addDoc(collection(db, 'ranking'), {
            userId: user.uid,
            nombre: userName,
            puntos: this.score,
            fecha: serverTimestamp(),
            juego: 'Snake Game' 
          });
        } catch (error) {
          console.error("Error al guardar la puntuación: ", error);
        }
      }
    },
    resetGame() {
      this.snake = [{ x: 20, y: 20 }, { x: 40, y: 20 }]; 
      this.food = { x: 200, y: 200 }; 
      this.score = 0; 
      this.direction = 'right'; 
      this.gameOver = false;
    },
  },
};
</script>

<style>
  @import '../assets/CSS/serpiente.css';
</style>

