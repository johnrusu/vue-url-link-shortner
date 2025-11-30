<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuth0 } from "@auth0/auth0-vue";

// constants
import { routes, LABELS } from "@/constants";

// state
import { useLinksStore } from "@/store/links";

// loading animation
import loadingAnimation from "@/assets/animations/loading.json";

// components
import AnimationGenerator from "@/components/AnimationGenerator.vue";

// utils
import { isArrayNotEmpty } from "@/utils";

// Types
interface TLink {
  _id: string;
  url: string;
  shortCode: string;
  createdAt: string;
  clicks: number;
  userId?: string;
}

const route = useRoute();
const router = useRouter();
const { getAccessTokenSilently } = useAuth0();

const link = ref<TLink | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

// state
const linksStore = useLinksStore();

const linkId = computed(() => route.params.linkId as string);
const shortUrl = computed(() =>
  link.value
    ? `${window.location.origin}${import.meta.env.BASE_URL}${link.value.shortCode}`
    : ""
);

const getLinkDetails = async () => {
  loading.value = true;
  error.value = null;

  const linksFromStore = linksStore.links;
  if (isArrayNotEmpty(linksFromStore)) {
    const existingLink = linksFromStore.find((l) => l.id === linkId.value);
    if (existingLink) {
      link.value = existingLink as TLink;
      loading.value = false;
      error.value = null;
      return;
    }
  }

  try {
    const token = await getAccessTokenSilently();
    const response = await fetch(routes.api.getLinkById.url(linkId.value), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      link.value = await response.json();
    } else {
      error.value = LABELS.FAILED_LOAD_LINK;
      console.error("Failed to fetch link details");
    }
  } catch (err) {
    error.value = LABELS.ERROR_LOADING_LINK;
    console.error("Error fetching link details:", err);
  } finally {
    loading.value = false;
  }
};

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(shortUrl.value);
  } catch (err) {
    console.error("Failed to copy:", err);
    alert(LABELS.FAILED_COPY_URL);
  }
};

const openNewWindow = (url: string) => {
  window.open(url, "_blank");
};

const goBack = () => {
  router.push({ path: "/" });
};

