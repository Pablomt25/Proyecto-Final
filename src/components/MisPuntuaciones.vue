<template>
  <div class="mis-puntuaciones">
    <h1>Mis Puntuaciones</h1>
    <div v-if="puntuaciones.length === 0" class="no-puntuaciones">No tienes puntuaciones aún.</div>
    <div v-else>
      <div class="botones-filtro">
        <button :class="{ activo: mostrarMejorPuntuacion }" @click="mostrarMejorPuntuacion = true">Mejor Puntuación en 1
          Partida</button>
        <button :class="{ activo: !mostrarMejorPuntuacion }" @click="mostrarMejorPuntuacion = false">Puntuaciones
          Totales</button>
      </div>
      <div class="puntuaciones-grid">
        <div v-for="puntuacion in puntuaciones" :key="puntuacion.juego" class="puntuacion">
          <img :src="getImage(puntuacion.juego)" alt="Imagen del juego" class="juego-imagen" />
          <div class="puntuacion-info">
            <h2>{{ puntuacion.juego }}</h2>
            <p v-if="mostrarMejorPuntuacion">Mejor Puntuación en 1 Partida: <strong>{{ puntuacion.mejorPuntos
                }}</strong> puntos</p>
            <p v-else>Puntuaciones Totales: <strong>{{ puntuacion.totalPuntos }}</strong></p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { db, auth } from '../firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';

// Importa las imágenes
import pongImage from '../assets/pong.avif';
import guessTheColorImage from '../assets/guess-the-color.webp';
import guessPokemonImage from '../assets/adivina-pokemon.jpg';
import hangmanImage from '../assets/ahorcado.jpg';
import memoryGameImage from '../assets/memoria.jpg';
import tresEnRaya from '../assets/raya.webp';
import snakeGameImage from '../assets/snake.jpg';
import numberGuessingImage from '../assets/numero.jpg';

export default {
  name: 'MisPuntuaciones',
  data() {
    return {
      puntuaciones: [],
      mostrarMejorPuntuacion: true, 
      gameImages: {
        'Pong': pongImage,
        'Adivina el Color': guessTheColorImage,
        'Adivina el Pokémon': guessPokemonImage,
        'Ahorcado': hangmanImage,
        'Juego de Memoria': memoryGameImage,
        '3 en Raya': tresEnRaya,
        'Snake Game': snakeGameImage,
        'Adivina el Número': numberGuessingImage,
      },
    };
  },
  mounted() {
    this.getPuntuaciones();
  },
  methods: {
    async getPuntuaciones() {
      const user = auth.currentUser;
      if (user) {
        const q = query(collection(db, 'ranking'), where('userId', '==', user.uid), orderBy('fecha', 'desc'));
        const querySnapshot = await getDocs(q);
        const puntuacionesMap = new Map();

        querySnapshot.forEach(doc => {
          const data = doc.data();
          if (!puntuacionesMap.has(data.juego)) {
            puntuacionesMap.set(data.juego, {
              juego: data.juego,
              juegoImagen: this.gameImages[data.juego],
              mejorPuntos: data.puntos,
              totalPuntos: data.puntos,
            });
          } else {
            const current = puntuacionesMap.get(data.juego);
            current.mejorPuntos = Math.max(current.mejorPuntos, data.puntos);
            current.totalPuntos += data.puntos;
          }
        });

        this.puntuaciones = Array.from(puntuacionesMap.values());
      }
    },
    getImage(juego) {
      const image = this.gameImages[juego] || '';
      return image;
    }
  },
};
</script>

<style>
@import '../assets/CSS/mispuntuaciones.css';
</style>
