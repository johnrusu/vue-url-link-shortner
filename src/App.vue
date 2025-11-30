<template>
  <v-app>
    <v-main>
      <AppHeader
        :user="user"
        @logout="handleLogout"
        v-if="isAuthenticated && user"
      />
      <v-container fluid>
        <div
          class="w-[200px] flex items-center justify-center mx-auto min-h-screen"
          v-if="isLoading"
        >
          <AnimationGenerator :jsonData="loadingAnimation" />
        </div>

        <div
          v-else-if="error"
          class="flex items-center justify-center min-h-screen"
        >
          <div class="text-center max-w-md p-6">
            <div class="text-3xl font-bold text-red-600 mb-2">
              {{ LABELS.ERROR_TITLE }}
            </div>
            <div class="text-lg text-gray-700 mb-2">
              {{ LABELS.ERROR_MESSAGE }}
            </div>
            <div class="text-sm text-gray-500">{{ error.message }}</div>
          </div>
        </div>

        <div
          v-else-if="!isAuthenticated"
          class="flex flex-col gap-4 text-center max-w-2xl w-full mx-auto items-center justify-center min-h-screen"
        >
          <div class="mb-3">
            <img src="/favicons/apple-icon-180x180.png" alt="App Icon" />
          </div>
          <h1 class="text-4xl font-bold text-gray-800">
            {{ LABELS.WELCOME_TITLE }}
          </h1>
          <p class="text-xl text-gray-600">{{ APP.DESCRIPTION }}</p>
          <div class="mt-4">
            <v-btn
              @click="handleLogin"
              color="primary"
              size="large"
              prepend-icon="mdi-login"
            >
              {{ LABELS.BUTTON_LOGIN_TITLE }}
            </v-btn>
          </div>
        </div>
        <router-view v-else />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { useAuth0 } from "@auth0/auth0-vue";

// constants
import { APP, LABELS } from "@/constants";

const { isAuthenticated, isLoading, error, user, logout, loginWithRedirect } =
  useAuth0();

// components
import AppHeader from "@/components/AppHeader.vue";
import AnimationGenerator from "@/components/AnimationGenerator.vue";

// json animations
import loadingAnimation from "@/assets/animations/loading.json";

const handleLogout = () => {
  logout({
    logoutParams: {
      returnTo: `${window.location.origin}${import.meta.env.BASE_URL}`,
    },
  });
};

const handleLogin = () => {
  loginWithRedirect();
};
</script>
