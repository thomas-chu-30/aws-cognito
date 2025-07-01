<script setup></script>

<template>
  <div class="login-container flex flex-col">
    <ol class="flex space-x-4 py-4 items-center justify-center">
      <li class="underline"><router-link to="/">Cognito Login</router-link></li>
      <li class="underline"><router-link to="/cognito-login-amplify">Cognito Login Amplify</router-link></li>
      <li class="underline"><router-link to="/google">Google Login</router-link></li>
    </ol>
    <div class="flex-1 flex items-center justify-center">
      <router-view />
    </div>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #e0e7ff 0%, #f0fdfa 100%);
}
</style>
