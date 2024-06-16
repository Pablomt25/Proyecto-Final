<template>
  <div class="page-container">
    <!-- Menú de navegación -->
    <nav>
      <div class="nav-header">
        <router-link to="/" class="logo-link">
          <img src="./assets/Logo.png" alt="Logo" width="180px" height="80px">
        </router-link>
        <button class="nav-toggle" @click="toggleNav">
          <i class="fas fa-bars"></i>
        </button>
        <ul class="nav-links" :class="{ 'nav-active': isNavOpen }">
          <li><router-link to="#" @click="closeNav"></router-link></li>
          <li><router-link to="/juegos" @click="closeNav">Juegos</router-link></li>
          <li><router-link to="/misPuntuaciones" @click="closeNav">Mis puntuaciones</router-link></li>
          <li><router-link to="/puntuacionesGlobales" @click="closeNav">Puntuaciones globales</router-link></li>
          <li v-if="isLoggedIn">
            <button @click="logout">Cerrar sesión</button>
          </li>
          <li v-else>
            <router-link to="/login" @click="closeNav">Iniciar sesión</router-link>
          </li>
        </ul>
      </div>
    </nav>

    <div class="content">
      <router-view />
    </div>

    <footer>
      <div class="footer-content">
        <div class="footer-section">
          <img src="./assets/logo.png" alt="Logo">
          <p class="contact-info">
            <i class="fas fa-phone" style="color: #dae791;"></i> +34 345 657 657<br><br>
            <i class="fas fa-envelope" style="color: #dae791;"></i> molajuegos@gmail.com<br>
          </p>
        </div>
        <div class="footer-section">
          <h2>Enlaces</h2>
          <ul>
            <li><router-link to="/" @click="closeNav">Inicio</router-link></li>
            <li><router-link to="/juegos" @click="closeNav">Juegos</router-link></li>
            <li><router-link to="/misPuntuaciones" @click="closeNav">Mis puntuaciones</router-link></li>
            <li><router-link to="/puntuacionesGlobales" @click="closeNav">Puntuaciones Globales</router-link></li>
            <li><router-link to="/login" @click="closeNav">Iniciar Sesión</router-link></li>
          </ul>
        </div>
        <div class="footer-section">
          <h2>Redes Sociales</h2>
          <div class="social-icons">
            <a href="#"><i class="fab fa-facebook-f"></i></a>
            <a href="#"><i class="fab fa-twitter"></i></a>
            <a href="#"><i class="fab fa-whatsapp"></i></a>
            <a href="#"><i class="fab fa-instagram"></i></a>
          </div>
        </div>
        <div class="footer-section">
          <h2>Contáctanos</h2>
          <form>
            <input type="text" placeholder="Nombre">
            <input type="email" placeholder="Email">
            <button type="submit">ENVIAR</button>
          </form>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export default {
  setup() {
    const isLoggedIn = ref(false);
    const isNavOpen = ref(false);
    const router = useRouter();

    onAuthStateChanged(auth, (user) => {
      isLoggedIn.value = !!user;
    });

    const logout = async () => {
      try {
        await signOut(auth);
        isLoggedIn.value = false;
        router.push('/');
      } catch (error) {
        console.error('Error al cerrar sesión:', error);
      }
    };

    const toggleNav = () => {
      isNavOpen.value = !isNavOpen.value;
    };

    const closeNav = () => {
      isNavOpen.value = false;
    };

    return { isLoggedIn, isNavOpen, toggleNav, logout, closeNav };
  },
};
</script>

<style>
@import '/src/assets/CSS/app.css';
</style>
