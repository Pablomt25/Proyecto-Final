
### Modificaciones en `Inicio.vue`

```vue
<template>
  <div class="content">
    <!-- Sección de descripción -->
    <div class="description">
      <h1>Bienvenido a nuestra página Molajuegos</h1>
      <p>Aquí encontrarás una variedad de juegos sencillos como Adivina el Color, Pong, Adivina el Pokémon, Ahorcado y muchos más.</p>
      <button><router-link to="/juegos">Explorar más juegos</router-link></button>
    </div>

    <!-- Sección de juegos -->
    <div class="games">
      <div class="game">
        <img src="../assets/pong.avif" alt="Pong">
        <h2>Pong</h2>
        <button><router-link to="/pong">Jugar</router-link></button>
      </div>
      <div class="game">
        <img src="../assets/guess-the-color.webp" alt="Adivina el color">
        <h2>Adivina el color</h2>
        <button><router-link to="/color">Jugar</router-link></button>
      </div>
      <div class="game">
        <img src="../assets/adivina-pokemon.jpg" alt="Adivina el Pokémon">
        <h2>Adivina el Pokémon</h2>
        <button><router-link to="/pokemon">Jugar</router-link></button>
      </div>
      <div class="game">
        <img src="../assets/ahorcado.jpg" alt="Ahorcado">
        <h2>Ahorcado</h2>
        <button><router-link to="/ahorcado">Jugar</router-link></button>
      </div>
    </div>
  </div>
</template>

<style>
/* Estilo general */
body {
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
  background-image: url('../assets/fondo.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

/* Contenedor principal */
.content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  max-width: 1400px;
  margin: auto;
  padding: 20px;
  border-radius: 10px;
}

/* Sección de descripción */
.description {
  flex: 1;
  margin-right: 40px;
  background-color: rgba(255, 255, 255, 0.8); /* Fondo semitransparente para la descripción */
  padding: 30px;
  border-radius: 10px;
}

.description h1 {
  font-size: 36px;
  color: #333;
  margin-bottom: 20px;
}

.description p {
  font-size: 18px;
  color: #666;
  line-height: 1.5;
}

button {
  background-color: #007bff;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  text-decoration: none;
}

button:hover {
  background-color: #0056b3;
}

a:-webkit-any-link {
  color: -webkit-link;
  cursor: pointer;
  text-decoration: none;
  color: white;
}

/* Sección de juegos */
.games {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

/* Estilo de cada juego */
.game {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background-color: rgba(255, 255, 255, 0.8); /* Fondo semitransparente para cada juego */
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.game:hover {
  transform: translateY(-5px);
}

.game img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  margin-bottom: 20px;
}

.game h2 {
  font-size: 24px;
  color: #333;
  margin-bottom: 10px;
}

.game a {
  color: white;
  text-decoration: none;
}

.game button {
  background-color: #dae791;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.game button:hover {
  background-color: #c5d362;
}



/* Media Queries */
@media screen and (max-width: 1200px) {
  .content {
    padding: 15px;
    justify-content: center; /* Centrado horizontal */
  }

  .games {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media screen and (max-width: 768px) {
  .content {
    flex-direction: column;
    align-items: center; /* Centrado horizontal y vertical */
    padding: 30px 20px;
  }

  .description {
    margin-right: 0;
    margin-bottom: 30px;
  }

  .games {
    grid-template-columns: repeat(1, 1fr);
  }
}

@media screen and (max-width: 480px) {
  .description {
    padding: 20px;
  }

  .game {
    padding: 15px;
  }
}
</style>
