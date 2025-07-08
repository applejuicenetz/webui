<template>
  <tr class="align-middle" :id="'zeile_' + download.id" @click="toggleSelection">
    <td>
      <input
        class="form-check-input"
        type="checkbox"
        :id="'dlcheck_' + download.id"
        :checked="isSelected"
        @click.stop="toggleSelection"
      >
    </td>
    <td>
      <div class="text-nowrap" :id="'nametd_' + download.id">
        <a @click.stop="renameDownload" title="Umbenennen">
          {{ truncatedFileName }}
        </a>
      </div>
      <div class="small text-body-secondary text-nowrap">
        <span>
          <a @click.stop="showUserInfo" title="Mehr Info">
            {{ download.sources }}/{{ download.maxSources || download.sources }}
          </a>
        </span> | {{ download.size }}
      </div>
    </td>
    <td class="text-center">
      <CBadge :color="getStatusColor(download.status)">
        {{ getStatusText(download.status) }}
      </CBadge>
    </td>
    <td>
      <div class="d-flex justify-content-between align-items-baseline">
        <div class="fw-semibold">{{ download.progress }}%</div>
        <div class="text-nowrap small text-body-secondary ms-3">
          {{ formatBytes(download.rawSize - download.loaded) }}
        </div>
      </div>
      <div class="progress progress-thin">
        <div
          class="progress-bar"
          :class="'bg-' + getProgressColor(download.status)"
          role="progressbar"
          :style="{ width: download.progress + '%' }"
          :aria-valuenow="download.progress"
          aria-valuemin="0"
          aria-valuemax="100"
        ></div>
      </div>
    </td>
    <td class="text-center">
      {{ download.pdl || 1 }}
    </td>
    <td>
      {{ download.speed }}
    </td>
    <td>
      <div class="dropdown">
        <button
          class="btn btn-transparent p-0"
          type="button"
          data-coreui-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
          @click.stop
        >
          <CIcon :icon="cilOptions" />
        </button>
        <div class="dropdown-menu dropdown-menu-end">
          <a class="dropdown-item" href="#" @click.stop="showInfo">Info</a>
          <a class="dropdown-item" href="#" @click.stop="renameDownload">Umbenennen</a>
          <a
            class="dropdown-item"
            href="#"
            @click.stop="pauseResume"
          >
            {{ download.status === 'downloading' ? 'Pausieren' : 'Fortsetzen' }}
          </a>
          <a class="dropdown-item text-danger" href="#" @click.stop="cancelDownload">Löschen</a>
        </div>
      </div>
    </td>
  </tr>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits } from 'vue'
import { CBadge } from '@coreui/vue'
import { CIcon } from '@coreui/icons-vue'
import { cilOptions } from '@coreui/icons'

const props = defineProps({
  download: {
    type: Object,
    required: true
  },
  selected: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'select',
  'rename',
  'pause-resume',
  'cancel',
  'show-info',
  'show-user-info'
])

const isSelected = ref(props.selected)

// Computed property für gekürzten Dateinamen (wie im HTML-Beispiel)
const truncatedFileName = computed(() => {
  const maxLength = 40
  if (props.download.fileName.length > maxLength) {
    return props.download.fileName.substring(0, maxLength) + ' '
  }
  return props.download.fileName
})

// Status-Farbe basierend auf Download-Status
const getStatusColor = (status) => {
  switch (status) {
    case 'completed': return 'success'
    case 'downloading': return 'primary'
    case 'paused': return 'warning'
    case 'failed': return 'danger'
    case 'waiting': return 'info'
    default: return 'secondary'
  }
}

// Fortschrittsbalken-Farbe basierend auf Download-Status
const getProgressColor = (status) => {
  switch (status) {
    case 'completed': return 'success'
    case 'downloading': return 'success'
    case 'paused': return 'warning'
    case 'failed': return 'danger'
    case 'waiting': return 'secondary'
    default: return 'info'
  }
}

// Status-Text auf Deutsch
const getStatusText = (status) => {
  switch (status) {
    case 'completed': return 'abgeschlossen'
    case 'downloading': return 'lädt'
    case 'paused': return 'pausiert'
    case 'failed': return 'fehlgeschlagen'
    case 'waiting': return 'wartend'
    default: return status
  }
}

// Hilfsfunktion: Bytes in lesbare Größe umwandeln
const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 B'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

// Event-Handler
const toggleSelection = () => {
  isSelected.value = !isSelected.value
  emit('select', props.download.id, isSelected.value)
}

const renameDownload = () => {
  emit('rename', props.download.id)
}

const pauseResume = () => {
  emit('pause-resume', props.download)
}

const cancelDownload = () => {
  emit('cancel', props.download)
}

const showInfo = () => {
  emit('show-info', props.download)
}

const showUserInfo = () => {
  emit('show-user-info', props.download)
}
</script>

<style scoped>
tr {
  cursor: pointer;
}

