import { createApp } from "vue";
import App from "./App.vue";
import "./assets/main.css";

import { createRouter, createWebHistory } from "vue-router";
// components
import CognitoLoginAmplify from "./views/cognito-login-amplify.vue";
import CognitoLogin from "./views/cognito-login.vue";
import GoogleAmplify from "./views/google-amplify.vue";
import Google from "./views/google.vue";

// Amplify.configure(awsconfig); // 包含 Auth 的初始化

const routes = [
  { path: "/", component: CognitoLogin },
  { path: "/cognito-login-amplify", component: CognitoLoginAmplify },
  { path: "/google", component: Google },
  { path: "/google-amplify", component: GoogleAmplify },
];

const router = createRouter({
  history: createWebHistory("/aws-cognito"),
  routes,
});

const app = createApp(App);
app.use(router);
app.mount("#app");
