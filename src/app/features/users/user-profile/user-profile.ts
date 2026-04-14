import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Router } from '@angular/router';
import { UserService } from '../../../core/services/api/user.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { LucideAngularModule } from 'lucide-angular';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './user-profile.html',
  styleUrls: ['./user-profile.css']
})
export class UserProfileComponent implements OnInit {
  // Tipado explícito con la interfaz User — evita el uso de 'any'
  user: User | null = null;
  loading: boolean = true;
  error: string = '';

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private notificationService: NotificationService,
    private confirmService: ConfirmService
  ) {}

  ngOnInit(): void {
    this.authService.getProfile().subscribe({
      next: (userData: User) => {
        this.user = userData;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = 'No se pudo cargar la información del perfil.';
        this.loading = false;
        console.error('Error al cargar perfil:', err);
        this.cdr.markForCheck();
      }
    });
  }

  /** Retorna la inicial del nombre del usuario para el avatar */
  getInitials(): string {
    if (!this.user || !this.user.name) return '?';
    return this.user.name.charAt(0).toUpperCase();
  }

  editProfile(): void {
    if (this.user && this.user.id) {
      this.router.navigate(['/users', this.user.id, 'edit']);
    }
  }

  async deleteProfile(): Promise<void> {
    if (!this.user || !this.user.id) return;

    const confirmed = await this.confirmService.ask(
      '¿Eliminar cuenta?',
      '¿Estás seguro de que deseas eliminar tu cuenta? Esta acción borrará todos tus datos y no se puede deshacer.'
    );

    if (confirmed) {
      this.userService.deleteUser(this.user.id).subscribe({
        next: () => {
          // Mensaje de despedida antes de cerrar sesión
          this.notificationService.info('Tu cuenta se está cerrando para siempre. Cerrando sesión...');
          
          // Esperamos un momento para que el usuario lea el mensaje antes de redirigir
          setTimeout(() => {
            this.authService.logout().subscribe({
              next: () => this.router.navigate(['/login']),
              error: () => this.router.navigate(['/login']) // Redirigimos incluso si falla la petición
            });
          }, 1500);
        },
        error: (err) => {
          console.error('Error al eliminar cuenta:', err);
          if (err.status === 409) {
            this.notificationService.error('Aún tienes tareas pendientes. Complétalas todas para poder eliminar tu cuenta.');
          } else {
            this.notificationService.error('Ocurrió un error al intentar eliminar tu cuenta');
          }
        }
      });
    }
  }
}
