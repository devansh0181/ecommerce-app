# TASK 8.4: Service Management

## 🎯 Objective
Build service CRUD page for managing salon services.

## 📍 Location
Create files in: `apps/frontend/src/app/features/barber/pages/services/`

## 📋 Instructions for GitHub Copilot

**Copy this entire content and give to Copilot with:**
```
"Execute this task in agent mode. Create service management page with:
- List all salon services (table or cards)
- Create new service form (modal/dialog)
- Edit service form
- Delete service with confirmation
- Toggle service active/inactive
- Form validation
Include TypeScript, HTML, and SCSS."
```

---

## PAGE LAYOUT

```
Header
├── "Services" title
├── "Add New Service" button (primary)
└── Optional: Search/filter

Service List (Table or Cards)
├── Service name
├── Description
├── Price
├── Duration
├── Status toggle
├── Edit button
└── Delete button

Add Service Dialog
├── Name input
├── Description textarea
├── Price number input
├── Duration number input
├── Save button
└── Cancel button

Edit Service Dialog
├── Same as Add (pre-populated)
├── Save changes button
└── Delete service button

Confirmation Dialog
├── "Delete service?" message
├── "Confirm" button (danger color)
└── Cancel button
```

---

## FEATURES

✓ List all services
✓ Create new service
✓ Edit existing service
✓ Delete service (with confirmation)
✓ Toggle active/inactive
✓ Form validation
✓ Loading states
✓ Success/error messages
✓ Responsive design

---

**Ready for Copilot Agent Mode ✅**
