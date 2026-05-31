import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent, NavbarComponent, ToastContainerComponent } from '@shared/components';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, FooterComponent, ToastContainerComponent],
  template: `
    <div class="app-wrapper">
      <app-navbar></app-navbar>

      <main class="app-main">
        <router-outlet></router-outlet>
      </main>

      <app-footer></app-footer>

      <app-toast-container></app-toast-container>
    </div>
  `,
  styleUrl: './app.scss',
})
export class AppComponent {}