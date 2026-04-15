import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UserService } from '../../../core/services/api/user.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { User, CreateUserDto, UpdateUserDto } from '../../../core/models/user.model';
import { USERNAME_PATTERN, NAME_PATTERN, PASSWORD_PATTERN, sanitizeText, noOnlySpaces, usernameAsyncValidator } from '../../../core/utils/security.utils';

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
  isProfileEdit = false;
  userId: number | null = null;
  loading = false;
  error = '';

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  initForm(): void {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150), Validators.pattern(NAME_PATTERN), noOnlySpaces()]],
      lastname: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150), Validators.pattern(NAME_PATTERN), noOnlySpaces()]],
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150), Validators.pattern(USERNAME_PATTERN)], [usernameAsyncValidator(this.userService)]],
      password: ['', [Validators.minLength(6), Validators.pattern(PASSWORD_PATTERN)]]
    });
  }

  checkEditMode(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const url = this.router.url;

    if (idParam) {
      // Edición desde lista de usuarios (/users/:id/edit)
      this.isEditMode = true;
      this.userId = +idParam;
      this.loadUserData(this.userId);
    } else if (url.includes('/profile/edit')) {
      // Edición del propio perfil sin ID en la URL (/profile/edit)
      this.isEditMode = true;
      this.isProfileEdit = true;
      this.loading = true;
      this.authService.getProfile().subscribe({
        next: (user: User) => {
          this.userId = user.id;
          this.userForm.patchValue({
            name: user.name,
            lastname: user.lastname,
            username: user.username,
          });
          this.userForm.get('username')?.disable();
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.error = 'No se pudo cargar el perfil.';
          this.loading = false;
        }
      });
    } else {
      // Creación de nuevo usuario
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
        });
        this.userForm.get('username')?.disable();
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
    // En modo edición, el username no se incluye porque está deshabilitado
    // y Angular lo excluye automáticamente de formValue (devolvería undefined)
    const sanitizedData: Record<string, any> = {
      name: sanitizeText(formValue.name),
      lastname: sanitizeText(formValue.lastname),
      ...(!this.isEditMode ? { username: sanitizeText(formValue.username) } : {}),
      ...(formValue.password ? { password: formValue.password } : {})
    };

    if (this.isEditMode && this.userId) {
      this.userService.updateUser(this.userId, sanitizedData as UpdateUserDto).subscribe({
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
      this.userService.createUser(sanitizedData as CreateUserDto).subscribe({
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
