import { createApp } from "vue";
import App from "./App.vue";
import "./assets/main.css";

import { Amplify } from "aws-amplify";
import awsconfig from "./aws-exports";

import { createRouter, createWebHistory } from "vue-router";
import CognitoLogin from "./views/cognito-login.vue";
import Google from "./views/google.vue";

Amplify.configure(awsconfig); // 包含 Auth 的初始化

const routes = [
  { path: "/", component: CognitoLogin },
  { path: "/google", component: Google },
];

const router = createRouter({
  history: createWebHistory("/aws-cognito"),
  routes,
});

const app = createApp(App);
app.use(router);
app.mount("#app");
