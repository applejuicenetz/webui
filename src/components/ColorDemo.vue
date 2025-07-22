<template>
  <div class="color-demo">
    <div class="row">
      <div class="col-12">
        <h3 class="mb-4">CoreUI Farbschema Demo</h3>
      </div>
    </div>

    <!-- Button Demo -->
    <div class="row mb-4">
      <div class="col-12">
        <h5 class="mb-3">Buttons</h5>
        <div class="d-flex flex-wrap gap-2 mb-3">
          <button class="btn btn-primary">Primary</button>
          <button class="btn btn-success">Success</button>
          <button class="btn btn-warning">Warning</button>
          <button class="btn btn-danger">Danger</button>
          <button class="btn btn-info">Info</button>
        </div>
        <div class="d-flex flex-wrap gap-2">
          <button class="btn btn-outline-primary">Primary Outline</button>
          <button class="btn btn-outline-success">Success Outline</button>
          <button class="btn btn-outline-warning">Warning Outline</button>
          <button class="btn btn-outline-danger">Danger Outline</button>
          <button class="btn btn-outline-info">Info Outline</button>
        </div>
      </div>
    </div>

    <!-- Alert Demo -->
    <div class="row mb-4">
      <div class="col-12">
        <h5 class="mb-3">Alerts</h5>
        <div class="alert alert-primary" role="alert">
          <i class="bi bi-info-circle me-2"></i>
          Dies ist eine Primary Alert mit CoreUI Farben.
        </div>
        <div class="alert alert-success" role="alert">
          <i class="bi bi-check-circle me-2"></i>
          Dies ist eine Success Alert mit CoreUI Farben.
        </div>
        <div class="alert alert-warning" role="alert">
          <i class="bi bi-exclamation-triangle me-2"></i>
          Dies ist eine Warning Alert mit CoreUI Farben.
        </div>
        <div class="alert alert-danger" role="alert">
          <i class="bi bi-x-circle me-2"></i>
          Dies ist eine Danger Alert mit CoreUI Farben.
        </div>
        <div class="alert alert-info" role="alert">
          <i class="bi bi-lightbulb me-2"></i>
          Dies ist eine Info Alert mit CoreUI Farben.
        </div>
      </div>
    </div>

    <!-- Card Demo -->
    <div class="row mb-4">
      <div class="col-12">
        <h5 class="mb-3">Cards</h5>
      </div>
      <div class="col-md-6 col-lg-4 mb-3">
        <div class="card">
          <div class="card-header bg-primary text-white">
            <i class="bi bi-star me-2"></i>Primary Card
          </div>
          <div class="card-body">
            <p class="card-text">Dies ist eine Karte mit Primary Header.</p>
            <button class="btn btn-primary btn-sm">Action</button>
          </div>
        </div>
      </div>
      <div class="col-md-6 col-lg-4 mb-3">
        <div class="card">
          <div class="card-header bg-success text-white">
            <i class="bi bi-check-circle me-2"></i>Success Card
          </div>
          <div class="card-body">
            <p class="card-text">Dies ist eine Karte mit Success Header.</p>
            <button class="btn btn-success btn-sm">Action</button>
          </div>
        </div>
      </div>
      <div class="col-md-6 col-lg-4 mb-3">
        <div class="card">
          <div class="card-header bg-warning text-white">
            <i class="bi bi-exclamation-triangle me-2"></i>Warning Card
          </div>
          <div class="card-body">
            <p class="card-text">Dies ist eine Karte mit Warning Header.</p>
            <button class="btn btn-warning btn-sm">Action</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Form Demo -->
    <div class="row mb-4">
      <div class="col-12">
        <h5 class="mb-3">Forms</h5>
      </div>
      <div class="col-md-6">
        <div class="card">
          <div class="card-body">
            <form>
              <div class="mb-3">
                <label for="demoInput" class="form-label">Demo Input</label>
                <input type="text" class="form-control" id="demoInput" placeholder="Eingabe hier...">
              </div>
              <div class="mb-3">
                <label for="demoSelect" class="form-label">Demo Select</label>
                <select class="form-select" id="demoSelect">
                  <option selected>Wählen Sie eine Option</option>
                  <option value="1">Option 1</option>
                  <option value="2">Option 2</option>
                  <option value="3">Option 3</option>
                </select>
              </div>
              <div class="mb-3">
                <label for="demoTextarea" class="form-label">Demo Textarea</label>
                <textarea class="form-control" id="demoTextarea" rows="3" placeholder="Ihre Nachricht..."></textarea>
              </div>
              <button type="submit" class="btn btn-primary">Submit</button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Color Palette -->
    <div class="row mb-4">
      <div class="col-12">
        <h5 class="mb-3">Farbpalette</h5>
      </div>
      <div class="col-md-6">
        <div class="card">
          <div class="card-header">
            <h6 class="mb-0">Primary Colors</h6>
          </div>
          <div class="card-body">
            <div class="d-flex flex-wrap gap-2">
              <div class="color-swatch bg-primary" title="Primary"></div>
              <div class="color-swatch" style="background-color: var(--color-primary-hover)" title="Primary Hover"></div>
              <div class="color-swatch" style="background-color: var(--color-primary-active)" title="Primary Active"></div>
              <div class="color-swatch bg-primary-light" title="Primary Light"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card">
          <div class="card-header">
            <h6 class="mb-0">Success Colors</h6>
          </div>
          <div class="card-body">
            <div class="d-flex flex-wrap gap-2">
              <div class="color-swatch bg-success" title="Success"></div>
              <div class="color-swatch" style="background-color: var(--color-success-hover)" title="Success Hover"></div>
              <div class="color-swatch" style="background-color: var(--color-success-active)" title="Success Active"></div>
              <div class="color-swatch bg-success-light" title="Success Light"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Theme Toggle Demo -->
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h6 class="mb-0">Theme Toggle</h6>
            <ThemeToggle />
          </div>
          <div class="card-body">
            <p>Verwenden Sie den Theme-Toggle oben rechts, um zwischen hellem und dunklem Design zu wechseln.</p>
            <p class="text-muted mb-0">Das aktuelle Theme wird automatisch gespeichert und beim nächsten Besuch wiederhergestellt.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ThemeToggle from './ThemeToggle.vue'
</script>

<style scoped>
.color-demo {
  padding: 1rem;
}

.color-swatch {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  border: 2px solid var(--color-border);
  cursor: pointer;
  transition: transform 0.2s ease;
}

.color-swatch:hover {
  transform: scale(1.1);
}

.card-header h6 {
  color: var(--color-text-primary);
}

.alert {
  border: 1px solid;
}
</style>