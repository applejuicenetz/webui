<template>
  <div class="about">
    <div class="container-fluid mt-5">
      <div class="row justify-content-center">
        <div class="col-xl-8 col-lg-10 col-md-11">
          <div class="card">
            <div class="card-header bg-primary text-white">
              <h2 class="mb-0">
                <i class="bi bi-info-circle me-2"></i>
                Über appleJuice WebUI
              </h2>
            </div>
            <div class="card-body">
              <div class="text-center mb-4">
                <i class="bi bi-apple" style="font-size: 5rem; color: #667eea; margin-bottom: 1rem;"></i>
                <h3>appleJuice WebUI</h3>
                <p class="text-muted">Version 0.3.0</p>
              </div>
              
              <p>
                Willkommen bei der appleJuice WebUI! Diese moderne Webanwendung wurde entwickelt, um eine 
                benutzerfreundliche Oberfläche für die Verwaltung Ihrer Daten und Systeme zu bieten.
              </p>
              
              <h5>Funktionen:</h5>
              <ul class="list-unstyled">
                <li class="mb-2">
                  <i class="bi bi-check-circle text-success me-2"></i>
                  Benutzerfreundliches Dashboard
                </li>
                <li class="mb-2">
                  <i class="bi bi-check-circle text-success me-2"></i>
                  Sichere Authentifizierung mit Pinia State Management
                </li>
                <li class="mb-2">
                  <i class="bi bi-check-circle text-success me-2"></i>
                  Responsive Design mit Bootstrap 5
                </li>
                <li class="mb-2">
                  <i class="bi bi-check-circle text-success me-2"></i>
                  Elegante Benachrichtigungen mit SweetAlert2
                </li>
                <li class="mb-2">
                  <i class="bi bi-check-circle text-success me-2"></i>
                  Vue 3 mit TypeScript für moderne Entwicklung
                </li>
              </ul>
              
              <hr>
              
              <h5>Technologie-Stack:</h5>
              <div class="row">
                <div class="col-md-6">
                  <ul class="list-unstyled">
                    <li><strong>Frontend:</strong> Vue 3 + TypeScript</li>
                    <li><strong>Styling:</strong> Bootstrap 5</li>
                    <li><strong>State Management:</strong> Pinia</li>
                  </ul>
                </div>
                <div class="col-md-6">
                  <ul class="list-unstyled">
                    <li><strong>Build Tool:</strong> Vite</li>
                    <li><strong>Routing:</strong> Vue Router</li>
                    <li><strong>Benachrichtigungen:</strong> SweetAlert2</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.about {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem 0;
}

.card {
  border: none;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border-radius: 15px;
}

.card-header {
  border-radius: 15px 15px 0 0 !important;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
}

.text-primary {
  color: #667eea !important;
}
</style>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
