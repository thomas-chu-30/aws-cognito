import { createApp } from "vue";
import App from "./App.vue";
import "./assets/main.css";

import { Amplify } from "aws-amplify";
import awsconfig from "./aws-exports";

Amplify.configure(awsconfig); // 包含 Auth 的初始化

createApp(App).mount("#app");
