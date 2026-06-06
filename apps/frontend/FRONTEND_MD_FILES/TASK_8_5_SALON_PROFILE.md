# TASK 8.5: Salon Profile & Settings

## 🎯 Objective
Build salon profile page for managing salon information and working hours.

## 📍 Location
Create files in: `apps/frontend/src/app/features/barber/pages/salon-profile/`

## 📋 Instructions for GitHub Copilot

**Copy this entire content and give to Copilot with:**
```
"Execute this task in agent mode. Create salon-profile page with:
- Edit salon information (name, description, address, phone)
- Manage working hours (7 days table)
- Open/close time selectors
- Closed day checkbox
- Save changes button
- Loading states and validation
Include TypeScript, HTML, and SCSS."
```

---

## PAGE LAYOUT

```
Header
├── "Salon Profile" title
└── Save button

Salon Information Section
├── Name (editable input)
├── Description (editable textarea)
├── Address (editable input)
├── Phone (editable input)
└── Save changes button

Working Hours Section
├── Table with 7 rows (Mon-Sun)
│   ├── Day name
│   ├── Open time (time input)
│   ├── Close time (time input)
│   ├── Closed checkbox
│   └── Status display
└── Save changes button

Status Section
├── Current status (Open/Closed)
├── Last updated time
├── Manual status toggle
└── Auto open/close info
```

---

## COMPONENTS

### salon-profile.component.ts
Main container

### salon-info-section.component.ts
Editable salon information

### working-hours-section.component.ts
Working hours management

---

## DATA INTEGRATION

Services:
- SalonService.getSalonById(salonId)
- SalonService.updateSalon(salonId, data)
- SalonService.getWorkingHours(salonId)
- SalonService.updateWorkingHours(salonId, hours)

---

## FEATURES

✓ Edit salon information
✓ Manage working hours
✓ Time pickers for hours
✓ Closed day toggle
✓ Form validation
✓ Save confirmation
✓ Error handling
✓ Loading states
✓ Status display

---

**Ready for Copilot Agent Mode ✅**
