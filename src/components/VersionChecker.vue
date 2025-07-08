<template>
  <div>
    <!-- Update-Banner, wenn eine neue Version verfügbar ist -->
    <div v-if="updateAvailable && !loading && !error" class="version-update-banner">
      <div class="banner-content">
        <div class="banner-icon">
          <CIcon :icon="cilCloudDownload" size="xl" />
        </div>
        <div class="banner-text">
          <strong>Update verfügbar!</strong> Eine neuere Version ({{ latestGitHubVersion }}) ist verfügbar. 
          Die aktuelle Version ist {{ currentAppVersion }}.
        </div>
        <div class="banner-actions">
          <CButton color="primary" size="sm" href="https://github.com/applejuicenetz/webui/releases/latest" target="_blank">
            Zum Download
          </CButton>
          <CButton color="light" size="sm" @click="dismissBanner" class="ms-2">
            Später
          </CButton>
        </div>
      </div>
    </div>

    <!-- Detaillierte Versionsinfo (optional) -->
    <div v-if="showDetails" class="version-details mt-3">
      <div v-if="loading" class="text-primary">
        <CSpinner size="sm" /> Prüfe auf Updates...
      </div>
      <div v-else-if="error" class="text-danger">
        <small>Fehler beim Prüfen auf Updates: {{ error }}</small>
      </div>
      <div v-else class="d-flex align-items-center">
        <div>
          <small class="text-muted">App-Version: {{ currentAppVersion }}</small>
          <span v-if="updateAvailable" class="ms-2 badge bg-warning">Update verfügbar</span>
          <span v-else class="ms-2 badge bg-success">Aktuell</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { CIcon } from '@coreui/icons-vue';
import { CButton, CSpinner } from '@coreui/vue';
import { cilCloudDownload } from '@coreui/icons';

// Props
const props = defineProps({
  showDetails: {
    type: Boolean,
    default: false
  }
});

// Reaktive Variablen
const currentAppVersion = ref(import.meta.env.VITE_APP_VERSION || 'Unbekannt');
const latestGitHubVersion = ref(null);
const loading = ref(true);
const error = ref(null);
const updateAvailable = ref(false);
const bannerDismissed = ref(localStorage.getItem('updateBannerDismissed') === 'true');

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

// Banner ausblenden und Entscheidung speichern
const dismissBanner = () => {
  bannerDismissed.value = true;
  localStorage.setItem('updateBannerDismissed', 'true');
};

// Hauptfunktion, die den Versionscheck durchführt
const performVersionCheck = async () => {
  try {
    loading.value = true;
    const latestVersion = await fetchLatestVersion();
    latestGitHubVersion.value = latestVersion;

    // Vergleiche Versionen
    if (compareVersions(latestVersion, currentAppVersion.value) > 0) {
      updateAvailable.value = true;
      // Banner-Status zurücksetzen, wenn eine neue Version verfügbar ist
      if (localStorage.getItem('lastCheckedVersion') !== latestVersion) {
        bannerDismissed.value = false;
        localStorage.setItem('updateBannerDismissed', 'false');
      }
    } else {
      updateAvailable.value = false;
    }

    // Speichere die zuletzt geprüfte Version
    localStorage.setItem('lastCheckedVersion', latestVersion);
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

// Beim Mounten der Komponente den Versionscheck durchführen
onMounted(() => {
  performVersionCheck();
});
</script>

<style scoped>
.version-update-banner {
  background-color: #f8f9fa;
  border-left: 4px solid #2eb85c;
  margin-bottom: 1rem;
  border-radius: 0.25rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.banner-content {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
}

.banner-icon {
  color: #2eb85c;
  margin-right: 1rem;
}

.banner-text {
  flex: 1;
}

.banner-actions {
  margin-left: 1rem;
}

@media (max-width: 768px) {
  .banner-content {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .banner-icon {
    margin-bottom: 0.5rem;
  }
  
  .banner-actions {
    margin-left: 0;
    margin-top: 0.75rem;
    align-self: flex-end;
  }
}
</style>