// VersionChecker.vue
<template>
  <div class="version-checker-container">
    <h2 class="text-2xl font-bold mb-4 text-gray-800">Versionsprüfung</h2>

    <div v-if="loading" class="text-blue-600 text-lg">Lade neueste Version von GitHub...</div>
    <div v-else-if="error" class="error-message">
      <strong class="font-bold">Fehler:</strong> {{ error }}
    </div>
    <div v-else>
      <p class="text-gray-700 text-lg mb-2">
        <span class="font-semibold">Aktuelle App-Version:</span> {{ currentAppVersion }}
      </p>
      <p class="text-gray-700 text-lg mb-4">
        <span class="font-semibold">Neueste GitHub-Version:</span> {{ latestGitHubVersion }}
      </p>

      <div v-if="updateAvailable" class="update-available-message">
        <strong class="font-bold">Update verfügbar!</strong> Eine neuere Version ({{ latestGitHubVersion }}) ist verfügbar.
      </div>
      <div v-else class="up-to-date-message">
        <strong class="font-bold">Aktuell!</strong> Ihre Anwendung ist auf dem neuesten Stand.
      </div>

      <p class="text-sm text-gray-500 mt-6">
        Hinweis: Die "Aktuelle App-Version" wird aus der `package.json` während des Build-Prozesses injiziert.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// Aktuelle App-Version aus der Umgebungsvariable (injiziert von Vite/Webpack)
// Wichtig: 'import.meta.env.VITE_APP_VERSION' für Vite
// 'process.env.VUE_APP_VERSION' für Vue CLI/Webpack
const currentAppVersion = ref(import.meta.env.VITE_APP_VERSION || 'Unbekannt');

const latestGitHubVersion = ref(null);
const loading = ref(true);
const error = ref(null);
const updateAvailable = ref(false);

// Funktion zum Abrufen der neuesten Version von GitHub
const fetchLatestVersion = async () => {
  try {
    const response = await fetch('https://api.github.com/repos/applejuicenetz/webui/releases/latest');

    if (!response.ok) {
      throw new Error(`HTTP-Fehler! Status: ${response.status}`);
    }

    const data = await response.json();
    return data.tag_name; // Die Tag-Bezeichnung enthält die Versionsnummer
  } catch (err) {
    console.error('Fehler beim Abrufen der GitHub-Version:', err);
    throw err;
  }
};

// Funktion zum Vergleichen von Versionsnummern (semantisch)
const compareVersions = (v1, v2) => {
  // Entferne optionales 'v' Präfix
  const cleanV1 = v1.startsWith('v') ? v1.substring(1) : v1;
  const cleanV2 = v2.startsWith('v') ? v2.substring(1) : v2;

  const parts1 = cleanV1.split('.').map(Number);
  const parts2 = cleanV2.split('.').map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;

    if (p1 > p2) return 1; // v1 ist neuer
    if (p1 < p2) return -1; // v2 ist neuer
  }
  return 0; // Versionen sind gleich
};

// Hauptfunktion, die den Versionscheck durchführt
const performVersionCheck = async () => {
  try {
    loading.value = true;
    const latestVersion = await fetchLatestVersion();
    latestGitHubVersion.value = latestVersion;

    if (compareVersions(latestVersion, currentAppVersion.value) > 0) {
      updateAvailable.value = true;
    } else {
      updateAvailable.value = false;
    }
  } catch (err) {
    error.value = `Konnte die neueste GitHub-Version nicht abrufen: ${err.message}`;
  } finally {
    loading.value = false;
  }
};

// mounted Hook in Composition API
onMounted(() => {
  performVersionCheck();
});
</script>