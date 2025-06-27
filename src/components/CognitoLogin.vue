<template>
  <div>
    <div v-if="!user">
      <input v-model="email" placeholder="Email" />
      <input v-model="password" type="password" placeholder="Password" />
      <button @click="signInUser">登入</button>
      <div v-if="error">{{ error }}</div>
    </div>
    <input v-model="code" placeholder="code" />
    <button @click="confirmSignUp">確認</button>
  </div>
</template>

<script setup lang="ts">
import axios from "axios";
import CryptoJS from "crypto-js";
import { ref } from "vue";

const email = ref("");
const password = ref("");
const user = ref(null);
const error = ref("");

//
const CLIENT_ID = "2pdlkel377hajgnduf37aag4ha";
const REGION = "us-east-1";
//
const message = ref("");
const showConfirm = ref(false);

//
function getSecretHash(username, clientId, clientSecret) {
  const message = username + clientId;
  const hash = CryptoJS.HmacSHA256(message, clientSecret);
  console.log("hash", hash);
  console.log("==>", CryptoJS.enc.Base64.stringify(hash));
  return CryptoJS.enc.Base64.stringify(hash);
}

async function signInUser() {
  try {
    const response = await axios.post(
      `https://cognito-idp.${REGION}.amazonaws.com/`,
      {
        ClientId: CLIENT_ID,
        Username: email.value,
        Password: password.value,
        UserAttributes: [
          {
            Name: "email",
            Value: email.value,
          },
        ],
        SecretHash: getSecretHash(email.value, CLIENT_ID, "famoontta7vf3cg69lrmkmats0f62laqemqas30qibn5pkvk72m"),
      },
      {
        headers: {
          "Content-Type": "application/x-amz-json-1.1",
          "X-Amz-Target": "AWSCognitoIdentityProviderService.SignUp",
        },
      }
    );
    console.log("註冊成功：", response.data);
    message.value = "請輸入驗證碼完成註冊";
    error.value = "";
    showConfirm.value = true;
  } catch (err) {
    console.error("註冊失敗：", err);
    error.value = err?.response?.data?.message || "註冊錯誤";
  }
}

const code = ref("");
const confirmSignUp = async () => {
  console.log("confirmSignUp", code.value);
  try {
    const response = await axios.post(
      `https://cognito-idp.${REGION}.amazonaws.com/`,
      {
        ClientId: CLIENT_ID,
        Username: email.value,
        ConfirmationCode: code.value,
        SecretHash: getSecretHash(email.value, CLIENT_ID, "famoontta7vf3cg69lrmkmats0f62laqemqas30qibn5pkvk72m"),
      },
      {
        headers: {
          "Content-Type": "application/x-amz-json-1.1",
          "X-Amz-Target": "AWSCognitoIdentityProviderService.ConfirmSignUp",
        },
      }
    );
    console.log("驗證成功：", response.data);
    message.value = "註冊完成，請登入";
    error.value = "";
    showConfirm.value = false;
  } catch (err) {
    console.error("驗證失敗：", err);
    error.value = err?.response?.data?.message || "驗證錯誤";
  }
};
</script>
