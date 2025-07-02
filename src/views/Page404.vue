<template>
  <div class="error-page">
    <CContainer fluid>
      <CRow class="justify-content-center">
        <CCol :md="6" class="text-center">
          <div class="error-content">
            <div class="error-number">404</div>
            <div class="error-message">Page Not Found</div>
            <div class="error-description">
              <p>Sorry, the page you are looking for could not be found.</p>
              <p class="text-muted">
                The page may have been moved, deleted, or you may have entered the wrong URL.
              </p>
            </div>
            
            <div class="error-actions mt-4">
              <CButton 
                color="primary" 
                size="lg"
                @click="goHome"
                class="me-3"
              >
                <CIcon icon="cil-home" class="me-2" />
                Go Home
              </CButton>
              <CButton 
                color="secondary" 
                size="lg"
                @click="goBack"
              >
                <CIcon icon="cil-arrow-left" class="me-2" />
                Go Back
              </CButton>
            </div>

            <div class="error-suggestions mt-5">
              <h5>What can you do?</h5>
              <CListGroup flush>
                <CListGroupItem class="border-0 ps-0">
                  <CIcon icon="cil-check" class="text-success me-2" />
                  Check the URL for typing errors
                </CListGroupItem>
                <CListGroupItem class="border-0 ps-0">
                  <CIcon icon="cil-check" class="text-success me-2" />
                  Use the navigation menu to find what you're looking for
                </CListGroupItem>
                <CListGroupItem class="border-0 ps-0">
                  <CIcon icon="cil-check" class="text-success me-2" />
                  Contact support if you believe this is an error
                </CListGroupItem>
              </CListGroup>
            </div>

            <div class="search-section mt-4">
              <h6>Or search for what you need:</h6>
              <CInputGroup class="mt-2">
                <CFormInput 
                  v-model="searchQuery"
                  placeholder="Search..."
                  @keyup.enter="performSearch"
                />
                <CButton 
                  color="primary"
                  @click="performSearch"
                >
                  <CIcon icon="cil-magnifying-glass" />
                </CButton>
              </CInputGroup>
            </div>
          </div>
        </CCol>
      </CRow>
    </CContainer>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'Page404',
  setup() {
    const router = useRouter()
    const searchQuery = ref('')

    const goHome = () => {
      router.push('/app/dashboard')
    }

    const goBack = () => {
      router.back()
    }

    const performSearch = () => {
      if (searchQuery.value.trim()) {
        // Implement search logic or redirect to search page
        console.log('Searching for:', searchQuery.value)
        // For now, just redirect to dashboard
        router.push('/app/dashboard')
      }
    }

    return {
      searchQuery,
      goHome,
      goBack,
      performSearch
    }
  }
}
</script>

<style scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.error-content {
  padding: 2rem;
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.error-number {
  font-size: 8rem;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  margin-bottom: 1rem;
}

.error-message {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.error-description {
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
}

.error-suggestions {
  text-align: left;
  max-width: 400px;
  margin: 0 auto;
}

.search-section {
  max-width: 400px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .error-number {
    font-size: 5rem;
  }
  
  .error-message {
    font-size: 1.5rem;
  }
  
  .error-content {
    padding: 1.5rem;
  }
}
</style>