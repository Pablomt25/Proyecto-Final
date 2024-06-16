<template>
  <div class="puntuaciones-globales">
    <h1>Puntuaciones Globales</h1>
    <div class="botones-filtro">
      <button :class="{ activo: mostrarMejorPuntuacion }"
        @click="mostrarMejorPuntuacion = true; getPuntuacionesGlobales()">Mejores Puntuaciones en 1 Partida</button>
      <button :class="{ activo: !mostrarMejorPuntuacion }"
        @click="mostrarMejorPuntuacion = false; getPuntuacionesGlobales()">Puntuaciones Totales</button>
    </div>
    <div v-if="puntuaciones.length === 0" class="no-puntuaciones">No hay puntuaciones aún.</div>
    <div v-else class="puntuaciones-grid">
      <div v-for="puntuacion in puntuaciones" :key="puntuacion.juego" class="puntuacion">
        <img :src="getImage(puntuacion.juego)" alt="Imagen del juego" class="juego-imagen" />
        <div class="puntuacion-info">
          <h2>{{ puntuacion.juego }}</h2>
          <div v-for="(usuario, index) in puntuacion.usuarios" :key="index" class="usuario-info">
            <p>{{ index + 1 }}. {{ usuario.nombre }} - <strong>{{ usuario.puntos }}</strong> puntos</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from '../firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';

import pongImage from '../assets/pong.avif';
import guessTheColorImage from '../assets/guess-the-color.webp';
import guessPokemonImage from '../assets/adivina-pokemon.jpg';
import hangmanImage from '../assets/ahorcado.jpg';
import memoryGameImage from '../assets/memoria.jpg';
import tresEnRaya from '../assets/raya.webp';
import snakeGameImage from '../assets/snake.jpg';
import numberGuessingImage from '../assets/numero.jpg';

export default {
  name: 'PuntuacionesGlobales',
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
    this.getPuntuacionesGlobales();
  },
  methods: {
    async getPuntuacionesGlobales() {
      const q = query(collection(db, 'ranking'), orderBy('puntos', 'desc'));
      const querySnapshot = await getDocs(q);
      const puntuacionesMap = new Map();

      querySnapshot.forEach(doc => {
        const data = doc.data();
        if (!puntuacionesMap.has(data.juego)) {
          puntuacionesMap.set(data.juego, []);
        }
        puntuacionesMap.get(data.juego).push({
          nombre: data.nombre,
          puntos: data.puntos,
        });
      });

      const mejoresPuntuaciones = this.getMejoresPuntuaciones(puntuacionesMap);

      const puntuacionesTotales = Array.from(puntuacionesMap.entries()).map(([juego, usuarios]) => {
        const puntosPorUsuario = usuarios.reduce((acc, curr) => {
          if (!acc[curr.nombre]) {
            acc[curr.nombre] = 0;
          }
          acc[curr.nombre] += curr.puntos;
          return acc;
        }, {});

        const topUsuarios = Object.entries(puntosPorUsuario)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([nombre, puntos]) => ({ nombre, puntos }));

        return {
          juego,
          usuarios: topUsuarios,
          juegoImagen: this.gameImages[juego],
        };
      });

      this.puntuaciones = this.mostrarMejorPuntuacion ? mejoresPuntuaciones : puntuacionesTotales;
    },
    getMejoresPuntuaciones(puntuacionesMap) {
      return Array.from(puntuacionesMap.entries()).map(([juego, usuarios]) => {
        return {
          juego,
          usuarios: usuarios.slice(0, 3), 
          juegoImagen: this.gameImages[juego],
        };
      });
    },
    getImage(juego) {
      return this.gameImages[juego];
    },
  },
};
</script>

<style>
@import '../assets/CSS/puntuacionesglobales.css';
</style>
