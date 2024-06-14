<template>
  <div class="mis-puntuaciones">
    <h1>Mis Puntuaciones</h1>
    <div v-if="puntuaciones.length === 0" class="no-puntuaciones">No tienes puntuaciones aún.</div>
    <div v-else>
      <div class="botones-filtro">
        <button :class="{ activo: mostrarMejorPuntuacion }" @click="mostrarMejorPuntuacion = true">Mejor Puntuación en 1 Partida</button>
        <button :class="{ activo: !mostrarMejorPuntuacion }" @click="mostrarMejorPuntuacion = false">Puntuaciones Totales</button>
      </div>
      <div class="puntuaciones-grid">
        <div v-for="puntuacion in puntuaciones" :key="puntuacion.juego" class="puntuacion">
          <img :src="getImage(puntuacion.juego)" alt="Imagen del juego" class="juego-imagen" />
          <div class="puntuacion-info">
            <h2>{{ puntuacion.juego }}</h2>
            <p v-if="mostrarMejorPuntuacion">Mejor Puntuación en 1 Partida: <strong>{{ puntuacion.mejorPuntos }}</strong> puntos</p>
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
      mostrarMejorPuntuacion: true, // Estado para alternar entre vistas
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
              juegoImagen: this.gameImages[data.juego], // Asigna la imagen correspondiente
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

<style scoped>

.mis-puntuaciones {
  text-align: center;
  font-family: 'Roboto', sans-serif;
  color: #333;
  padding: 20px;
}

.mis-puntuaciones h1 {
  font-size: 2.5rem;
  margin-bottom: 20px;
}

.no-puntuaciones {
  font-size: 1.2rem;
  color: #777;
}

.botones-filtro {
  margin-bottom: 20px;
}

.botones-filtro button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px;
  cursor: pointer;
  border-radius: 5px;
  margin-right: 10px; /* Agrega margen derecho entre los botones */
  transition: background-color 0.3s ease; /* Agrega transición suave al color de fondo */
}

.botones-filtro button.activo {
  background-color: #0056b3;
}

.puntuaciones-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* Cambia a cuatro columnas */
  gap: 20px;
  justify-items: center;
  margin-top: 20px;
}


.puntuacion {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 200px; /* Establece un ancho fijo para los contenedores */
  height: 300px; /* Establece una altura fija para los contenedores */
}

.puntuacion:hover {
  transform: translateY(-5px); /* Agrega efecto de elevación al hacer hover */
}

.juego-imagen {
  width: 100%;
  height: 150px; /* Aumenta el tamaño de la imagen */
  object-fit: cover;
  border-radius: 10px;
  margin-bottom: 10px;
}

.puntuacion-info {
  font-size: 1.1rem; /* Ajusta el tamaño del texto */
}
/* Media Queries */
@media screen and (max-width: 1200px) {
  .puntuaciones-grid {
    grid-template-columns: repeat(3, 1fr); /* Cambia a tres columnas */
  }

  .puntuacion {
    width: 250px; /* Ajusta el ancho de los contenedores */
    height: 350px; /* Ajusta la altura de los contenedores */
  }
}

@media screen and (max-width: 768px) {
  .puntuaciones-grid {
    grid-template-columns: repeat(2, 1fr); /* Cambia a dos columnas */
  }

  .puntuacion {
    width: 300px; /* Ajusta el ancho de los contenedores */
    height: 400px; /* Ajusta la altura de los contenedores */
  }
}

@media screen and (max-width: 480px) {
  .puntuaciones-grid {
    grid-template-columns: 1fr; /* Cambia a una sola columna */
  }

  .puntuacion {
    width: 90%; /* Utiliza el ancho máximo disponible */
    height: auto; /* Ajusta la altura automáticamente */
  }

  .puntuacion-info {
    font-size: 1rem; /* Reduce el tamaño del texto */
  }
}
</style>
