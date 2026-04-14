import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';
import { UserService } from '../../../core/services/api/user.service';
import { CommonModule } from '@angular/common';
import { USERNAME_PATTERN, NAME_PATTERN, PASSWORD_PATTERN, sanitizeText } from '../../../core/utils/security.utils';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, LucideAngularModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  registerForm: FormGroup;
  errorMessage: string = '';
  registerMessage: string = '';
  showRegisterModal: boolean = false;
  isSubmitting: boolean = false;
  showPassword = false;
  passwordFailed = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {
    // Formulario de login con validaciones: campo requerido, longitud mínima y patrón seguro
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.pattern(USERNAME_PATTERN)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Formulario de registro con validaciones equivalentes
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150), Validators.pattern(NAME_PATTERN)]],
      lastname: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150), Validators.pattern(NAME_PATTERN)]],
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150), Validators.pattern(USERNAME_PATTERN)]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.pattern(PASSWORD_PATTERN)]]
    });
  }

  toggleRegisterModal(): void {
    this.showRegisterModal = !this.showRegisterModal;
    this.registerMessage = '';
    this.registerForm.reset();
  }

  onRegisterSubmit(): void {
    if (this.registerForm.valid) {
      this.isSubmitting = true;
      // Sanitizamos los campos de texto antes de enviar para prevenir XSS
      const sanitizedData = {
        name: sanitizeText(this.registerForm.value.name),
        lastname: sanitizeText(this.registerForm.value.lastname),
        username: sanitizeText(this.registerForm.value.username),
        password: this.registerForm.value.password
      };
      this.userService.createUser(sanitizedData).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.registerMessage = '¡Cuenta creada con éxito! Ya puedes iniciar sesión.';
          setTimeout(() => {
            this.toggleRegisterModal();
          }, 2000);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.registerMessage = 'Error al crear la cuenta. El usuario podría ya existir.';
          console.error(err);
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }

  togglePasswordVisibility(): void {
    if (!this.passwordFailed) {
      this.showPassword = !this.showPassword;
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.passwordFailed = false;
      this.errorMessage = '';
      // Aplicamos trim para evitar espacios accidentales en las credenciales
      const credentials = {
        username: this.loginForm.value.username.trim(),
        password: this.loginForm.value.password
      };
      this.authService.login(credentials).subscribe({
        next: () => {
          // Redirigimos a la ruta de tareas tras un login exitoso
          this.router.navigate(['/tasks']);
        },
        error: (err) => {
          this.passwordFailed = true;
          this.showPassword = false;
          
          let msg = 'Credenciales incorrectas. Intenta de nuevo.';
          if (err.error) {
            if (typeof err.error.message === 'string') {
              msg = err.error.message;
            } else if (Array.isArray(err.error.message)) {
              msg = err.error.message[0];
            } else if (typeof err.error === 'string') {
              msg = err.error;
            }
          }
          this.errorMessage = msg;
          console.error('Error detallado de login:', err);
        }
      });
    }
  }
}