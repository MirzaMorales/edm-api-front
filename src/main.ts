import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Forzar que la URL del navegador sea la raíz al iniciar (complementa a MemoryLocationStrategy)
if (typeof window !== 'undefined') {
  window.history.replaceState({}, '', '/');
}

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
