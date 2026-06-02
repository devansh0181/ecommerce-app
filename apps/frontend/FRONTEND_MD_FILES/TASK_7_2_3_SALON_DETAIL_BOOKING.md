# TASK 7.2.3: Salon Detail & Booking Dialog

## 🎯 Objective
Build salon detail page and 4-step booking dialog.

## 📍 Location
Create files in: `apps/frontend/src/app/features/customer/pages/salons/salon-detail/`

## 📋 Instructions for GitHub Copilot

**Copy this entire content and give to Copilot with:**
```
"Execute this task in agent mode. Create salon-detail page with:
- Salon information display (name, address, phone, rating, hours)
- Services list
- Book Now button
- 4-step booking dialog:
  1. Service selection (multi-checkbox with quantity)
  2. Time picker (calendar + time)
  3. Review & confirmation
  4. Success message
Include animations and error handling for each step."
```

---

## SALON DETAIL PAGE LAYOUT

```
Hero Section
├── Banner image
├── Salon header
│   ├── Name
│   ├── Address with map icon
│   ├── Phone
│   ├── Rating stars
│   └── "Book Now" button → Opens Dialog Step 1

Salon Information
├── Description
├── Working Hours (table)
│   ├── Monday: 9:00 - 18:00
│   ├── Tuesday: 9:00 - 18:00
│   └── ...

Services Section
├── Service cards
│   ├── Name
│   ├── Description
│   ├── Price
│   └── Duration

About Section
└── Additional info
```

---

## BOOKING DIALOG - 4 STEPS

### Dialog Step 1: Service Selection
```
Title: "Select Services"
- List all available services
- Each service:
  ✓ Checkbox (select/deselect)
  - Name, description, price, duration
  - Quantity selector (1-5 spinners)
- Running total price & duration
- Next button (disabled if no services)
- Cancel button
- Back button (only if editable)
```

### Dialog Step 2: Time Selection
```
Title: "Choose Your Preferred Time"
- Calendar picker (flatpickr)
- Time picker (input or select)
- Validation:
  - Must be future date
  - Must be salon open time
- Selected time display
- Next button
- Back button (go to step 1)
- Cancel button
```

### Dialog Step 3: Review & Confirmation
```
Title: "Review Your Booking"
- Services summary
  ├── Service name
  ├── Price (from booking, not current)
  ├── Duration
  └── Quantity
- Total price
- Total duration
- Selected date/time
- "Edit Services" button → back to step 1
- "Edit Time" button → back to step 2
- "Confirm Booking" button (shows loading spinner)
- Cancel button
```

### Dialog Step 4: Success
```
Title: "Booking Confirmed!"
- Checkmark animation ✓
- "Your booking has been confirmed!"
- Booking ID (copied to clipboard with button)
- Key details:
  ├── Salon name
  ├── Date & time
  ├── Services count
  └── Total amount
- "View Booking Details" button
- "Continue Shopping" button
```

---

## KEY FEATURES

1. **Service Selection**
   - Multi-select with checkboxes
   - Quantity dropdown (1-5)
   - Real-time price/duration calculation
   - Service snapshots (save current price/duration)

2. **Time Validation**
   - Can't select past dates
   - Can't select closed days
   - Must be within salon hours
   - Show "Salon closed on Sunday" message

3. **Error Handling**
   - Network errors
   - Booking already exists for customer+salon
   - Time slot not available
   - Show error dialog with retry

4. **Animations**
   - Dialog scale in/out
   - Step transitions (fade)
   - Checkmark animation on success
   - Service card hover effects

5. **State Management**
   - Maintain form state across steps
   - Allow editing previous steps
   - Clear on cancel

---

## COMPONENTS TO CREATE

1. **salon-detail.component** - Main page
2. **salon-header.component** - Top info section
3. **service-list.component** - Services display
4. **booking-dialog.component** - Dialog container
5. **service-selector.component** - Step 1
6. **time-picker.component** - Step 2
7. **booking-summary.component** - Step 3
8. **booking-confirmation.component** - Step 4

---

## SERVICES USED

- SalonService.getSalonById(id)
- ServiceService.getServices(salonId)
- BookingService.createBooking(data)
- QueueService (future: get position)

---

## IMPORTANT NOTES

1. **Dialog styling** - Max-width 500px, centered, scrollable
2. **Progress indicator** - Show Step 1/3, 2/3, 3/3, 4/3
3. **Form validation** - Each step validates before next
4. **Loading state** - Spinner on confirm button during submission
5. **Success animation** - Checkmark appears with scale animation
6. **Responsive** - Dialog full-width on mobile, centered on desktop
7. **Close button** - Only allow close on final step or with confirmation

---

**Ready for Copilot Agent Mode ✅**
