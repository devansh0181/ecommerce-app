import { Component, OnInit } from '@angular/core';
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
  loading = false;
  showBooking = false;

  constructor(private route: ActivatedRoute, private salonService: SalonService, private serviceService: ServiceService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadSalon(id);
  }

  loadSalon(id: string) {
    this.loading = true;
    this.salonService.getSalonById(id).subscribe({
      next: (s) => {
        this.salon = s;
        this.loadServices(id);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  loadServices(salonId: string) {
    this.serviceService.getServices(salonId).subscribe({ next: (services: any) => (this.services = services) });
  }

  openBookingDialog() {
    this.showBooking = true;
  }

  closeBookingDialog() {
    this.showBooking = false;
  }
}

