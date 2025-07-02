<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import avatar from '@/assets/images/avatars/8.jpg'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = () => {
  authStore.logout()
  router.push('/')
}
</script>

<template>
  <CDropdown placement="bottom-end" variant="nav-item">
    <CDropdownToggle class="py-0 pe-0" :caret="false">
      <CAvatar :src="avatar" size="md" />
    </CDropdownToggle>
    <CDropdownMenu class="pt-0">
      <CDropdownHeader
        component="h6"
        class="bg-body-secondary text-body-secondary fw-semibold mb-2 rounded-top"
      >
        AppleJuice Core
      </CDropdownHeader>
      
      <!-- Verbindungsinfo -->
      <CDropdownItem class="text-wrap" style="max-width: 280px;">
        <CIcon icon="cil-globe-alt" />
        <div class="ms-2">
          <small class="text-muted d-block">Verbunden mit:</small>
          <small class="fw-semibold">{{ authStore.getConnectionUrl }}</small>
        </div>
      </CDropdownItem>
      
      <CDropdownDivider />
      
      <!-- Navigation -->
      <CDropdownItem @click="router.push('/app/dashboard')">
        <CIcon icon="cil-speedometer" /> Dashboard
      </CDropdownItem>
      <CDropdownItem @click="router.push('/app/downloads')">
        <CIcon icon="cil-cloud-download" /> Downloads
      </CDropdownItem>
      <CDropdownItem @click="router.push('/app/uploads')">
        <CIcon icon="cil-cloud-upload" /> Uploads
      </CDropdownItem>
      <CDropdownItem @click="router.push('/app/server')">
        <CIcon icon="cil-settings" /> Server
      </CDropdownItem>
      
      <CDropdownDivider />
      
      <!-- Verbindung testen -->
      <CDropdownItem 
        @click="authStore.testStoredConnection()"
        :disabled="authStore.isLoading"
      >
        <CIcon icon="cil-sync" />
        <span v-if="authStore.isLoading">Teste Verbindung...</span>
        <span v-else>Verbindung testen</span>
      </CDropdownItem>
      
      <!-- Logout -->
      <CDropdownItem @click="handleLogout" class="text-danger">
        <CIcon icon="cil-account-logout" /> Verbindung trennen
      </CDropdownItem>
    </CDropdownMenu>
  </CDropdown>
</template>
