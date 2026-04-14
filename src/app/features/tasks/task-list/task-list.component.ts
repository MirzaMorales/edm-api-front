import { Component, OnInit, ChangeDetectorRef, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TaskService } from '../../../core/services/api/task.service';
import { Task } from '../../../core/models/task.model';
import { Router } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmService } from '../../../core/services/confirm.service';

@Component({
  selector: 'app-task-list',
  standalone: false,
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  private platformId = inject(PLATFORM_ID);

  constructor(
    private taskService: TaskService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private notificationService: NotificationService,
    private confirmService: ConfirmService
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadTasks();
    }
  }

  loadTasks(): void {
    this.isLoading = true;
    this.taskService.getTasks().subscribe({
      next: (data) => {
        this.tasks = data;
        this.isLoading = false;
        this.cdr.detectChanges(); // Forzar actualización de vista
      },
      error: (err) => {
        this.errorMessage = 'Hubo un error al cargar las tareas.';
        this.isLoading = false;
        console.error('Error al obtener tareas:', err);
      }
    });
  }

  navigateToCreate(): void {
    this.router.navigate(['/tasks/new']);
  }

  navigateToEdit(id: number | undefined): void {
    if (id) {
      this.router.navigate(['/tasks/edit', id]);
    }
  }

  /**
   * Alterna el estado completado de una tarea sin recargar la página.
   * Hace un PUT al backend enviando solo el campo 'completed'.
   */
  toggleCompleted(task: Task): void {
    const newState = !task.completed;
    this.taskService.updateTask(task.id!, { completed: newState }).subscribe({
      next: () => {
        // Actualización local optimista: sin necesidad de recargar la lista
        task.completed = newState;
        this.cdr.detectChanges();
        const msg = newState ? 'Tarea marcada como completada ✓' : 'Tarea marcada como pendiente';
        this.notificationService.success(msg);
      },
      error: (err) => {
        this.notificationService.error('No se pudo actualizar el estado de la tarea');
        console.error('Error al actualizar estado de tarea:', err);
      }
    });
  }

  async deleteTask(id: number | undefined): Promise<void> {
    if (!id) return;

    const confirmed = await this.confirmService.ask(
      '¿Eliminar tarea?',
      '¿Estás seguro de que deseas eliminar esta tarea? Esta acción no se puede deshacer.'
    );

    if (confirmed) {
      this.taskService.deleteTask(id).subscribe({
        next: () => {
          this.tasks = this.tasks.filter(t => t.id !== id);
          this.notificationService.success('Tarea eliminada correctamente');
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.notificationService.error('Hubo un error al eliminar la tarea');
          console.error('Error al eliminar tarea:', err);
        }
      });
    }
  }
}
