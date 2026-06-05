import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Salon } from '../../../../../core/models';
import { SalonService } from '../../../../../core/services/salon.service';
import { ServiceService } from '../../../../../core/services/service.service';
import { BookingDialogComponent } from '../../../components/booking-dialog/booking-dialog.component';

@Component({
  selector: 'app-salon-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, BookingDialogComponent],
  templateUrl: './salon-detail.component.html',
  styleUrls: ['./salon-detail.component.scss'],
})
export class SalonDetailComponent implements OnInit {
  salon: Salon | null = null;
  services: any[] = [];
  loading = true;
  showBooking = false;

  constructor(
    private route: ActivatedRoute,
    private salonService: SalonService,
    private serviceService: ServiceService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadSalon(id);
  }

  loadSalon(id: string) {
    this.loading = true;
    this.salonService.getSalonById(id).subscribe({
      next: (s) => {
        this.salon = s;
        // Fetch services and clear loading only after services arrive
        this.serviceService.getServices(id).subscribe({
          next: (services: any) => {
            this.services = services;
            // Clear loading then force change detection so template updates
            this.loading = false;
            try { this.cdr.detectChanges(); } catch (e) { /* ignore */ }
          },
          error: (err) => {
            this.loading = false;
            try { this.cdr.detectChanges(); } catch (e) { /* ignore */ }
            console.error('[SALON_DETAIL] load services error', err);
          },
        });
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  // kept for compatibility (not used by loadSalon)
  loadServices(salonId: string) {
    this.serviceService.getServices(salonId).subscribe({ next: (services: any) => {
      this.services = services;
      console.log('Services loaded (helper):', this.services);
    }});
  }

  openBookingDialog() {
    this.showBooking = true;
  }

  closeBookingDialog() {
    this.showBooking = false;
  }
}

