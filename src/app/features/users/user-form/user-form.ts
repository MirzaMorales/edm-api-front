import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UserService } from '../../../core/services/api/user.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { User } from '../../../core/models/user.model';
import { USERNAME_PATTERN, NAME_PATTERN, PASSWORD_PATTERN, sanitizeText } from '../../../core/utils/security.utils';

@Component({
  selector: 'app-user-form',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './user-form.html',
  styleUrl: './user-form.css',
})
export class UserForm implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  userForm!: FormGroup;
  isEditMode = false;
  userId: number | null = null;
  loading = false;
  error = '';

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  initForm(): void {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150), Validators.pattern(NAME_PATTERN)]],
      lastname: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150), Validators.pattern(NAME_PATTERN)]],
      // El patrón USERNAME_PATTERN asegura que no se ingresen caracteres especiales ni espacios
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150), Validators.pattern(USERNAME_PATTERN)]],
      password: ['', [Validators.minLength(6), Validators.pattern(PASSWORD_PATTERN)]] // Solo requerido en creación, se configura en checkEditMode
    });
  }

  checkEditMode(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.userId = +idParam;
      this.loadUserData(this.userId);
    } else {
      // En modo creación, la contraseña es obligatoria
      this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6), Validators.pattern(PASSWORD_PATTERN)]);
      this.userForm.get('password')?.updateValueAndValidity();
    }
  }

  loadUserData(id: number): void {
    this.loading = true;
    this.userService.getUserById(id).subscribe({
      next: (user: User) => {
        this.userForm.patchValue({
          name: user.name,
          lastname: user.lastname,
          username: user.username,
          // La contraseña no se rellena por seguridad; si está vacía no se modifica
        });
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = 'Error al cargar los datos del usuario.';
        this.loading = false;
        console.error('Error al cargar usuario:', err);
      }
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';
    const formValue = this.userForm.value;

    // Sanitizamos los campos de texto para prevenir XSS
    const sanitizedData = {
      name: sanitizeText(formValue.name),
      lastname: sanitizeText(formValue.lastname),
      username: sanitizeText(formValue.username),
      ...(formValue.password ? { password: formValue.password } : {})
    };

    if (this.isEditMode && this.userId) {
      this.userService.updateUser(this.userId, sanitizedData).subscribe({
        next: () => {
          this.notificationService.success('Usuario actualizado correctamente');
          this.loading = false;
          // Comprobamos si editamos nuestro propio perfil para redirigir correctamente
          this.authService.getProfile().subscribe({
            next: (profile) => {
              if (profile.id === this.userId) {
                this.router.navigate(['/profile']);
              } else {
                this.router.navigate(['/users']);
              }
            },
            error: () => this.router.navigate(['/users'])
          });
        },
        error: (err) => this.handleError(err)
      });
    } else {
      this.userService.createUser(sanitizedData).subscribe({
        next: () => {
          this.notificationService.success('Usuario creado correctamente');
          this.router.navigate(['/users']);
        },
        error: (err) => this.handleError(err)
      });
    }
  }

  handleError(err: any): void {
    this.loading = false;
    this.error = err?.error?.message || 'Ha ocurrido un error al guardar.';
    // Mostramos el error también como notificación para mejor visibilidad
    this.notificationService.error(this.error);
    console.error('Error en operación de usuario:', err);
  }
}
