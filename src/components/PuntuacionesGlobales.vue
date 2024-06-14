<template>
  <div class="puntuaciones-globales">
    <h1>Puntuaciones Globales</h1>
    <div class="botones-filtro">
      <button :class="{ activo: mostrarMejorPuntuacion }" @click="mostrarMejorPuntuacion = true; getPuntuacionesGlobales()">Mejores Puntuaciones en 1 Partida</button>
      <button :class="{ activo: !mostrarMejorPuntuacion }" @click="mostrarMejorPuntuacion = false; getPuntuacionesGlobales()">Puntuaciones Totales</button>
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

      // Obtener las mejores puntuaciones en una sola partida
      const mejoresPuntuaciones = this.getMejoresPuntuaciones(puntuacionesMap);

      // Calcular las puntuaciones totales por juego
      const puntuacionesTotales = Array.from(puntuacionesMap.entries()).map(([juego, usuarios]) => {
        // Agrupar usuarios por nombre y sumar sus puntos
        const puntosPorUsuario = usuarios.reduce((acc, curr) => {
          if (!acc[curr.nombre]) {
            acc[curr.nombre] = 0;
          }
          acc[curr.nombre] += curr.puntos;
          return acc;
        }, {});

        // Ordenar y obtener el top 3 de usuarios por puntos totales
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

      // Mostrar las mejores puntuaciones en una sola partida o las puntuaciones totales según el estado
      this.puntuaciones = this.mostrarMejorPuntuacion ? mejoresPuntuaciones : puntuacionesTotales;
    },
    getMejoresPuntuaciones(puntuacionesMap) {
      // Obtener los top 3 para cada juego de mejores puntuaciones en una sola partida
      return Array.from(puntuacionesMap.entries()).map(([juego, usuarios]) => {
        return {
          juego,
          usuarios: usuarios.slice(0, 3), // Top 3 usuarios
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

<style scoped>
.puntuaciones-globales {
  text-align: center;
  font-family: 'Roboto', sans-serif;
  color: #333;
  padding: 20px;
}

.puntuaciones-globales h1 {
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
  margin-right: 10px;
  transition: background-color 0.3s ease;
}

.botones-filtro button.activo {
  background-color: #0056b3;
}

.puntuaciones-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
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
  width: 100%;
  max-width: 200px; /* Asegura que todos los contenedores sean del mismo tamaño */
}

.juego-imagen {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 10px;
  margin-bottom: 10px;
}

.puntuacion-info {
  font-size: 1.1rem;
}

.usuario-info {
  font-size: 1rem;
  color: #555;
}

/* Media Queries */
@media screen and (max-width: 1200px) {
  .puntuaciones-grid {
    grid-template-columns: repeat(3, 1fr); /* Cambia a tres columnas */
  }

  .puntuacion {
    max-width: 300px; /* Ajusta el ancho máximo de los contenedores */
  }
}

@media screen and (max-width: 768px) {
  .puntuaciones-grid {
    grid-template-columns: repeat(2, 1fr); /* Cambia a dos columnas */
  }

  .puntuacion {
    max-width: 400px; /* Ajusta el ancho máximo de los contenedores */
  }
}

@media screen and (max-width: 480px) {
  .puntuaciones-grid {
    grid-template-columns: 1fr; /* Cambia a una sola columna */
  }

  .puntuacion {
    max-width: 90%; /* Utiliza el ancho máximo disponible */
  }

  .puntuacion-info {
    font-size: 1rem; /* Reduce el tamaño del texto */
  }

  .usuario-info {
    font-size: 0.9rem; /* Reduce el tamaño del texto para los nombres de usuarios */
  }
}
</style>
