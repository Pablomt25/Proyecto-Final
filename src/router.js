
import { createRouter, createWebHistory } from 'vue-router';
import { auth } from './firebase'; // Importar la autenticación de Firebase
import Inicio from './components/Inicio.vue';
import Login from './components/Login.vue';
import Juegos from './components/Juegos.vue';
import PongGame from './components/PongGame.vue';
import ColorGame from './components/ColorGame.vue';
import AhorcadoGame from './components/AhorcadoGame.vue';
import PokemonGame from './components/PokemonGame.vue';
import MemoriaGame from './components/MemoriaGame.vue';
import TresEnRayaGama from './components/TresEnRayaGama.vue';
import SerpienteGame from './components/SerpienteGame.vue';
import AdivinaNumeroGame from './components/AdivinaNumeroGame.vue';
import MisPuntuaciones from './components/MisPuntuaciones.vue';
import PuntuacionesGlobales from './components/PuntuacionesGlobales.vue';


const routes = [
  {
    path: '/',
    name: 'Inicio',
    component: Inicio
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    props: route => ({ redirect: route.query.redirect }) 
  },
  {
    path: '/juegos',
    name: 'Juegos',
    component: Juegos
  },
  {
    path: '/pong',
    name: 'PongGame',
    component: PongGame,
    meta: { requiresAuth: true }
  },
  {
    path: '/color',
    name: 'ColorGame',
    component: ColorGame,
    meta: { requiresAuth: true }
  },
  {
    path: '/pokemon',
    name: 'PokemonGame',
    component: PokemonGame,
    meta: { requiresAuth: true }
  },
  {
    path: '/ahorcado',
    name: 'AhorcadoGame',
    component: AhorcadoGame,
    meta: { requiresAuth: true }
  },
  {
    path: '/memoria',
    name: 'MemoriaGame',
    component: MemoriaGame,
    meta: { requiresAuth: true }
  },
  {
    path: '/tresenraya',
    name: 'TresEnRayaGama',
    component: TresEnRayaGama,
    meta: { requiresAuth: true }
  },
  {
    path: '/serpiente',
    name: 'SerpienteGame',
    component: SerpienteGame,
    meta: { requiresAuth: true }
  },
  {
    path: '/adivinaNumero',
    name: 'AdivinaNumeroGame',
    component: AdivinaNumeroGame,
    meta: { requiresAuth: true }
  },
  {
    path: '/misPuntuaciones',
    name: 'MisPuntuaciones',
    component: MisPuntuaciones,
    meta: { requiresAuth: true }
  },
  {
    path: '/puntuacionesGlobales',
    name: 'PuntuacionesGlobales',
    component: PuntuacionesGlobales
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Guard de navegación para proteger las rutas
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const isAuthenticated = auth.currentUser;

  if (requiresAuth && !isAuthenticated) {
    next({
      path: '/login',
      query: { redirect: to.fullPath } // Pasar la ruta original como parámetro de consulta
    });
  } else {
    next();
  }
});

export default router;
