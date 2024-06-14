<template>
    <div>
      <div class="filter-bar">
        <label for="sort-options">Ordenar por:</label>
        <select id="sort-options" @change="sortGames">
          <option value="default">Predeterminado</option>
          <option value="a-z">A-Z</option>
          <option value="z-a">Z-A</option>
        </select>
      </div>
      <div class="content-custom">
        <div class="games-custom">
          <div v-for="game in sortedGames" :key="game.name" class="game-custom">
            <img :src="game.image" :alt="game.name">
            <h2>{{ game.name }}</h2>
            <button><router-link :to="game.link">Jugar</router-link></button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import pongImage from '../assets/pong.avif';
  import guessTheColorImage from '../assets/guess-the-color.webp';
  import guessPokemonImage from '../assets/adivina-pokemon.jpg';
  import hangmanImage from '../assets/ahorcado.jpg';
  import memoryGameImage from '../assets/memoria.jpg';
  import tresEnRaya from '../assets/raya.webp';
  import snakeGameImage from '../assets/snake.jpg';
  import numberGuessingImage from '../assets/numero.jpg';
  
  export default {
    data() {
      return {
        sortOption: 'default',
        games: [
          { name: 'Pong', image: pongImage, link: '/pong' },
          { name: 'Adivina el color', image: guessTheColorImage, link: '/color' },
          { name: 'Adivina el Pokémon', image: guessPokemonImage, link: '/pokemon' },
          { name: 'Ahorcado', image: hangmanImage, link: '/ahorcado' },
          { name: 'Juego de memoria', image: memoryGameImage, link: '/memoria' },
          { name: 'Tres en raya', image: tresEnRaya, link: '/tresEnRaya' },
          { name: 'Juego de la serpiente', image: snakeGameImage, link: '/serpiente' },
          { name: 'Adivinación de números', image: numberGuessingImage, link: '/adivinaNumero' }
        ]
      };
    },
    computed: {
      sortedGames() {
        if (this.sortOption === 'a-z') {
          return this.games.slice().sort((a, b) => a.name.localeCompare(b.name));
        } else if (this.sortOption === 'z-a') {
          return this.games.slice().sort((a, b) => b.name.localeCompare(a.name));
        } else {
          return this.games;
        }
      }
    },
    methods: {
      sortGames(event) {
        this.sortOption = event.target.value;
      }
    }
  };
  </script>
  
  <style scoped>

  .sort-options{
    font-family: Lucida Sans, Lucida Sans Regular, Lucida Grande, Lucida Sans Unicode, Geneva, Verdana, sans-serif;
  }

  .filter-bar {
    display: flex;
    align-items: center;
    margin-right: 970px;
    background-color: #f8f9fa1f;
    margin-left: 20px;
    padding: 15px 25px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
  }
  
  .filter-bar label {
    font-size: 18px;
    color: #333;
    font-weight: bold;
    margin-right: 15px;
  }
  
  .filter-bar select {
    padding: 10px 15px;
    font-size: 16px;
    border: 1px solid #ccc;
    border-radius: 5px;
    background-color: #fff;
    transition: border-color 0.3s, box-shadow 0.3s;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }
  
  .filter-bar select:hover,
  .filter-bar select:focus {
    border-color: #007bff;
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
    outline: none;
  }
  
  .content-custom {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    padding: 20px;
  }
  
  .games-custom {
    display: contents;
  }
  
  .game-custom {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    background-color: rgba(255, 255, 255, 0.8);
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  
  .game-custom:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  
  .game-custom img {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: 10px;
  }
  
  .game-custom h2 {
    color: #333;
    font-size: 20px;
    margin: 10px 0;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }
  
  .game-custom button {
    background-color: #007bff;
    color: white;
    padding: 10px 20px;
    margin: 10px 0;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    text-decoration: none;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    transition: background-color 0.3s;
  }
  
  .game-custom button:hover {
    background-color: #0056b3;
  }


  /* Media Queries */
@media screen and (max-width: 1200px) {
  .filter-bar {
    margin-right: 0;
    margin-left: 0;
  }
  
  .content-custom {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    padding: 15px;
  }
}

@media screen and (max-width: 768px) {
  .filter-bar {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .filter-bar select {
    margin-top: 10px;
    max-width: 100%;
  }

  .content-custom {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    padding: 10px;
  }
}

@media screen and (max-width: 480px) {
  .filter-bar {
    padding: 10px;
  }
  
  .filter-bar label {
    font-size: 16px;
  }

  .filter-bar select {
    font-size: 14px;
    padding: 8px 12px;
    max-width: calc(100% - 20px);
  }

  .content-custom {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    padding: 5px;
  }

  .game-custom h2 {
    font-size: 18px;
  }

  .game-custom button {
    padding: 8px 16px;
    font-size: 14px;
  }
}
</style>
  