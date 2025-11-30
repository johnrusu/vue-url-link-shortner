<template>
  <v-app-bar v-if="!isNilOrEmpty(user)" color="primary" elevation="2">
    <v-app-bar-title>
      <router-link
        to="/"
        class="text-white no-underline"
        :disabled="isDisabled"
      >
        {{ APP.TITLE }}
      </router-link>
      <v-btn
        variant="text"
        prepend-icon="mdi-information"
        color="white"
        to="/about"
        :disabled="isDisabled"
        class="ml-4 mr-4"
      >
        {{ LABELS.ABOUT }}
      </v-btn>
      <v-btn
        variant="text"
        prepend-icon="mdi-plus"
        color="white"
        to="/add-link"
        :disabled="isDisabled"
        v-if="currentUrl.includes('add-link') === false"
      >
        {{ LABELS.ADD_LINK }}
      </v-btn>
    </v-app-bar-title>

    <template #append>
      <v-menu location="bottom">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            variant="text"
            prepend-icon="mdi-account-circle"
            :disabled="isDisabled"
          >
            {{ user?.name || user?.email || LABELS.ACCOUNT }}
          </v-btn>
        </template>

        <v-card min-width="300">
          <v-card-text>
            <div class="flex flex-col gap-4 items-center text-center">
              <v-avatar size="64" :image="imageSrc"></v-avatar>
              <div>
                <p class="font-semibold text-gray-800">{{ user?.name }}</p>
                <p class="text-sm text-gray-500">{{ user?.email }}</p>
              </div>
            </div>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <v-btn
              block
              variant="text"
              prepend-icon="mdi-logout"
              @click="handleLogout"
            >
              {{ LABELS.LOGOUT }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-menu>
    </template>
  </v-app-bar>
</template>

<script setup lang="ts">
import {
  computed,
  onMounted,
  ref,
  type ComputedRef,
  type Ref,
  watch,
} from "vue";
import { useRoute } from "vue-router";

// utils
import { isNilOrEmpty, checkImage } from "@/utils";

// constants
import { APP, LABELS, PLACEHOLDER_IMAGE } from "@/constants";

// state
import { useLinksStore } from "@/store/links";

// types
import type { TUser } from "@/types";

// state
const linksStore = useLinksStore();
const isDisabled = computed(() => linksStore.loading);

const props = defineProps<{
  user?: TUser;
}>();

const emit = defineEmits<{
  (e: "logout"): void;
}>();

const route = useRoute();
const user: ComputedRef<TUser | undefined> = computed(() => props.user);
const imageSrc: Ref<string> = ref(PLACEHOLDER_IMAGE);
const currentUrl = ref<string>(window.location.href);

// Watch for route changes
watch(
  () => route.path,
  () => {
    currentUrl.value = window.location.href;
  }
);

onMounted(() => {
  if (!isNilOrEmpty(user.value?.picture)) {
    const picture = user.value?.picture as string;
    checkImage(picture).then((validImage) => {
      console.log(validImage?.src);
      imageSrc.value =
        !isNilOrEmpty(picture) && validImage
          ? (validImage?.src as string)
          : PLACEHOLDER_IMAGE;
    });
  }
});

const handleLogout = () => {
  emit("logout");
};
</script>
