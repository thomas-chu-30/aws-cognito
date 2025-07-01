<script setup lang="ts">
import { CognitoIdentityProviderClient, GetUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import { onMounted, ref } from "vue";

const CLIENT_ID = "2pdlkel377hajgnduf37aag4ha";
const COGNITO_DOMAIN = "https://us-east-1fwwk6rvn2.auth.us-east-1.amazoncognito.com";
const REDIRECT_URI = "http://localhost:5173/aws-cognito/google";

console.log("COGNITO_DOMAIN", COGNITO_DOMAIN);
const loginWithGoogle = () => {
  const url =
    `${COGNITO_DOMAIN}/oauth2/authorize?` +
    new URLSearchParams({
      response_type: "code",
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      identity_provider: "Google",
      scope: "openid",
    });

  window.location.href = url;
};

// 當頁面載入時檢查 URL 是否有 code，若有則自動交換 token
onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code");
  if (code) {
    const params = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: CLIENT_ID,
      code,
      redirect_uri: REDIRECT_URI,
      client_secret: "famoontta7vf3cg69lrmkmats0f62laqemqas30qibn5pkvk72m",
    });
    fetch(`${COGNITO_DOMAIN}/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Cognito token response:", data);
        window.localStorage.setItem("cognito_accessToken", data.access_token);

        // getCognitoUser();

        window.localStorage.setItem("cognito_refreshToken", data.refresh_token);
        window.localStorage.setItem("cognito_idToken", data.id_token);

        // 解析 Google profile
      })
      .catch((err) => {
        console.error("Token exchange error:", err);
      });
  }
});

const profile = ref(null);
const getUserProfile = async () => {
  const googleProfile = parseJwt(window.localStorage.getItem("cognito_idToken"));
  profile.value = googleProfile;
};

// 解析 JWT（純前端解碼，不驗證簽章）
function parseJwt(token) {
  if (!token) return null;
  return JSON.parse(atob(token.split(".")[1]));
}

const REGION = import.meta.env.VITE_REGION;
const client = new CognitoIdentityProviderClient({ region: REGION });
const getCognitoUser = async () => {
  try {
    const command = new GetUserCommand({
      AccessToken: window.localStorage.getItem("cognito_accessToken"),
    });
    const response = await client.send(command);
    profile.value = response;
  } catch (error) {
    console.error("Error getting Cognito user:", error);
  }
};
</script>
<template>
  <div class="flex flex-col items-center justify-center">
    <h1 class="mb-4">Google</h1>

    <button class="login-btn" style="max-width: 320px" @click="loginWithGoogle">Sign in with Google</button>
    <div class="mt-4 text-sm break-all overflow-x-auto">
      <pre>{{ profile }}</pre>
    </div>
    <button class="login-btn" style="max-width: 320px" @click="getUserProfile">Get User Profile</button>
    <button class="login-btn" style="max-width: 320px" @click="getCognitoUser">Get Cognito User</button>
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
