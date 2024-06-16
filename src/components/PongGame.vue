<template>
  <div class="pong-game">
    <canvas ref="pongCanvas" width="800" height="400"></canvas>
    <div class="score">
      <p class="big-score">{{ player1Score }} : {{ player2Score }}</p>
    </div>
    <div v-if="gameOver" class="game-over">
      <p>Fin del juego</p>
      <button @click="restartGame">Volver a jugar</button>
    </div>
  </div>
</template>

<script>
import { db, auth } from '../firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

export default {
  name: 'PongGame',
  data() {
    return {
      player1Score: 0,
      player2Score: 0,
      ball: {
        x: 0,
        y: 0,
        speedX: 4,
        speedY: 4,
        radius: 10,
        directionX: 1
      },
      paddle1Y: 150,
      paddle2Y: 150,
      paddleHeight: 100,
      canvas: null,
      context: null,
      gameOver: false,
      gameTimer: null,
      gameTimeLeft: 30
    };
  },
  mounted() {
    this.canvas = this.$refs.pongCanvas;
    this.context = this.canvas.getContext('2d');
    this.startGame();
  },
  methods: {
    startGame() {
      this.canvas.addEventListener('mousemove', this.movePaddle);
      this.gameTimer = setInterval(() => {
        this.gameTimeLeft--;
        if (this.gameTimeLeft <= 0) {
          this.gameOver = true;
          clearInterval(this.gameTimer);
          this.saveScore();
        }
      }, 1000);
      this.resetBall();
      this.animate();
    },
    animate() {
      this.draw();
      this.moveBall();
      this.movePaddle2();
      if (!this.gameOver) {
        requestAnimationFrame(this.animate);
      }
    },
    draw() {
      const { canvas, context } = this;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.beginPath();
      context.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
      context.fillStyle = 'white';
      context.fill();
      context.closePath();
      context.fillStyle = 'white';
      context.fillRect(20, this.paddle1Y, 10, this.paddleHeight);
      context.fillRect(canvas.width - 30, this.paddle2Y, 10, this.paddleHeight);
    },
    moveBall() {
      const { canvas, ball } = this;
      ball.x += ball.speedX * ball.directionX;
      ball.y += ball.speedY;
      if (ball.y < 0 || ball.y > canvas.height) {
        ball.speedY *= -1;
      }
      if (ball.x < 0) {
        this.player2Score++;
        this.resetBall();
      } else if (ball.x > canvas.width) {
        this.player1Score++;
        this.resetBall();
      }
      if (
        (ball.x < 30 && ball.y > this.paddle1Y && ball.y < this.paddle1Y + this.paddleHeight) ||
        (ball.x > canvas.width - 40 && ball.y > this.paddle2Y && ball.y < this.paddle2Y + this.paddleHeight)
      ) {
        if (ball.x < 30) {
          ball.directionX = 1;
        } else if (ball.x > canvas.width - 40) {
          ball.directionX = -1;
        }
      }
    },
    resetBall() {
      this.ball.x = this.canvas.width / 2;
      this.ball.y = this.canvas.height / 2;
      this.ball.speedX = 4;
      this.ball.speedY = 4;
      this.ball.directionX = Math.random() < 0.5 ? -1 : 1;
    },
    movePaddle(event) {
      const rect = this.canvas.getBoundingClientRect();
      const mouseY = event.clientY - rect.top - this.paddleHeight / 2;
      if (mouseY >= 0 && mouseY <= this.canvas.height - this.paddleHeight) {
        this.paddle1Y = mouseY;
      }
    },
    movePaddle2() {
      const { canvas, ball } = this;
      const paddle2Center = this.paddle2Y + this.paddleHeight / 2;
      if (ball.y > paddle2Center) {
        this.paddle2Y += 3;
      } else {
        this.paddle2Y -= 3;
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
            puntos: this.player1Score,
            fecha: serverTimestamp(),
            juego: 'Pong'
          });
          console.log('Puntuación guardada correctamente en la base de datos.');
        } catch (error) {
          console.error("Error al guardar la puntuación: ", error);
        }
      }
    },
    restartGame() {
      this.player1Score = 0;
      this.player2Score = 0;
      this.gameTimeLeft = 30;
      this.gameOver = false;
      this.startGame();
    }
  }
};
</script>

<style>
@import '../assets/CSS/pong.css';
</style>
