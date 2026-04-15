import { Injectable } from '@angular/core';
import { LocationChangeListener, LocationStrategy } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class SilentLocationStrategy extends LocationStrategy {
  private _internalPath: string = '/';
  private _internalState: any = null;

  path(includeHash?: boolean): string {
    return this._internalPath;
  }

  prepareExternalUrl(internal: string): string {
    return '/';
  }

  pushState(state: any, title: string, url: string, queryParams: string): void {
    this._internalPath = url;
    this._internalState = state;
    // No actualizamos la URL del navegador
  }

  replaceState(state: any, title: string, url: string, queryParams: string): void {
    this._internalPath = url;
    this._internalState = state;
    // No actualizamos la URL del navegador
  }

  forward(): void {
    // Implementación mínima para evitar errores
  }

  back(): void {
    // Implementación mínima para evitar errores
  }

  onPopState(fn: LocationChangeListener): void {
    // No reaccionamos a cambios de URL externos
  }

  getState(): any {
    return this._internalState;
  }

  getBaseHref(): string {
    return '/';
  }
}
