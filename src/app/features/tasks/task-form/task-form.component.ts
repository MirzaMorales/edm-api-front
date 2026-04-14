import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TaskService } from '../../../core/services/api/task.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';
import { Task } from '../../../core/models/task.model';
import { sanitizeText } from '../../../core/utils/security.utils';

@Component({
  selector: 'app-task-form',
  standalone: false,
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.css']
})
export class TaskFormComponent implements OnInit {
  taskForm: FormGroup;
  isEditMode: boolean = false;
  taskId?: number;
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  errorMessage: string = '';

  // Límite de caracteres para la descripción
  readonly MAX_DESC_LENGTH = 500;

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private notificationService: NotificationService
  ) {
    this.taskForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
      description: ['', [Validators.required, Validators.maxLength(this.MAX_DESC_LENGTH)]],
      priority: [false]
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.taskId = +idParam;
      this.loadTaskData(this.taskId);
    }
  }

  /** Retorna los caracteres restantes del campo descripción */
  get descRemainingChars(): number {
    const currentLength = this.taskForm.get('description')?.value?.length ?? 0;
    return this.MAX_DESC_LENGTH - currentLength;
  }

  loadTaskData(id: number): void {
    this.isLoading = true;
    this.taskService.getTaskById(id).subscribe({
      next: (task: Task) => {
        this.taskForm.patchValue({
          name: task.name,
          description: task.description,
          priority: task.priority
        });
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = 'Error al cargar la información de la tarea.';
        this.isLoading = false;
        console.error('Error al cargar tarea:', err);
      }
    });
  }

  onSubmit(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    // Sanitizamos los campos de texto para prevenir XSS antes de enviar a la API
    const taskData: Task = {
      ...this.taskForm.value,
      name: sanitizeText(this.taskForm.value.name),
      description: sanitizeText(this.taskForm.value.description),
    };

    if (this.isEditMode && this.taskId) {
      this.taskService.updateTask(this.taskId, taskData).subscribe({
        next: () => {
          this.notificationService.success('Tarea actualizada correctamente');
          this.router.navigate(['/tasks']);
        },
        error: (err) => {
          this.notificationService.error('Hubo un error al actualizar la tarea');
          this.isSubmitting = false;
          console.error('Error al actualizar tarea:', err);
        }
      });
    } else {
      this.taskService.createTask(taskData).subscribe({
        next: () => {
          this.notificationService.success('Tarea creada correctamente');
          this.router.navigate(['/tasks']);
        },
        error: (err) => {
          this.notificationService.error('Hubo un error al crear la tarea');
          this.isSubmitting = false;
          console.error('Error al crear tarea:', err);
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/tasks']);
  }
}
