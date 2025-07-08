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

        <div class="update-instructions">
          <h5>Wie aktualisiere ich?</h5>
          <ol>
            <li>Besuchen Sie die <a href="https://github.com/applejuicenetz/webui/releases/latest" target="_blank">GitHub Release-Seite</a></li>
            <li>Laden Sie die neueste Version herunter</li>
            <li>Ersetzen Sie Ihre aktuelle Installation mit der neuen Version</li>
          </ol>
        </div>
      </div>
    </CModalBody>
    <CModalFooter>
      <CButton color="secondary" @click="closeModal">
        Später erinnern
      </CButton>
      <CButton color="primary" href="https://github.com/applejuicenetz/webui/releases/latest" target="_blank">
        Zum Download
      </CButton>
    </CModalFooter>
  </CModal>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue';
import { CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CButton } from '@coreui/vue';
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

const closeModal = () => {
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

.update-instructions {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 0.25rem;
}

.update-instructions h5 {
  margin-bottom: 0.75rem;
}

.update-instructions ol {
  padding-left: 1.5rem;
}

.update-instructions li {
  margin-bottom: 0.5rem;
}

.update-instructions a {
  color: #321fdb;
  text-decoration: none;
}

.update-instructions a:hover {
  text-decoration: underline;
}
</style>