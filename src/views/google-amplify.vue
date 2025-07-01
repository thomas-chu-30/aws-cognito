<script setup lang="ts">
import { onMounted, ref } from "vue";

// Amplify.configure(awsconfig as ResourcesConfig);

const profile = ref(null);
const error = ref("");
const message = ref("");

// AWS Cognito OAuth 設定
const CLIENT_ID = "76fvfp1bad65i00q1t9nttbn3r";
const COGNITO_DOMAIN = "https://us-east-1y5tslqmqo.auth.us-east-1.amazoncognito.co";
const REDIRECT_URI = "http://localhost:5173/aws-cognito/google-amplify";

// Google 登入函數 - 使用 Cognito OAuth
const loginWithGoogle = () => {
  const url =
    `${COGNITO_DOMAIN}/oauth2/authorize?` +
    new URLSearchParams({
      response_type: "code",
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      identity_provider: "Google",
      scope: "openid email name",
    });

  window.location.href = url;

  //
};

// 處理 OAuth 回調
const handleOAuthCallback = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code");

  if (code) {
    try {
      // 交換 authorization code 取得 token
      const params = new URLSearchParams({
        grant_type: "authorization_code",
        client_id: CLIENT_ID,
        code,
        redirect_uri: REDIRECT_URI,
        client_secret: "famoontta7vf3cg69lrmkmats0f62laqemqas30qibn5pkvk72m",
      });

      const response = await fetch(`${COGNITO_DOMAIN}/oauth2/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
      });

      const data = await response.json();
      console.log("Cognito token response:", data);

      if (data.access_token) {
        // 儲存 token
        localStorage.setItem("cognito_accessToken", data.access_token);
        localStorage.setItem("cognito_idToken", data.id_token);
        localStorage.setItem("cognito_refreshToken", data.refresh_token);

        // 解析 ID token 取得用戶資訊
        const decodedToken = parseJwt(data.id_token);
        profile.value = {
          ...decodedToken,
          cognitoTokens: data,
        };
        message.value = `歡迎登入，${decodedToken.name || decodedToken.email}`;
        error.value = "";

        // 清除 URL 中的 code 參數
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        throw new Error("Token exchange failed");
      }
    } catch (err) {
      console.error("OAuth callback error:", err);
      error.value = err.message || "OAuth 回調處理失敗";
    }
  }
};

// 使用簡單的 base64 解析 JWT（不驗證簽章）
function parseJwt(token: string) {
  console.log("token: ", token);
  if (!token) return null;
  try {
    // 簡單的 JWT 解析，只取 payload 部分
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid JWT format");
    }

    // 解碼 payload（第二部分）
    const payload = parts[1];
    // 處理 base64url 編碼
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const decoded = atob(padded);
    return JSON.parse(decoded);
  } catch (err) {
    console.error("JWT parsing error:", err);
    return null;
  }
}

// 取得用戶資訊
const getUserProfile = async () => {
  try {
    const accessToken = localStorage.getItem("cognito_accessToken");
    if (!accessToken) {
      error.value = "沒有可用的認證 token";
      return;
    }

    // 使用 AWS SDK 取得用戶資訊
    const response = await fetch(`${COGNITO_DOMAIN}/oauth2/userInfo`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.ok) {
      const userInfo = await response.json();
      profile.value = {
        ...profile.value,
        cognitoUserInfo: userInfo,
      };
      message.value = "已取得 Cognito 用戶資訊";
      error.value = "";
    } else {
      throw new Error("Failed to get user info");
    }
  } catch (err) {
    console.error("Error getting user profile:", err);
    error.value = err.message || "取得用戶資訊失敗";
  }
};

// 登出
const logout = async () => {
  try {
    // 清除所有 token
    localStorage.removeItem("cognito_accessToken");
    localStorage.removeItem("cognito_idToken");
    localStorage.removeItem("cognito_refreshToken");
    localStorage.removeItem("google_token");

    profile.value = null;
    message.value = "已登出";
    error.value = "";
  } catch (err) {
    console.error("Logout error:", err);
    error.value = err.message || "登出失敗";
  }
};

// 當頁面載入時檢查 OAuth 回調
onMounted(() => {
  handleOAuthCallback();
});
</script>

<template>
  <div class="flex flex-col items-center justify-center">
    <h1 class="mb-4">Google 登入 (AWS Cognito OAuth)</h1>

    <!-- Google 登入按鈕 -->
    <button class="login-btn" style="max-width: 320px" @click="loginWithGoogle" :disabled="!!profile">
      Sign in with Google (via Cognito)
    </button>

    <!-- 用戶資訊顯示 -->
    <div v-if="profile" class="mt-4 text-sm break-all overflow-x-auto max-w-md">
      <h3 class="font-semibold mb-2">用戶資訊：</h3>
      <pre class="bg-gray-100 p-2 rounded text-xs">{{ profile }}</pre>
    </div>

    <!-- 按鈕區域 -->
    <div class="flex flex-col gap-2 mt-4">
      <button class="login-btn" style="max-width: 320px" @click="getUserProfile" :disabled="!profile">
        取得 Cognito 用戶資訊
      </button>

      <button class="login-btn" style="max-width: 320px; background: #ef4444" @click="logout" :disabled="!profile">
        登出
      </button>
    </div>

    <!-- 訊息顯示 -->
    <div v-if="message" class="mt-4 p-2 bg-green-100 text-green-800 rounded">
      {{ message }}
    </div>

    <div v-if="error" class="mt-4 p-2 bg-red-100 text-red-800 rounded">
      {{ error }}
    </div>
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

.login-btn:hover:not(:disabled) {
  background: linear-gradient(90deg, #4f46e5 0%, #0ea5e9 100%);
}

.login-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
