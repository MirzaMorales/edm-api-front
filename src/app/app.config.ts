import { ApplicationConfig, provideBrowserGlobalErrorListeners, importProvidersFrom } from '@angular/core';
import { LocationStrategy } from '@angular/common';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { LucideAngularModule, Pencil, Trash2, Plus, CheckCircle, AlertCircle, Info, X, Eye, EyeOff } from 'lucide-angular';
import { SilentLocationStrategy } from './core/strategies/silent-location.strategy';

// import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes), provideClientHydration(withEventReplay()),
    provideHttpClient(withInterceptors([authInterceptor])),
    importProvidersFrom(LucideAngularModule.pick({ Pencil, Trash2, Plus, CheckCircle, AlertCircle, Info, X, Eye, EyeOff })),
    { provide: LocationStrategy, useClass: SilentLocationStrategy }
  ]
};
