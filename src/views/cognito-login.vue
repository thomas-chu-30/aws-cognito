<script setup lang="ts">
import {
  CognitoIdentityProviderClient,
  ConfirmSignUpCommand,
  GetUserCommand,
  InitiateAuthCommand,
  SignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import CryptoJS from "crypto-js";
import { ref } from "vue";

const email = ref("");
const password = ref("");
const user = ref(null);
const error = ref("");

const CLIENT_ID = import.meta.env.VITE_CLIENT_ID || "2pdlkel377hajgnduf37aag4ha";
const REGION = import.meta.env.VITE_REGION || "us-east-1";
const message = ref("");
const showConfirm = ref(false);

const clientSecret = import.meta.env.VITE_CLIENT_SECRET || "famoontta7vf3cg69lrmkmats0f62laqemqas30qibn5pkvk72m";
function getSecretHash(username, clientId) {
  console.log("clientSecret", clientSecret);
  if (!clientSecret || !username || !clientId) {
    throw new Error("SecretHash 參數未設定正確");
  }
  const message = username + clientId;
  const hash = CryptoJS.HmacSHA256(message, clientSecret);
  return CryptoJS.enc.Base64.stringify(hash);
}

const client = new CognitoIdentityProviderClient({ region: REGION });

async function signInUser() {
  try {
    const command = new SignUpCommand({
      ClientId: CLIENT_ID,
      Username: email.value,
      Password: password.value,
      UserAttributes: [
        {
          Name: "email",
          Value: email.value,
        },
      ],
      SecretHash: getSecretHash(email.value, CLIENT_ID),
    });
    const response = await client.send(command);
    message.value = "請輸入驗證碼完成註冊";
    error.value = "";
    showConfirm.value = true;
  } catch (err) {
    error.value = err.message || "註冊錯誤";
  }
}

const code = ref("");
const confirmSignUp = async () => {
  try {
    const command = new ConfirmSignUpCommand({
      ClientId: CLIENT_ID,
      Username: email.value,
      ConfirmationCode: code.value,
      SecretHash: getSecretHash(email.value, CLIENT_ID),
    });
    const response = await client.send(command);
    message.value = "註冊完成，請登入";
    error.value = "";
    showConfirm.value = false;
  } catch (err) {
    error.value = err.message || "驗證錯誤";
  }
};

const signIn = async () => {
  try {
    const command = new InitiateAuthCommand({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: CLIENT_ID,
      AuthParameters: {
        USERNAME: email.value,
        PASSWORD: password.value,
        SECRET_HASH: getSecretHash(email.value, CLIENT_ID),
      },
    });
    const response = await client.send(command);
    console.log("response", response);
    user.value = response.AuthenticationResult;
    window.localStorage.setItem("cognito_accessToken", response.AuthenticationResult.AccessToken);
    window.localStorage.setItem("cognito_refreshToken", response.AuthenticationResult.RefreshToken);
    message.value = `歡迎登入，${email.value}`;
    error.value = "";
  } catch (err) {
    error.value = err.message || "登入錯誤";
  }
};

const profile = ref(null);
const getUserProfile = async () => {
  const command = new GetUserCommand({
    AccessToken: window.localStorage.getItem("cognito_accessToken"),
  });
  const response = await client.send(command);
  profile.value = response;
};

const logout = () => {
  window.localStorage.removeItem("cognito_accessToken");
  window.localStorage.removeItem("cognito_refreshToken");
  user.value = null;
  profile.value = null;
  message.value = "已登出";
  error.value = "";
};
</script>
<template>
  <div class="login-container">
    <div class="login-card">
      <h2 class="login-title">AWS Cognito 註冊/登入</h2>
      <div v-if="!user">
        <input v-model="email" placeholder="Email" class="login-input" />
        <input v-model="password" type="password" placeholder="Password" class="login-input" />
        <button @click="signInUser" class="login-btn">註冊</button>
        <button
          @click="signIn"
          class="login-btn"
          style="margin-top: -0.5rem; background: linear-gradient(90deg, #06b6d4 0%, #6366f1 100%)"
        >
          登入
        </button>
      </div>
      <transition name="fade">
        <div v-if="showConfirm" class="confirm-section">
          <input v-model="code" placeholder="驗證碼 (code)" class="login-input" />
          <button @click="confirmSignUp" class="login-btn">確認</button>
        </div>
      </transition>
      <div v-if="message" class="login-message">{{ message }}</div>
      <div v-if="error" class="login-error">{{ error }}</div>
      <div v-if="user" class="login-message">歡迎，{{ email }}</div>
      <div v-if="profile" class="login-message" style="font-size: 0.8rem; text-align: left">
        <pre>{{ profile.UserAttributes }}</pre>
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
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;

  justify-content: center;
  background: linear-gradient(135deg, #e0e7ff 0%, #f0fdfa 100%);
}
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
