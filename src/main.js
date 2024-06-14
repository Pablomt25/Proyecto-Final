import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // Importa el router desde tu archivo de rutas
import '@fortawesome/fontawesome-free/css/all.css'
import auth from './auth'

// Inicializa el estado de autenticación antes de montar la aplicación
auth.initAuthState()

const app = createApp(App)
app.use(router)
app.mount('#app')

// Manejar el evento de cierre de sesión
auth.onLogout(() => {
  router.push({ path: '/' }); // Redirigir al usuario a la página de inicio
});
