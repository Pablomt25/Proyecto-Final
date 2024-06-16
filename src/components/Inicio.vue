<template>
  <div class="content">
    <div class="description">
      <h1>Bienvenido a nuestra página Molajuegos</h1>
      <p>Aquí encontrarás una variedad de juegos sencillos como Adivina el Color, Pong, Adivina el Pokémon, Ahorcado y
        muchos más.</p>
      <button><router-link to="/juegos">Explorar más juegos</router-link></button>
    </div>

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
@import '../assets/CSS/inicio.css';
</style>
