import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ConfirmData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  resolve: (value: boolean) => void;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmService {
  private confirmSubject = new Subject<ConfirmData | null>();
  confirm$ = this.confirmSubject.asObservable();

  ask(title: string, message: string, confirmText: string = 'Confirmar', cancelText: string = 'Cancelar'): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmSubject.next({
        title,
        message,
        confirmText,
        cancelText,
        resolve: (value: boolean) => {
          this.confirmSubject.next(null);
          resolve(value);
        }
      });
    });
  }
}
