<template>
  <footer class="bg-light py-3 mt-auto">
    <div class="container-fluid">
      <div class="row">
        <div class="col-md-6">
          <span class="text-muted">© 2024 appleJuice WebUI. Alle Rechte vorbehalten.</span>
        </div>
        <div class="col-md-6 text-md-end">
          <span class="text-muted">
            Version 1.0.0 | 
            <a href="https://github.com/applejuicenetz/webui" target="_blank" class="text-decoration-none"><i class="bi bi-github"></i> Dokumentation</a> | 
            <a href="#" class="text-decoration-none"><i class="bi bi-discord"></i> Support</a>
          </span>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
// Footer component - no logic needed for now
</script>

<style scoped>
footer {
  border-top: 1px solid #dee2e6;
  background-color: #f8f9fa !important;
}

footer a {
  color: #6c757d;
  transition: color 0.3s ease;
}

footer a:hover {
  color: #007bff;
}

@media (max-width: 768px) {
  .col-md-6 {
    text-align: center !important;
    margin-bottom: 0.5rem;
  }
  
  .col-md-6:last-child {
    margin-bottom: 0;
  }
}
</style>