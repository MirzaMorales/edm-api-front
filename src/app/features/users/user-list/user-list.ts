import { Component, OnInit, inject, ChangeDetectorRef, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { UserService } from '../../../core/services/api/user.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-list',
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './user-list.html',
  styleUrl: './user-list.css',
})
export class UserList implements OnInit {
  private userService = inject(UserService);
  private notificationService = inject(NotificationService);
  private confirmService = inject(ConfirmService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);

  users: User[] = [];
  loading = true;
  error = '';

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadUsers();
    }
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Error al cargar los usuarios.';
        this.loading = false;
        this.cdr.detectChanges();
        console.error('Error al obtener usuarios:', err);
      }
    });
  }

  editUser(id: number): void {
    this.router.navigate(['/users', id, 'edit']);
  }

  async deleteUser(user: User): Promise<void> {
    const confirmed = await this.confirmService.ask(
      '¿Eliminar usuario?',
      `¿Estás seguro de que deseas eliminar al usuario "${user.username}"? Esta acción no se puede deshacer.`,
      'Eliminar',
      'Cancelar'
    );

    if (confirmed) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== user.id);
          this.notificationService.success(`Usuario "${user.username}" eliminado correctamente`);
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.notificationService.error('No se pudo eliminar el usuario.');
          console.error('Error al eliminar usuario:', err);
        }
      });
    }
  }
}
