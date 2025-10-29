import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { TaskService } from '../../../core/services/task.service';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { UserService } from '../../../core/services/user.service';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { Task, TaskStatus, TaskPriority, TaskCategory } from '../../../core/models/task.model';

type ViewMode = 'grid' | 'kanban' | 'list';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, NavbarComponent, LoadingSpinnerComponent],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.css'
})
export class TaskListComponent implements OnInit {
  TaskStatus = TaskStatus;
  TaskPriority = TaskPriority;
  TaskCategory = TaskCategory;

  showCreateModal = false;
  showUserModal = false;
  editingTask: Task | null = null;
  viewMode: ViewMode = 'grid';
  
  newTask = {
    title: '',
    description: '',
    priority: TaskPriority.MEDIUM,
    category: TaskCategory.WORK,
    status: TaskStatus.TODO
  };

  filterStatus: TaskStatus | 'all' = 'all';
  filterPriority: TaskPriority | 'all' = 'all';
  filterCategory: TaskCategory | 'all' = 'all';
  searchQuery = '';
  sortBy: 'date' | 'priority' | 'title' = 'date';

  constructor(
    public taskService: TaskService,
    public authService: AuthService,
    public themeService: ThemeService,
    public userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadTasks();
    if (this.canManageUsers()) {
      this.userService.getUsersInOrganization().subscribe();
    }
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
    
    if (this.filterPriority !== 'all') {
      tasks = tasks.filter(t => t.priority === this.filterPriority);
    }
    
    if (this.filterCategory !== 'all') {
      tasks = tasks.filter(t => t.category === this.filterCategory);
    }
    
    if (this.searchQuery) {
      tasks = tasks.filter(t => 
        t.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        t.description?.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
    
    return this.sortTasks(tasks);
  }

  sortTasks(tasks: Task[]): Task[] {
    return [...tasks].sort((a, b) => {
      switch (this.sortBy) {
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'title':
          return a.title.localeCompare(b.title);
        case 'date':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }

  getTasksByStatus(status: TaskStatus): Task[] {
    return this.filteredTasks.filter(t => t.status === status);
  }

  // Drag and drop
  drop(event: CdkDragDrop<Task[]>, newStatus?: TaskStatus): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
      
      if (newStatus) {
        const task = event.container.data[event.currentIndex];
        this.taskService.updateTask(task.id, { status: newStatus }).subscribe();
      }
    }
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
    if (!this.newTask.title || !this.newTask.title.trim()) {
      alert('Please enter a task title');
      return;
    }

    this.newTask.title = this.newTask.title.trim();

    console.log('Creating task with data:', this.newTask); // Debug log

    if (this.editingTask) {
      this.taskService.updateTask(this.editingTask.id, this.newTask).subscribe({
        next: () => {
          this.showCreateModal = false;
          this.resetForm();
        },
        error: (err) => {
          console.error('Full error object:', err); // Detailed error
          console.error('Error status:', err.status); // Status code
          console.error('Error message:', err.error); // Backend error message
          alert(`Failed to update task: ${err.error?.message || err.message || 'Unknown error'}`);
        }
      });
    } else {
      this.taskService.createTask(this.newTask).subscribe({
        next: () => {
          this.showCreateModal = false;
          this.resetForm();
        },
        error: (err) => {
          console.error('Full error object:', err); // Detailed error
          console.error('Error status:', err.status); // Status code
          console.error('Error message:', err.error); // Backend error message
          alert(`Failed to create task: ${err.error?.message || err.message || 'Unknown error'}`);
        }
      });
    }
  }

  deleteTask(task: Task, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (confirm(`Delete "${task.title}"?`)) {
      this.taskService.deleteTask(task.id).subscribe({
        error: (err) => console.error('Error deleting task:', err)
      });
    }
  }

  updateTaskStatus(task: Task, status: TaskStatus, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.taskService.updateTask(task.id, { status }).subscribe();
  }

  closeModal(): void {
    this.showCreateModal = false;
    this.showUserModal = false;
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

  canManageUsers(): boolean {
    return this.authService.hasRole(['owner', 'admin']);
  }

  clearFilters(): void {
    this.filterStatus = 'all';
    this.filterPriority = 'all';
    this.filterCategory = 'all';
    this.searchQuery = '';
  }

  getPriorityColor(priority: TaskPriority): string {
    const colors = {
      [TaskPriority.HIGH]: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/30',
      [TaskPriority.MEDIUM]: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30',
      [TaskPriority.LOW]: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30'
    };
    return colors[priority];
  }

  getStatusColor(status: TaskStatus): string {
    const colors = {
      [TaskStatus.TODO]: 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800',
      [TaskStatus.IN_PROGRESS]: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/30',
      [TaskStatus.COMPLETED]: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950/30'
    };
    return colors[status];
  }

  getCompletionPercentage(): number {
    const stats = this.taskService.getTaskStats();
    return stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  }

  getTrendIndicator(current: number, previous: number): { icon: string; color: string; value: number } {
    const diff = current - previous;
    const percentage = previous > 0 ? Math.round((diff / previous) * 100) : 0;
    
    if (diff > 0) {
      return { icon: '↑', color: 'text-green-600 dark:text-green-400', value: percentage };
    } else if (diff < 0) {
      return { icon: '↓', color: 'text-red-600 dark:text-red-400', value: Math.abs(percentage) };
    }
    return { icon: '→', color: 'text-gray-600 dark:text-gray-400', value: 0 };
  }
}
