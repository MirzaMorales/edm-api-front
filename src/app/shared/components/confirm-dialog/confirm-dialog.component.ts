import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmService, ConfirmData } from '../../../core/services/confirm.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-backdrop" *ngIf="confirm$ | async as data">
      <div class="modal-card">
        <div class="modal-header">
          <h2>{{ data.title }}</h2>
        </div>
        <div class="modal-body">
          <p>{{ data.message }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" (click)="data.resolve(false)">{{ data.cancelText }}</button>
          <button class="btn-confirm" (click)="data.resolve(true)">{{ data.confirmText }}</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(4px);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.2s ease-out;
    }

    .modal-card {
      background: white;
      width: 90%;
      max-width: 450px;
      border-radius: 24px;
      padding: 2.5rem;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
      animation: scaleUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .modal-header h2 {
      margin: 0 0 1rem;
      font-size: 1.5rem;
      color: #111827;
      letter-spacing: -0.5px;
    }

    .modal-body p {
      margin: 0 0 2rem;
      color: #4b5563;
      line-height: 1.5;
      font-size: 1.05rem;
    }

    .modal-footer {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
    }

    button {
      padding: 0.8rem 1.8rem;
      border-radius: 12px;
      font-weight: 600;
      font-size: 0.95rem;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
    }

    .btn-cancel {
      background: #f3f4f6;
      color: #374151;
    }

    .btn-cancel:hover {
      background: #e5e7eb;
    }

    .btn-confirm {
      background: #1f2937;
      color: white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .btn-confirm:hover {
      background: #111827;
      transform: translateY(-1px);
      box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes scaleUp {
      from { transform: scale(0.9); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
  `]
})
export class ConfirmDialogComponent {
  private confirmService = inject(ConfirmService);
  confirm$ = this.confirmService.confirm$;
}
