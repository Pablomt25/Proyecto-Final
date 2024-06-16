import { reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from './firebase'

const state = reactive({
  isAuthenticated: false,
  user: null
})

const setAuthenticated = (status, user = null) => {
  state.isAuthenticated = status
  state.user = user
}

const initAuthState = () => {
  const router = useRouter()
  auth.onAuthStateChanged((user) => {
    if (user) {
      setAuthenticated(true, user)
    } else {
      setAuthenticated(false)
      if (router.currentRoute.value.path !== '/') {
        router.push('/')
      }
    }
  })
}

const signOut = async () => {
  try {
    await auth.signOut()
  } catch (error) {
    console.error('Error al cerrar sesión:', error)
  }
}

watch(
  () => state.isAuthenticated,
  (newVal) => {
    const router = useRouter()
    if (!newVal && router.currentRoute.value.path !== '/') {
      router.push('/')
    }
  }
)

export default {
  state,
  setAuthenticated,
  initAuthState,
  signOut 
}
