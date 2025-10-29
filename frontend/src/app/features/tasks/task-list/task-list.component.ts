import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../../core/services/task.service';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { Task, TaskStatus, TaskPriority, TaskCategory } from '../../../core/models/task.model';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, LoadingSpinnerComponent],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.css'
})
export class TaskListComponent implements OnInit {
  TaskStatus = TaskStatus;
  TaskPriority = TaskPriority;
  TaskCategory = TaskCategory;

  showCreateModal = false;
  editingTask: Task | null = null;
  
  newTask = {
    title: '',
    description: '',
    priority: TaskPriority.MEDIUM,
    category: TaskCategory.WORK,
    status: TaskStatus.TODO
  };

  timeFilter: 'day' | 'week' | 'month' = 'day';
  filterStatus: TaskStatus | 'all' = 'all';
  searchQuery = '';

  constructor(
    public taskService: TaskService,
    public authService: AuthService,
    public themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.taskService.loadTasks().subscribe({
      error: (err) => console.error('Error loading tasks:', err)
    });
  }

  get filteredTasks(): Task[] {
    let tasks = this.taskService.tasks();
    
    if (this.filterStatus !== 'all') {
      tasks = tasks.filter(t => t.status === this.filterStatus);
    }
    
    if (this.searchQuery) {
      tasks = tasks.filter(t => 
        t.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        t.description?.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
    
    return tasks;
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }

  openCreateModal(): void {
    this.editingTask = null;
    this.resetForm();
    this.showCreateModal = true;
  }

  openEditModal(task: Task): void {
    this.editingTask = task;
    this.newTask = {
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      category: task.category,
      status: task.status
    };
    this.showCreateModal = true;
  }

  createTask(): void {
    if (!this.newTask.title.trim()) return;

    if (this.editingTask) {
      this.taskService.updateTask(this.editingTask.id, this.newTask).subscribe({
        next: () => {
          this.showCreateModal = false;
          this.resetForm();
        },
        error: (err) => console.error('Error updating task:', err)
      });
    } else {
      this.taskService.createTask(this.newTask).subscribe({
        next: () => {
          this.showCreateModal = false;
          this.resetForm();
        },
        error: (err) => console.error('Error creating task:', err)
      });
    }
  }

  deleteTask(task: Task): void {
    if (confirm(`Delete "${task.title}"?`)) {
      this.taskService.deleteTask(task.id).subscribe({
        error: (err) => console.error('Error deleting task:', err)
      });
    }
  }

  closeModal(): void {
    this.showCreateModal = false;
    this.resetForm();
  }

  private resetForm(): void {
    this.newTask = {
      title: '',
      description: '',
      priority: TaskPriority.MEDIUM,
      category: TaskCategory.WORK,
      status: TaskStatus.TODO
    };
    this.editingTask = null;
  }

  canEditTask(): boolean {
    return this.authService.hasRole(['admin', 'owner']);
  }

  getPriorityBadge(priority: TaskPriority): string {
    const badges = {
      [TaskPriority.LOW]: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
      [TaskPriority.MEDIUM]: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
      [TaskPriority.HIGH]: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
    };
    return badges[priority];
  }

  getStatusBadge(status: TaskStatus): string {
    const badges = {
      [TaskStatus.TODO]: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-400',
      [TaskStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
      [TaskStatus.COMPLETED]: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400'
    };
    return badges[status];
  }

  formatStatus(status: TaskStatus): string {
    return status === TaskStatus.IN_PROGRESS ? 'In progress' : 
           status === TaskStatus.TODO ? 'To do' : 'Done';
  }
}
