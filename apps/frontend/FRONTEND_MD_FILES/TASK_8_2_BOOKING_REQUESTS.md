# TASK 8.2: Booking Requests Management

## 🎯 Objective
Build booking requests page with accept/reject functionality.

## 📍 Location
Create files in: `apps/frontend/src/app/features/barber/pages/bookings/booking-requests/`

## 📋 Instructions for GitHub Copilot

**Copy this entire content and give to Copilot with:**
```
"Execute this task in agent mode. Create booking-requests page with:
- List pending booking requests
- Request cards with customer info, services, price
- Accept dialog with confirmation
- Reject dialog with reason input
- Loading states and error handling
- Responsive design
Include TypeScript, HTML, and SCSS."
```

---

## PAGE LAYOUT

```
Header
├── "Booking Requests" title
├── Filter tabs (All, Pending, Accepted, Rejected)
├── Refresh button
└── Request count badge

Request Cards (Grid)
├── Card per request
│   ├── Customer avatar + name
│   ├── Phone number
│   ├── Services list
│   ├── Total price
│   ├── Preferred time
│   ├── Status badge
│   ├── Accept button
│   └── Reject button
├── Loading skeleton (while fetching)
└── Empty state

Dialogs
├── Accept Confirmation Dialog
│   ├── Booking details
│   ├── "Confirm accept" button
│   └── Cancel button
│
└── Reject Reason Dialog
    ├── Booking details
    ├── Reason textarea
    ├── "Send rejection" button
    └── Cancel button
```

---

## COMPONENTS TO CREATE

### booking-requests.component.ts
Main container with:
- Load pending requests
- Filter by status
- Handle accept/reject actions
- Dialog management

### request-card.component.ts
Card displaying:
- Customer info
- Services
- Price
- Time
- Action buttons

### accept-dialog.component.ts
Confirmation for accepting booking

### reject-dialog.component.ts
Reason input for rejection

---

## DATA INTEGRATION

Services:
- BookingService.getSalonBookings(salonId, { status: 'PENDING' })
- BookingService.acceptBooking(bookingId)
- BookingService.rejectBooking(bookingId, reason)

---

## FEATURES

✓ List pending booking requests
✓ Filter by status tabs
✓ Accept with confirmation dialog
✓ Reject with reason input
✓ Service integration
✓ Toast notifications on success
✓ Error handling
✓ Loading states
✓ Responsive grid

---

## STYLING NOTES

- Grid: 1 col mobile, 2 col tablet, 3 col desktop
- Cards: Hover lift effect, shadow
- Buttons: Green for accept, Red for reject
- Dialog: Centered, modal overlay
- Status badges: Color-coded

---

**Ready for Copilot Agent Mode ✅**
