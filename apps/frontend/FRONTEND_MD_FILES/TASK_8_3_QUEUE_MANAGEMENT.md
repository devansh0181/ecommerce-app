# TASK 8.3: Queue Management (Barber View)

## 🎯 Objective
Build queue management page where barbers manage customer queue.

## 📍 Location
Create files in: `apps/frontend/src/app/features/barber/pages/bookings/queue-view/`

## 📋 Instructions for GitHub Copilot

**Copy this entire content and give to Copilot with:**
```
"Execute this task in agent mode. Create queue-view page with:
- Current queue display (numbered list)
- Queue summary (total, estimated time)
- Start service button per customer
- Complete service button
- Customer info with services
- Real-time updates
Include TypeScript, HTML, and SCSS."
```

---

## PAGE LAYOUT

```
Header
├── "Queue Management" title
├── Refresh button
└── Auto-refresh toggle

Summary Card
├── Total in queue
├── Estimated total time
└── Average service duration

Queue List (Numbered)
├── Item 1
│   ├── Position (#1)
│   ├── Customer avatar + name
│   ├── Services (list)
│   ├── Duration
│   ├── "Start Service" button (green)
│   ├── "Reschedule" button
│   └── "Cancel" button
│
├── Item 2, 3, ... (same structure)
└── Empty state if no queue

Current Service (Optional)
├── Now serving customer info
├── "Complete Service" button
└── Time elapsed
```

---

## COMPONENTS

### queue-view.component.ts
Main container with queue management

### queue-item.component.ts
Individual queue item with actions

### queue-summary.component.ts
Summary stats display

---

## DATA INTEGRATION

Services:
- BookingService.getSalonQueue(salonId)
- BookingService.startBooking(bookingId)
- BookingService.completeBooking(bookingId)

---

## FEATURES

✓ Real-time queue display
✓ Numbered positions
✓ Customer information
✓ Service details
✓ Start service action
✓ Complete service action
✓ Summary statistics
✓ Auto-refresh toggle
✓ Manual refresh button
✓ Reschedule option
✓ Responsive design

---

**Ready for Copilot Agent Mode ✅**
