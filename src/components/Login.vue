<template>
  <form class="form" @submit.prevent="isRegister ? registerWithEmailAndPassword() : signInWithEmailAndPassword()">
    <div v-if="isRegister">
      <div class="flex-column">
        <label>Nombre de Usuario</label>
      </div>
      <div class="inputForm">
        <input type="text" class="input" v-model="username" placeholder="Introduce tu Nombre de Usuario" required>
      </div>
    </div>
    <div class="flex-column">
      <label>Email</label>
    </div>
    <div class="inputForm">
      <input type="email" class="input" v-model="email" placeholder="Introduce tu Email" required>
    </div>

    <div class="flex-column">
      <label>Contraseña</label>
    </div>
    <div class="inputForm">
      <input type="password" class="input" v-model="password" placeholder="Introduce tu Contraseña" required>
    </div>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <button type="submit" class="button-submit">{{ isRegister ? 'Registrarse' : 'Entrar' }}</button>

    <p class="p">¿{{ isRegister ? 'Ya tienes cuenta?' : 'Aún no tienes cuenta?' }}<span class="span"
        @click="toggleAuthMode">{{ isRegister ? 'Iniciar Sesión' : 'Registrarse' }}</span></p>

    <p class="p line">O</p>

    <div class="flex-row">
      <button class="btn google" style="color: black;" @click="signInWithGoogle">
        <svg version="1.1" width="20" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
          x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve">
          <path style="fill:#FBBB00;" d="M113.47,309.408L95.648,375.94l-65.139,1.378C11.042,341.211,0,299.9,0,256
          c0-42.451,10.324-82.483,28.624-117.732h0.014l57.992,10.632l25.404,57.644c-5.317,15.501-8.215,32.141-8.215,49.456
          C103.821,274.792,107.225,292.797,113.47,309.408z"></path>
          <path style="fill:#518EF8;" d="M507.527,208.176C510.467,223.662,512,239.655,512,256c0,18.328-1.927,36.206-5.598,53.451
          c-12.462,58.683-45.025,109.925-90.134,146.187l-0.014-0.014l-73.044-3.727l-10.338-64.535
          c29.932-17.554,53.324-45.025,65.646-77.911h-136.89V208.176h138.887L507.527,208.176L507.527,208.176z"></path>
          <path style="fill:#28B446;" d="M416.253,455.624l0.014,0.014C372.396,490.901,316.666,512,256,512
          c-97.491,0-182.252-54.491-225.491-134.681l82.961-67.911c22.175,65.675,84.511,113.084,156.544,113.084
          c30.021,0,58.166-8.237,82.344-22.634L416.253,455.624z"></path>
          <path style="fill:#F14336;" d="M419.404,58.004l-82.943,67.91c-24.688-14.936-53.645-23.597-84.461-23.597
          c-67.317,0-125.364,43.047-146.263,103.063l-83.16-68.045h-0.014C72.857,54.195,158.253,0,256,0
          C318.115,0,375.069,22.126,419.404,58.004z"></path>
        </svg>
        <span class="button-text">Google</span>
      </button>
      <button class="btn facebook" style="color: black;" @click="signInWithFacebook">
        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="30" height="30" viewBox="0 0 48 48">
          <path fill="#039be5" d="M24 5A19 19 0 1 0 24 43A19 19 0 1 0 24 5Z"></path>
          <path fill="#fff"
            d="M26.572,29.036h4.917l0.772-4.995h-5.69v-2.73c0-2.075,0.678-3.915,2.619-3.915h3.119v-4.359c-0.548-0.074-1.707-0.236-3.897-0.236c-4.573,0-7.254,2.415-7.254,7.917v3.323h-4.701v4.995h4.701v13.729C22.089,42.905,23.032,43 24,43c0.875,0,1.729-0.08,2.572-0.194V29.036z">
          </path>
        </svg>
        <span class="button-text">Facebook</span>
      </button>
    </div>
  </form>
</template>

<script>
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, FacebookAuthProvider } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

export default {
  data() {
    return {
      email: '',
      password: '',
      username: '',
      isRegister: false,
      errorMessage: '',
      redirectTo: this.getRedirectUrl() || '/'
    };
  },
  methods: {
    toggleAuthMode() {
      this.isRegister = !this.isRegister;
    },
    async registerWithEmailAndPassword() {
      const auth = getAuth();
      const db = getFirestore();
      if (this.validatePassword(this.password)) {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, this.email, this.password);
          const user = userCredential.user;
          await setDoc(doc(db, "usuarios", user.uid), {
            Id: user.uid,
            NombreDeUsuario: this.username
          });
          this.redirectToOriginalPage();
        } catch (error) {
          this.errorMessage = error.message;
        }
      }
    },
    async signInWithEmailAndPassword() {
      const auth = getAuth();
      try {
        const userCredential = await signInWithEmailAndPassword(auth, this.email, this.password);
        this.redirectToOriginalPage();
      } catch (error) {
        this.errorMessage = error.message;
      }
    },
    async signInWithGoogle() {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      try {
        const result = await signInWithPopup(auth, provider);
        this.redirectToOriginalPage();
      } catch (error) {
        this.errorMessage = error.message;
      }
    },
    async signInWithFacebook() {
      const auth = getAuth();
      const provider = new FacebookAuthProvider();
      try {
        const result = await signInWithPopup(auth, provider);
        this.redirectToOriginalPage();
      } catch (error) {
        this.errorMessage = error.message;
      }
    },
    validatePassword(password) {
      if (password.length < 6) {
        this.errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
        return false;
      }
      if (!/[A-Z]/.test(password)) {
        this.errorMessage = 'La contraseña debe contener al menos una letra mayúscula.';
        return false;
      }
      if (!/[a-z]/.test(password)) {
        this.errorMessage = 'La contraseña debe contener al menos una letra minúscula.';
        return false;
      }
      if (!/\d/.test(password)) {
        this.errorMessage = 'La contraseña debe contener al menos un número.';
        return false;
      }
      this.errorMessage = '';
      return true;
    },
    getRedirectUrl() {
      const params = new URLSearchParams(window.location.search);
      return params.get('redirectTo');
    },
    redirectToOriginalPage() {
      window.location.href = this.redirectTo;
    }
  }
};
</script>

<style>
@import '../assets/CSS/login.css';
</style>
