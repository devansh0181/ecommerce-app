import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';

import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from './components/empty-state/empty-state.component';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { ErrorDialogComponent } from './components/error-dialog/error-dialog.component';
import { ToastContainerComponent } from './components/toast-container/toast-container.component';
import { ToastService } from './services/toast.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    NavbarComponent,
    FooterComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ConfirmationDialogComponent,
    ErrorDialogComponent,
    ToastContainerComponent,
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    NavbarComponent,
    FooterComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ConfirmationDialogComponent,
    ErrorDialogComponent,
    ToastContainerComponent,
  ],
  providers: [ToastService],
})
export class SharedModule {}
