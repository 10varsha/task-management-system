import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
              </svg>
            </div>
            <div>
              <h1 class="text-lg font-bold text-gray-900 dark:text-white">TaskFlow</h1>
              <p class="text-xs text-gray-500 dark:text-gray-400">Dashboard</p>
            </div>
          </div>

          <!-- Right side -->
          <div class="flex items-center gap-3">
            <!-- Theme Toggle -->
            <button
              (click)="themeService.toggleTheme()"
              class="p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              [title]="themeService.isDarkMode() ? 'Switch to light mode' : 'Switch to dark mode'"
            >
              @if (themeService.isDarkMode()) {
                <svg class="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"/>
                </svg>
              } @else {
                <svg class="w-5 h-5 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
                </svg>
              }
            </button>

            <!-- User menu -->
            <div class="flex items-center gap-3 pl-3 border-l border-gray-200 dark:border-slate-800">
              <div class="text-right hidden sm:block">
                <p class="text-sm font-semibold text-gray-900 dark:text-white">
                  {{ authService.getUserDisplayName() }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {{ authService.currentUser()?.role }}
                </p>
              </div>
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold shadow-lg">
                {{ getInitials() }}
              </div>
            </div>

            <!-- Logout -->
            <button
              (click)="authService.logout()"
              class="px-4 py-2 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50 font-medium transition-all text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  constructor(
    public authService: AuthService,
    public themeService: ThemeService
  ) {}

  getInitials(): string {
    const user = this.authService.currentUser();
    if (!user) return 'U';
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  }
}
