import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Toast } from '../../../core/services/notification.service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="toast-container">
      <div *ngFor="let toast of toasts$ | async" 
           [class]="'toast ' + toast.type"
           (click)="remove(toast.id)">
        <div class="toast-icon">
          <lucide-icon [name]="getIconName(toast.type)" [size]="20"></lucide-icon>
        </div>
        <div class="toast-content">
          <p>{{ toast.message }}</p>
        </div>
        <div class="toast-close">
          <lucide-icon name="x" [size]="16"></lucide-icon>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 2rem;
      right: 2rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      pointer-events: none;
    }

    .toast {
      pointer-events: auto;
      min-width: 300px;
      padding: 1rem 1.5rem;
      border-radius: 20px;
      display: flex;
      align-items: center;
      gap: 1rem;
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.3);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
      animation: slideIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      cursor: pointer;
      transition: transform 0.2s ease;
    }

    .toast:hover {
      transform: scale(1.02);
    }

    .toast.success { border-left: 6px solid #4ade80; }
    .toast.error { border-left: 6px solid #f87171; }
    .toast.info { border-left: 6px solid #60a5fa; }

    .toast-icon {
      font-size: 1.5rem;
    }

    .toast-content p {
      margin: 0;
      color: #1f2937;
      font-weight: 500;
      font-size: 0.95rem;
    }

    .toast-close {
      margin-left: auto;
      color: #9ca3af;
      font-size: 1.2rem;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%) scale(0.8);
        opacity: 0;
      }
      to {
        transform: translateX(0) scale(1);
        opacity: 1;
      }
    }
  `]
})
export class ToastContainerComponent {
  private notificationService = inject(NotificationService);
  toasts$ = this.notificationService.toasts$;

  remove(id: number) {
    this.notificationService.remove(id);
  }

  getIconName(type: string): string {
    switch (type) {
      case 'success': return 'check-circle';
      case 'error': return 'alert-circle';
      default: return 'info';
    }
  }
}
