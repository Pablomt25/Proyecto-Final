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
      </div>
      <ul class="nav-links" :class="{ 'nav-active': isNavOpen }">
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
    </nav>

    <!-- Contenido de la página -->
    <div class="content">
      <router-view />
    </div>

    <!-- Footer -->
    <footer>
      <div class="footer-content">
        <div class="footer-section">
          <img src="./assets/logo.png" alt="Logo">
          <p class="contact-info">
            <i class="fas fa-phone"></i> +34 345 657 657<br><br>
            <i class="fas fa-envelope"></i> molajuegos@gmail.com<br>
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

<style scoped>
/* Estilo general */
body, html {
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
  background-color: #f2f2f2;
  height: 100%;
}

.page-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

nav {
  background-color: #000000;
  margin: 0;
}

.nav-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
}

.nav-toggle {
  background: transparent;
  border: none;
  color: #ecf0f1;
  font-size: 24px;
  cursor: pointer;
  transition: transform 0.3s ease;
  display: none; /* Ocultar el botón de hamburguesa por defecto */
}

.nav-toggle:focus {
  outline: none;
}

.nav-toggle:hover {
  transform: scale(1.1);
}

.nav-links {
  display: flex;
  justify-content: space-around;
  list-style-type: none;
  padding: 0;
  margin: 0;
  transition: max-height 0.3s ease-out;
  overflow: hidden;
  max-height: 0;
}

.nav-links.nav-active {
  max-height: 300px; /* Altura máxima cuando está abierto */
}

.nav-links li {
  position: relative;
}

.nav-links a {
  font-size: 18px;
  color: #ecf0f1;
  text-decoration: none;
  padding: 10px 10px;
  transition: background-color 0.3s, color 0.3s;
  display: block;
}

.nav-links a:hover {
  background-color: #34495e;
  color: #ffffff;
  border-radius: 5px;
}

.nav-links a::after {
  content: "";
  position: absolute;
  width: 100%;
  height: 2px;
  background-color: #ecf0f1;
  bottom: -2px;
  left: 0;
  transform: scaleX(0);
  transform-origin: bottom right;
  transition: transform 0.3s ease-out;
}

.nav-links a:hover::after {
  transform: scaleX(1);
  transform-origin: bottom left;
}

/* Deshabilitar transiciones y efectos de hover para el logo */
.logo-link {
  transition: none;
}

.logo-link:hover {
  background-color: transparent;
  color: inherit;
}

.logo-link::after {
  content: none;
}

.content {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 50px 20px;
  max-width: 1400px;
  margin: auto;
}

/* Footer */
footer {
  width: 100%;
  background-color: #000000;
  padding: 20px 0;
  color: #fff;
  display: flex;
  justify-content: center;
}

footer img {
  width: 150px;
  margin-bottom: 20px;
}

footer h2 {
  color: #FFEDA6;
}

.footer-content {
  display: flex;
  flex-wrap: wrap; /* Permitir que los elementos se envuelvan en pantallas pequeñas */
  justify-content: space-between;
  max-width: 1200px;
  width: 100%;
}

.footer-section {
  flex: 1;
  padding: 20px;
}

.footer-section h2 {
  font-size: 20px;
  margin-bottom: 20px;
}

.footer-section ul {
  list-style-type: none;
  padding: 0;
}

.footer-section ul li {
  margin-bottom: 10px;
}

.footer-section ul li a {
  color: #fff;
  text-decoration: none;
  transition: color 0.3s;
}

.footer-section ul li a:hover {
  color: #FFEDA6;
}

.social-icons {
  display: flex;
  gap: 10px;
}

.social-icons a {
  color: #fff;
  font-size: 20px;
  transition: color 0.3s;
}

.social-icons a:hover {
  color: #dae791;
}

footer form {
  display: flex;
  flex-direction: column;
}

footer form input {
  margin-bottom: 10px;
  padding: 10px;
  border: none;
  border-radius: 5px;
}

footer form button {
  background-color: #dae791;
  color: #000;
  border: none;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

footer form button:hover {
  background-color: #c5d362;
}

/* Estilo para los iconos de contacto */
.contact-info i {
  color: #FFEDA6; /* Cambia este color al que desees */
}

/* Media Queries para Tablets y Dispositivos más pequeños */
@media screen and (min-width: 576px) and (max-width: 991px) {
  .nav-toggle {
    display: none; /* Ocultar el botón de hamburguesa en tablets */
  }

  .nav-links {
    flex-direction: row;
    align-items: center;
    max-height: initial;
    overflow: visible; /* Cambiado de hidden a visible para asegurar que los enlaces sean visibles */
    transition: none;
  }

  .nav-links li {
    margin-bottom: 0;
  }

  .nav-links a {
    padding: 10px 15px;
    font-size: 16px;
  }

  .content {
    padding: 30px 20px;
  }

  footer {
    padding: 20px 0;
  }

  .footer-section {
    padding: 20px;
  }

  footer img {
    width: 120px;
  }
}

/* Media Queries para Móviles y Dispositivos Pequeños */
@media screen and (max-width: 575px) {
  .nav-toggle {
    display: block; /* Mostrar el botón de hamburguesa en móviles */
  }

  .nav-links {
    flex-direction: column;
    align-items: center;
    max-height: initial;
    overflow: hidden;
    transition: max-height 0.5s ease-out;
  }

  .nav-links li {
    margin-bottom: 10px;
    text-align: center;
  }

  .nav-toggle {
    display: block;
    margin-right: 20px;
    z-index: 2;
  }

  .nav-active {
    max-height: 1000px; /* Ajustar la altura máxima para mostrar todos los enlaces */
  }

  .nav-links a {
    font-size: 16px;
    padding: 8px 0;
  }

  .footer-content {
    flex-direction: column;
    align-items: center;
  }

  .footer-section {
    padding: 10px;
    text-align: center;
    margin-bottom: 20px;
  }

  .footer-section h2 {
    font-size: 18px;
  }

  footer img {
    width: 120px;
  }
}

/* Media Queries para Portátiles y Dispositivos Medianos */
@media screen and (min-width: 992px) {
  .nav-toggle {
    display: none; /* Asegurar que el botón de hamburguesa no se muestre en portátiles */
  }

  .nav-links {
    display: flex !important; /* Asegurar que los enlaces sean visibles en todo momento */
    max-height: initial !important;
    overflow: visible !important;
    transition: none !important;
  }

  .nav-links li {
    margin-bottom: 0;
  }

  .nav-links a {
    padding: 10px 15px;
    font-size: 16px;
  }

  .content {
    padding: 50px 20px;
  }

  footer {
    padding: 20px 0;
  }

  .footer-section {
    padding: 20px;
  }

  footer img {
    width: 150px;
    margin-bottom: 20px;
  }
}

</style>
