# TASK 7.3.2: Booking Detail Page

## 🎯 Objective
Build comprehensive booking detail page with timeline and queue position.

## 📍 Location
Create files in: `apps/frontend/src/app/features/customer/pages/bookings/booking-detail/`

## 📋 Instructions for GitHub Copilot

**Copy this entire content and give to Copilot with:**
```
"Execute this task in agent mode. Create booking-detail page with:
- Full booking information display
- Services list with prices
- Salon details and contact
- Status timeline (visual steps)
- Queue position card (if ACCEPTED)
- Cancel booking button (if PENDING)
- Loading states and error handling
Include TypeScript, HTML, and SCSS."
```

---

## PAGE LAYOUT

```
Header
├── Back button
├── Booking ID
└── Status badge

Salon Section
├── Salon name (clickable → detail)
├── Address
├── Phone number
└── Map link (future)

Services Section
├── Service 1: Name, Price, Duration
├── Service 2: Name, Price, Duration
├── ...
└── Totals: Total Price, Total Duration

Status Timeline
├── Created ✓ (date/time)
├── Accepted ✓ (date/time) or ⏳ Pending
├── In Progress ✓ or ⏳ Waiting
└── Completed ✓ or ⏳ Waiting

Queue Position (if ACCEPTED)
├── Large position display
├── Estimated wait time
├── Refresh button
└── Auto-refresh toggle

Actions
├── Cancel button (if PENDING)
└── Additional actions (future)
```

---

## COMPONENTS TO CREATE

### booking-detail.component.ts
Main container component with state management

### Services Section
- List all services booked
- Show price snapshot
- Show duration snapshot
- Calculate and display totals

### Status Timeline Component
- Visual representation of booking lifecycle
- Current step highlighted
- All steps with timestamps
- Completed steps show checkmark

### Queue Position Card (Sub-component)
- Loads QueueService.getQueuePosition(bookingId)
- Polls every 30 seconds
- Shows position, wait time, customers ahead
- Refresh button for manual update
- Shows "Last updated X seconds ago"

---

## DATA INTEGRATION

Services:
- BookingService.getBookingById(id)
- BookingService.cancelBooking(id) [if adding cancel]
- QueueService.getQueuePosition(id) [if ACCEPTED]

---

## KEY FEATURES

✓ Display all booking details
✓ Show services with snapshots
✓ Visual status timeline
✓ Real-time queue position (if applicable)
✓ Auto-refresh every 30 seconds
✓ Manual refresh button
✓ Cancel booking option (pending only)
✓ Error handling
✓ Loading states

---

## STYLING NOTES

- Card-based sections with spacing
- Timeline: Vertical line with numbered steps
- Queue position: Large prominent card, gradient background
- Status colors: PENDING=yellow, ACCEPTED=blue, IN_PROGRESS=purple, COMPLETED=green
- Responsive: Stack on mobile, side-by-side on desktop

---

## TIMELINE COMPONENT

```
Visual:
○ → — → ○ → — → ○ → — → ○
1         2         3         4

States:
✓ Completed (filled, checkmark)
⏳ Current (highlighted, pulse animation)
○ Pending (empty circle)
```

---

## QUEUE POSITION DISPLAY

```
Large Card with:
- Position number (huge, gradient text)
- "You are #3 in queue"
- "Estimated wait: 90 minutes"
- "2 customers ahead of you"
- Refresh button
- "Last updated 30s ago"
- Auto-refresh toggle
```

---

## IMPORTANT NOTES

1. Load booking data on component init
2. If ACCEPTED, load queue position
3. Auto-poll queue position every 30s (with toggle)
4. Show loading while fetching
5. Handle errors gracefully
6. Format prices with pipe
7. Format duration with pipe
8. Responsive design (mobile-first)
9. Accessibility: proper headers, labels

---

**Ready for Copilot Agent Mode ✅**
