<script setup lang="ts">
const CLIENT_ID = "2pdlkel377hajgnduf37aag4ha";
const COGNITO_DOMAIN = "https://cognito-idp.us-east-1.amazonaws.com";
const REDIRECT_URI = "http://localhost:3000/aws-cognito/google";

const loginWithGoogle = () => {
  const url =
    `${COGNITO_DOMAIN}/oauth2/authorize?` +
    new URLSearchParams({
      response_type: "token", // or 'code' if你想走 code flow
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      identity_provider: "Google",
      scope: "openid email profile",
    });

  window.location.href = url;
};
</script>
<template>
  <div class="flex flex-col items-center justify-center">
    <h1 class="mb-4">Google</h1>

    <button class="login-btn" style="max-width: 320px" @click="loginWithGoogle">Sign in with Google</button>
  </div>
</template>

<style scoped>
.login-btn {
  width: 100%;
  padding: 0.75rem 1rem;
  background: linear-gradient(90deg, #6366f1 0%, #06b6d4 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 1rem;
  transition: background 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.08);
}
</style>
