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

  getInitials(): string {
    if (!this.user || !this.user.name) return '?';
    return this.user.name.charAt(0).toUpperCase();
  }

  editProfile(): void {
    this.router.navigate(['/profile/edit']);
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
          this.notificationService.info('Tu cuenta se está cerrando para siempre. Cerrando sesión...');
          
          setTimeout(() => {
            this.authService.logout().subscribe({
              next: () => this.router.navigate(['/login']),
              error: () => this.router.navigate(['/login'])
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
