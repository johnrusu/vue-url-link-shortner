<template>
  <v-card class="w-full" :loading="loading">
    <v-card-title>{{ LABELS.ADD_LINK_TITLE }}</v-card-title>
    <v-card-text>
      <v-form ref="formRef" v-model="valid" @submit.prevent="handleSubmit">
        <v-text-field
          v-model="formData.url"
          :label="LABELS.URL_LABEL"
          :rules="urlRules"
          :placeholder="LABELS.URL_PLACEHOLDER"
          prepend-inner-icon="mdi-link"
          variant="outlined"
          required
          class="mb-4"
        ></v-text-field>

        <v-text-field
          v-model="formData.shortCode"
          :label="LABELS.SHORT_CODE_LABEL"
          :rules="shortCodeRules"
          :placeholder="LABELS.SHORT_CODE_PLACEHOLDER"
          prepend-inner-icon="mdi-link-variant"
          variant="outlined"
          :hint="LABELS.SHORT_CODE_HINT"
          persistent-hint
        ></v-text-field>
      </v-form>
    </v-card-text>

    <v-card-actions class="pa-4 flex flex-col gap-4 w-full">
      <div class="flex flex-row justify-end w-full">
        <v-btn
          variant="text"
          prepend-icon="mdi-arrow-left"
          @click="handleGoBack"
          :disabled="loading"
        >
          {{ LABELS.GO_BACK }}
        </v-btn>
        <v-btn variant="outlined" @click="handleReset" :disabled="loading">
          {{ LABELS.CANCEL }}
        </v-btn>
        <v-btn
          color="primary"
          :loading="loading"
          :disabled="!valid"
          @click="handleSubmit"
          prepend-icon="mdi-plus"
        >
          {{ LABELS.ADD_LINK }}
        </v-btn>
      </div>

      <div
        v-if="!isNilOrEmpty(linkCreationStatus) && linkCreationStatus.display"
        class="w-full mt-4"
      >
        <v-alert
          :icon="
            linkCreationStatus.success
              ? 'mdi-check-circle'
              : 'mdi-alert-circle-outline'
          "
          :text="linkCreationStatus.message as string"
          :type="linkCreationStatus.success ? 'success' : 'error'"
        />
      </div>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useAuth0 } from "@auth0/auth0-vue";
import { useRouter } from "vue-router";

// constants
import { routes, LABELS } from "@/constants";
import { isNilOrEmpty } from "@/utils";

// Auth0
const { getAccessTokenSilently } = useAuth0();

// Router
const router = useRouter();

// Types
interface LinkFormData {
  url: string;
  shortCode: string;
}

// Emits
const emit = defineEmits<{
  linkCreated: [];
}>();

// State
const formRef = ref();
const valid = ref(false);
const loading = ref(false);
const formData = ref<LinkFormData>({
  url: "",
  shortCode: "",
});
const linkCreationStatus = ref({
  success: false,
  message: null as string | null,
  display: false,
});

// Validation rules
const urlRules = [
  (v: string) => !!v || LABELS.URL_REQUIRED,
  (v: string) => {
    try {
      new URL(v);
      return true;
    } catch {
      return LABELS.INVALID_URL;
    }
  },
];

const shortCodeRules = [
  (v: string) =>
    !v || /^[a-zA-Z0-9-_]+$/.test(v) || LABELS.SHORT_CODE_PATTERN_ERROR,
  (v: string) => !v || v.length <= 50 || LABELS.SHORT_CODE_LENGTH_ERROR,
];

// Methods
const handleSubmit = async () => {
  if (!valid.value) return;

  loading.value = true;
  linkCreationStatus.value = {
    success: false,
    message: null,
    display: false,
  };
  try {
    const token = await getAccessTokenSilently();
    const response = await fetch(routes.api.createLink.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        url: formData.value.url,
        ...(formData.value.shortCode && {
          shortCode: formData.value.shortCode,
        }),
      }),
    });

    if (response.ok) {
      console.log(LABELS.LINK_CREATED);
      emit("linkCreated");
      linkCreationStatus.value = {
        success: true,
        message: LABELS.LINK_CREATED,
        display: true,
      };
      handleReset();
    } else {
      const error = await response.json();
      console.error(LABELS.FAILED_CREATE_LINK, error);
      alert(error.message || LABELS.FAILED_CREATE_LINK);
      linkCreationStatus.value = {
        success: false,
        message: error.message || LABELS.FAILED_CREATE_LINK,
        display: true,
      };
    }
  } catch (error) {
    console.error("Error creating link:", error);
    alert(LABELS.ERROR_CREATING_LINK);
  } finally {
    loading.value = false;
  }
};

const handleReset = () => {
  formData.value = {
    url: "",
    shortCode: "",
  };
  formRef.value?.reset();
};

const handleGoBack = () => {
  router.back();
};
</script>