.progress-thin {
  height: 4px;
}
</style><template>
  <tr class="align-middle" :id="'zeile_' + download.id" @click="toggleSelection">
    <td>
      <input
        class="form-check-input"
        type="checkbox"
        :id="'dlcheck_' + download.id"
        :checked="isSelected"
        @click.stop="toggleSelection"
      >
    </td>
    <td>
      <div class="text-nowrap" :id="'nametd_' + download.id">
        <a @click.stop="renameDownload" title="Umbenennen">
          {{ truncatedFileName }}
        </a>
      </div>
      <div class="small text-body-secondary text-nowrap">
        <span>
          <a @click.stop="showUserInfo" title="Mehr Info">
            {{ download.sources }}/{{ download.maxSources || download.sources }}
          </a>
        </span> | {{ download.size }}
      </div>
    </td>
    <td class="text-center">
      <CBadge :color="getStatusColor(download.status)">
        {{ getStatusText(download.status) }}
      </CBadge>
    </td>
    <td>
      <div class="d-flex justify-content-between align-items-baseline">
        <div class="fw-semibold">{{ download.progress }}%</div>
        <div class="text-nowrap small text-body-secondary ms-3">
          {{ formatBytes(download.rawSize - download.loaded) }}
        </div>
      </div>
      <div class="progress progress-thin">
        <div
          class="progress-bar"
          :class="'bg-' + getProgressColor(download.status)"
          role="progressbar"
          :style="{ width: download.progress + '%' }"
          :aria-valuenow="download.progress"
          aria-valuemin="0"
          aria-valuemax="100"
        ></div>
      </div>
    </td>
    <td class="text-center">
      {{ download.pdl || 1 }}
    </td>
    <td>
      {{ download.speed }}
    </td>
    <td>
      <div class="dropdown">
        <button
          class="btn btn-transparent p-0"
          type="button"
          data-coreui-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
          @click.stop
        >
          <CIcon :icon="cilOptions" />
        </button>
        <div class="dropdown-menu dropdown-menu-end">
          <a class="dropdown-item" href="#" @click.stop="showInfo">Info</a>
          <a class="dropdown-item" href="#" @click.stop="renameDownload">Umbenennen</a>
          <a
            class="dropdown-item"
            href="#"
            @click.stop="pauseResume"
          >
            {{ download.status === 'downloading' ? 'Pausieren' : 'Fortsetzen' }}
          </a>
          <a class="dropdown-item text-danger" href="#" @click.stop="cancelDownload">Löschen</a>
        </div>
      </div>
    </td>
  </tr>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits } from 'vue'
import { CBadge } from '@coreui/vue'
import { CIcon } from '@coreui/icons-vue'
import { cilOptions } from '@coreui/icons'

const props = defineProps({
  download: {
    type: Object,
    required: true
  },
  selected: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'select',
  'rename',
  'pause-resume',
  'cancel',
  'show-info',
  'show-user-info'
])

const isSelected = ref(props.selected)

// Computed property für gekürzten Dateinamen (wie im HTML-Beispiel)
const truncatedFileName = computed(() => {
  const maxLength = 40
  if (props.download.fileName.length > maxLength) {
    return props.download.fileName.substring(0, maxLength) + ' '
  }
  return props.download.fileName
})

// Status-Farbe basierend auf Download-Status
const getStatusColor = (status) => {
  switch (status) {
    case 'completed': return 'success'
    case 'downloading': return 'primary'
    case 'paused': return 'warning'
    case 'failed': return 'danger'
    case 'waiting': return 'info'
    default: return 'secondary'
  }
}

// Fortschrittsbalken-Farbe basierend auf Download-Status
const getProgressColor = (status) => {
  switch (status) {
    case 'completed': return 'success'
    case 'downloading': return 'success'
    case 'paused': return 'warning'
    case 'failed': return 'danger'
    case 'waiting': return 'secondary'
    default: return 'info'
  }
}

// Status-Text auf Deutsch
const getStatusText = (status) => {
  switch (status) {
    case 'completed': return 'abgeschlossen'
    case 'downloading': return 'lädt'
    case 'paused': return 'pausiert'
    case 'failed': return 'fehlgeschlagen'
    case 'waiting': return 'wartend'
    default: return status
  }
}

// Hilfsfunktion: Bytes in lesbare Größe umwandeln
const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 B'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

// Event-Handler
const toggleSelection = () => {
  isSelected.value = !isSelected.value
  emit('select', props.download.id, isSelected.value)
}

const renameDownload = () => {
  emit('rename', props.download.id)
}

const pauseResume = () => {
  emit('pause-resume', props.download)
}

const cancelDownload = () => {
  emit('cancel', props.download)
}

const showInfo = () => {
  emit('show-info', props.download)
}

const showUserInfo = () => {
  emit('show-user-info', props.download)
}
</script>

<style scoped>
tr {
  cursor: pointer;
}

.progress-thin {
  height: 4px;
}
</style>
