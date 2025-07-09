<template>
  <CModal
    :visible="visible"
    @close="closeModal"
    title="Update verfügbar"
    size="lg"
    backdrop="static"
  >
    <CModalHeader>
      <CModalTitle>
        <div class="d-flex align-items-center">
          <CIcon :icon="cilCloudDownload" size="xl" class="me-2 text-primary" />
          Update verfügbar
        </div>
      </CModalTitle>
    </CModalHeader>
    <CModalBody>
      <div class="update-modal-content">
        <div class="version-info mb-4">
          <div class="current-version mb-2">
            <span class="text-muted">Aktuelle Version:</span>
            <span class="ms-2 fw-bold">{{ currentAppVersion }}</span>
          </div>
          <div class="new-version">
            <span class="text-muted">Neue Version:</span>
            <span class="ms-2 fw-bold text-success">{{ latestGitHubVersion }}</span>
          </div>
        </div>

        <div class="update-message mb-4">
          <p>
            Eine neue Version des AppleJuice WebUI ist verfügbar. Es wird empfohlen, auf die neueste Version zu aktualisieren,
            um von den neuesten Funktionen und Fehlerbehebungen zu profitieren.
          </p>
        </div>

        <div v-if="updateInProgress" class="update-progress mb-4">
          <div class="progress-container">
            <CSpinner color="primary" class="me-2" />
            <span>Update wird durchgeführt...</span>
          </div>
          <div class="status-message mt-2">
            {{ updateStatus }}
          </div>
        </div>

        <div v-else-if="updateError" class="update-error mb-4 alert alert-danger">
          <h5>Fehler beim Update</h5>
          <p>{{ updateError }}</p>
          <p class="mt-2">Bitte versuchen Sie es später erneut oder führen Sie das Update manuell durch.</p>
        </div>

        <div v-else-if="updateSuccess" class="update-success mb-4 alert alert-success">
          <h5>Update erfolgreich!</h5>
          <p>{{ updateStatus }}</p>
          <p class="mt-2">Der Server wird in Kürze neu gestartet. Die Seite wird automatisch neu geladen.</p>
        </div>

        <div v-else class="update-options mb-4">
          <h5>Update-Optionen</h5>
          <div class="d-flex flex-column">
            <div class="update-option mb-3">
              <h6>Option 1: Automatisches Update</h6>
              <p>
                Klicken Sie auf "Update starten", um das Update automatisch durchzuführen.
                Der Server wird nach dem Update automatisch neu gestartet.
              </p>
              <CButton color="success" @click="startUpdate" :disabled="updateInProgress">
                <CIcon :icon="cilCloudDownload" class="me-2" />
                Update starten
              </CButton>
            </div>

            <div class="update-option">
              <h6>Option 2: Manuelles Update</h6>
              <p>
                Wenn Sie das Update manuell durchführen möchten, folgen Sie diesen Schritten:
              </p>
              <ol>
                <li>Besuchen Sie die <a href="https://github.com/applejuicenetz/webui/releases/latest" target="_blank">GitHub Release-Seite</a></li>
                <li>Laden Sie die neueste Version herunter</li>
                <li>Ersetzen Sie Ihre aktuelle Installation mit der neuen Version</li>
              </ol>
              <CButton color="primary" href="https://github.com/applejuicenetz/webui/releases/latest" target="_blank">
                Zum Download
              </CButton>
            </div>
          </div>
        </div>
      </div>
    </CModalBody>
    <CModalFooter>
      <CButton color="secondary" @click="closeModal" :disabled="updateInProgress">
        {{ updateSuccess ? 'Schließen' : 'Später erinnern' }}
      </CButton>
    </CModalFooter>
  </CModal>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue';
import { CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CButton, CSpinner } from '@coreui/vue';
import { CIcon } from '@coreui/icons-vue';
import { cilCloudDownload } from '@coreui/icons';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  currentAppVersion: {
    type: String,
    required: true
  },
  latestGitHubVersion: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['close']);

// Update-Status
const updateInProgress = ref(false);
const updateSuccess = ref(false);
const updateError = ref(null);
const updateStatus = ref('');

// Update-Prozess starten
const startUpdate = async () => {
  updateInProgress.value = true;
  updateStatus.value = 'Update wird initialisiert...';
  updateError.value = null;

  try {
    // API-Aufruf zum Server-Endpunkt
    const response = await fetch('/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: props.latestGitHubVersion
      })
    });

    let data;

    try {
      // Versuchen, die Antwort als JSON zu parsen
      data = await response.json();
    } catch (jsonError) {
      console.error('JSON parsing error:', jsonError);
      // Wenn die Antwort kein gültiges JSON ist, verwenden wir den Statustext
      if (!response.ok) {
        throw new Error(`Server-Fehler: ${response.status} ${response.statusText}`);
      } else {
        // Wenn der Status OK ist, aber kein gültiges JSON zurückgegeben wurde
        data = { message: 'Update wurde gestartet, aber die Antwort konnte nicht verarbeitet werden.' };
      }
    }

    if (!response.ok) {
      throw new Error(data?.message || `Server-Fehler: ${response.status}`);
    }

    // Update erfolgreich gestartet
    updateStatus.value = data?.message || 'Update erfolgreich gestartet. Server wird in Kürze neu gestartet.';
    updateSuccess.value = true;

    // Nach erfolgreicher Initialisierung des Updates, Seite nach einer Verzögerung neu laden
    setTimeout(() => {
      window.location.reload();
    }, 10000);

  } catch (error) {
    console.error('Update error:', error);
    updateError.value = error.message || 'Fehler beim Durchführen des Updates';
    updateInProgress.value = false;
  }
};

const closeModal = () => {
  // Wenn ein Update läuft, Modal nicht schließen
  if (updateInProgress.value && !updateSuccess.value) {
    return;
  }

  // Speichern, dass der Benutzer das Modal geschlossen hat
  localStorage.setItem('updateModalDismissed', 'true');
  localStorage.setItem('updateModalDismissedVersion', props.latestGitHubVersion);

  emit('close');
};
</script>

<style scoped>
.update-modal-content {
  font-size: 1rem;
}

.version-info {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 0.25rem;
}

.update-instructions, .update-option {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 0.25rem;
}

.update-instructions h5, .update-option h5, .update-option h6 {
  margin-bottom: 0.75rem;
}

.update-instructions ol, .update-option ol {
  padding-left: 1.5rem;
}

.update-instructions li, .update-option li {
  margin-bottom: 0.5rem;
}

.update-instructions a, .update-option a {
  color: #321fdb;
  text-decoration: none;
}

.update-instructions a:hover, .update-option a:hover {
  text-decoration: underline;
}

.update-progress {
  background-color: #e6f2ff;
  padding: 1rem;
  border-radius: 0.25rem;
  border-left: 4px solid #321fdb;
}

.progress-container {
  display: flex;
  align-items: center;
}

.status-message {
  font-size: 0.9rem;
  color: #666;
}

.update-option {
  margin-bottom: 1rem;
  border-left: 4px solid #2eb85c;
}

.update-option:last-child {
  border-left-color: #321fdb;
}
</style>