const deleteLink = async () => {
  if (!confirm(LABELS.CONFIRM_DELETE_LINK)) return;

  try {
    const token = await getAccessTokenSilently();
    const response = await fetch(routes.api.deleteLink.url(linkId.value), {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      alert(LABELS.LINK_DELETED);
      goBack();
    } else {
      alert(LABELS.FAILED_DELETE_LINK);
    }
  } catch (err) {
    console.error("Error deleting link:", err);
    alert(LABELS.ERROR_DELETING_LINK);
  }
};

onMounted(() => {
  getLinkDetails();
});
</script>

<template>
  <v-container class="link-analytics-container h-full">
    <div
      class="w-[200px] flex items-center justify-center mx-auto h-full"
      v-if="loading"
    >
      <AnimationGenerator :jsonData="loadingAnimation" />
    </div>

    <div class="max-w-6xl mx-auto" v-else>
      <h1 class="text-4xl font-bold text-center mb-8">
        {{ LABELS.LINK_ANALYTICS }}
      </h1>

      <div class="link-analytics pa-6">
        <v-btn
          variant="text"
          prepend-icon="mdi-arrow-left"
          @click="goBack"
          class="mb-4"
        >
          {{ LABELS.BACK_TO_DASHBOARD }}
        </v-btn>

        <v-alert v-if="error" type="error" class="mb-4">
          {{ error }}
        </v-alert>

        <div v-else-if="link">
          <v-row>
            <v-col cols="12">
              <v-card class="mb-4">
                <v-card-title class="d-flex justify-space-between align-center">
                  <span>{{ LABELS.LINK_DETAILS }}</span>
                  <v-btn
                    color="error"
                    variant="outlined"
                    size="small"
                    prepend-icon="mdi-delete"
                    @click="deleteLink"
                  >
                    {{ LABELS.DELETE }}
                  </v-btn>
                </v-card-title>
                <v-card-text>
                  <v-list lines="two">
                    <v-list-item>
                      <v-list-item-title class="font-weight-bold">
                        {{ LABELS.ORIGINAL_URL }}
                      </v-list-item-title>
                      <v-list-item-subtitle class="text-wrap">
                        <a
                          :href="link.url"
                          target="_blank"
                          class="text-primary"
                        >
                          {{ link.url }}
                        </a>
                      </v-list-item-subtitle>
                    </v-list-item>

                    <v-list-item>
                      <v-list-item-title class="font-weight-bold">
                        {{ LABELS.SHORT_URL }}
                      </v-list-item-title>
                      <v-list-item-subtitle class="d-flex align-center gap-2">
                        <a
                          :href="shortUrl"
                          target="_blank"
                          class="text-primary"
                        >
                          {{ shortUrl }}
                        </a>
                        <div>
                          <v-btn
                            icon="mdi-content-copy"
                            size="x-small"
                            variant="text"
                            @click="copyToClipboard"
                          ></v-btn>
                          <v-btn
                            icon="mdi-open-in-new"
                            size="x-small"
                            variant="text"
                            @click="openNewWindow(shortUrl)"
                          ></v-btn>
                        </div>
                      </v-list-item-subtitle>
                    </v-list-item>

                    <v-list-item>
                      <v-list-item-title class="font-weight-bold">
                        {{ LABELS.SHORT_CODE_LABEL }}
                      </v-list-item-title>
                      <v-list-item-subtitle>
                        {{ link.shortCode }}
                      </v-list-item-subtitle>
                    </v-list-item>

                    <v-list-item>
                      <v-list-item-title class="font-weight-bold">
                        {{ LABELS.CREATED_AT }}
                      </v-list-item-title>
                      <v-list-item-subtitle>
                        {{ new Date(link.createdAt).toLocaleString() }}
                      </v-list-item-subtitle>
                    </v-list-item>

                    <v-list-item>
                      <v-list-item-title class="font-weight-bold">
                        {{ LABELS.TOTAL_CLICKS }}
                      </v-list-item-title>
                      <v-list-item-subtitle>
                        <span class="text-h5 text-primary">{{
                          link.clicks
                        }}</span>
                      </v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="6">
              <v-card>
                <v-card-title>{{ LABELS.CLICK_STATISTICS }}</v-card-title>
                <v-card-text>
                  <div
                    style="height: 300px"
                    class="d-flex align-center justify-center"
                  >
                    <div class="text-center">
                      <div class="text-h1 text-primary mb-2">
                        {{ link.clicks }}
                      </div>
                      <div class="text-h6 text-grey">
                        {{ LABELS.TOTAL_CLICKS }}
                      </div>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="6">
              <v-card>
                <v-card-title>{{ LABELS.QUICK_STATS }}</v-card-title>
                <v-card-text>
                  <v-list>
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon color="primary">mdi-chart-line</v-icon>
                      </template>
                      <v-list-item-title>{{
                        LABELS.CLICK_THROUGH_RATE
                      }}</v-list-item-title>
                      <v-list-item-subtitle>
                        {{ LABELS.CLICKS_RECORDED(link.clicks) }}
                      </v-list-item-subtitle>
                    </v-list-item>

                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon color="success">mdi-calendar-check</v-icon>
                      </template>
                      <v-list-item-title>{{
                        LABELS.DAYS_ACTIVE
                      }}</v-list-item-title>
                      <v-list-item-subtitle>
                        {{
                          LABELS.DAYS_COUNT(
                            Math.floor(
                              (Date.now() -
                                new Date(link.createdAt).getTime()) /
                                (1000 * 60 * 60 * 24)
                            )
                          )
                        }}
                      </v-list-item-subtitle>
                    </v-list-item>

                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon color="info">mdi-link-variant</v-icon>
                      </template>
                      <v-list-item-title>{{
                        LABELS.LINK_STATUS
                      }}</v-list-item-title>
                      <v-list-item-subtitle>
                        <v-chip color="success" size="small">{{
                          LABELS.ACTIVE
                        }}</v-chip>
                      </v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </div>
    </div>
  </v-container>
</template>
