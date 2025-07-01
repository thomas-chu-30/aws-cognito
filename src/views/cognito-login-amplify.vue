<script setup lang="ts">
import { confirmSignUp, getCurrentUser, signIn, signOut, signUp } from "@aws-amplify/auth";
import { Amplify, type ResourcesConfig } from "aws-amplify";
import { ref } from "vue";
import awsconfig from "../aws-exports";

console.log("awsconfig", awsconfig);
Amplify.configure(awsconfig as ResourcesConfig);

const email = ref("coreisdontgu@gmail.com");
const password = ref("@EAsingle123");
const user = ref(null);
const error = ref("");
const message = ref("");
const showConfirm = ref(false);
const code = ref("");
const profile = ref(null);

const userName = ref("");
async function signInUser() {
  try {
    await signUp({
      username: userName.value,
      password: password.value,
      options: { userAttributes: { email: email.value } },
    });
    showConfirm.value = true;
    message.value = "請輸入驗證碼完成註冊";
    error.value = "";
  } catch (err) {
    error.value = err.message || "註冊失敗";
  }
}

const confirmSignUpHandler = async () => {
  try {
    await confirmSignUp({ username: userName.value, confirmationCode: code.value });
    message.value = "註冊完成，請登入";
    error.value = "";
    showConfirm.value = false;
  } catch (err) {
    error.value = err.message || "驗證錯誤";
  }
};

const signInHandler = async () => {
  try {
    const userData = await signIn({ username: email.value, password: password.value });
    user.value = userData;
    message.value = `歡迎登入，${email.value}`;
    error.value = "";
  } catch (err) {
    error.value = err.message || "登入錯誤";
  }
};

const getUserProfile = async () => {
  try {
    profile.value = await getCurrentUser();
    console.log("profile", profile.value);
  } catch (err) {
    error.value = err.message || "取得 profile 失敗";
  }
};

const logout = async () => {
  try {
    await signOut();
    user.value = null;
    profile.value = null;
    message.value = "已登出";
    error.value = "";
  } catch (err) {
    error.value = err.message || "登出失敗";
  }
};
</script>
<template>
  <div class="flex items-center justify-center h-full">
    <div class="login-card">
      <h2 class="login-title">AWS Cognito 註冊/登入</h2>
      <div v-if="!user">
        <input v-model="userName" placeholder="name" class="login-input" />
        <input v-model="email" placeholder="Email" class="login-input" />
        <input v-model="password" type="password" placeholder="Password" class="login-input" />
        <button @click="signInUser" class="login-btn">註冊</button>
        <button
          @click="signInHandler"
          class="login-btn"
          style="margin-top: -0.5rem; background: linear-gradient(90deg, #06b6d4 0%, #6366f1 100%)"
        >
          登入
        </button>
        <button @click="logout" class="login-btn" style="background: #ef4444; color: #fff; margin-top: 0.5rem">
          登出
        </button>
      </div>
      <transition name="fade">
        <div v-if="showConfirm" class="confirm-section">
          <input v-model="code" placeholder="驗證碼 (code)" class="login-input" />
          <button @click="confirmSignUpHandler" class="login-btn">確認</button>
        </div>
      </transition>
      <div v-if="message" class="login-message">{{ message }}</div>
      <div v-if="error" class="login-error">{{ error }}</div>
      <div v-if="user" class="login-message">歡迎，{{ email }}</div>
      <div v-if="profile" class="login-message" style="font-size: 0.8rem; text-align: left">
        <pre>{{ profile }}</pre>
      </div>
      <div v-if="user" class="">
        <button @click="getUserProfile" class="login-btn">取得 profile</button>
        <button @click="logout" class="login-btn" style="background: #ef4444; color: #fff; margin-top: 0.5rem">
          登出
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-card {
  background: #fff;
  padding: 2.5rem 2rem 2rem 2rem;
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08), 0 1.5px 6px rgba(0, 0, 0, 0.04);
  min-width: 620px;
  max-width: 90vw;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.login-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #3730a3;
}
.login-input {
  width: 100%;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  border: 1px solid #c7d2fe;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: border 0.2s;
}
.login-input:focus {
  border-color: #6366f1;
  background: #f5f3ff;
}
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
.login-btn:hover {
  background: linear-gradient(90deg, #4f46e5 0%, #0ea5e9 100%);
}
.login-message {
  color: #059669;
  background: #ecfdf5;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  margin-bottom: 0.5rem;
  font-size: 0.98rem;
  text-align: center;
}
.login-error {
  color: #dc2626;
  background: #fef2f2;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  margin-bottom: 0.5rem;
  font-size: 0.98rem;
  text-align: center;
}
.confirm-section {
  width: 100%;
  margin-bottom: 1rem;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
