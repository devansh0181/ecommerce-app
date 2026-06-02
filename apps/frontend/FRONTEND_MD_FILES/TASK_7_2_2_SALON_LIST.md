# TASK 7.2.2: Salon List Page (Browse & Discover Salons)

## 🎯 Objective
Build salon browsing page with search, filters, and professional salon cards.

## 📍 Location
Create files in: `apps/frontend/src/app/features/customer/pages/salons/salon-list/`

## 📋 Instructions for GitHub Copilot

**Copy this entire content and give to Copilot with:**
```
"Execute this task in agent mode. Create the salon-list page with:
- Search input (name/address)
- Filter panel (open status, rating, distance)
- Salon grid with responsive layout
- Salon card component with ratings and status
- Loading skeletons
- Pagination / Load more button
- Empty state
Include HTML, TypeScript, and SCSS."
```

---

## KEY COMPONENTS TO BUILD

### 1. salon-list.component.ts
Main component with service integration, search, filter logic

### 2. salon-card.component.ts
Reusable card showing salon info, rating, status, hours preview

### 3. salon-list.component.html
Search bar + filter panel + grid of salon cards

### 4. Styling (SCSS)
Grid layout, card hover effects, responsive design

---

## FEATURES

**Search:**
- Text input for name/address search
- Real-time search (debounced)
- Clear button

**Filters:**
- Toggle: Show only open salons
- Dropdown: Minimum rating (4+, 3.5+, all)
- Slider: Distance (if geolocation available)
- Active filter badges

**Salon Card:**
- Image placeholder
- Salon name + address
- Star rating display
- Status badge (Open/Closed with color)
- Price range (future: $-$$$$)
- Click to navigate to detail

**Layout:**
- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 3 columns
- Smooth hover animations

**Loading & Empty States:**
- Skeleton loaders while fetching
- Empty state message when no results
- Error message on API failure
- Retry button

---

## DATA INTEGRATION

**Services Used:**
- SalonService.getSalons(params)
- SalonService.setSelectedSalon(salon)

**Params:**
- search (name/address)
- isOpen (boolean)
- minRating (number)
- page, limit (pagination)

---

## COMPONENT STRUCTURE

```
salon-list.component
├── search-input
├── filter-panel
│   ├── open-status-toggle
│   ├── rating-filter-select
│   └── distance-filter-slider
├── active-filters-display
├── salon-grid
│   ├── salon-card (repeating)
│   │   ├── image
│   │   ├── info
│   │   ├── rating
│   │   └── badge
│   ├── loading-skeleton (while loading)
│   └── empty-state (if no results)
└── pagination / load-more-button
```

---

## STYLING NOTES

- Grid uses CSS Grid (auto-fit, minmax 280px)
- Cards have hover lift effect (+4px transform)
- Status badges: green=open, red=closed
- Filter panel collapses on mobile
- Smooth animations on filter change

---

## IMPORTANT

1. **Debounce search** - Use debounceTime(300) to avoid too many API calls
2. **State management** - Use BehaviorSubject for salons list
3. **Responsive** - Test on mobile, tablet, desktop
4. **Error handling** - Show error message if API fails
5. **Loading states** - Show skeletons while fetching
6. **Accessibility** - Proper labels, ARIA attributes
7. **Performance** - Track by function in *ngFor

---

## TIPS FOR COPILOT

- Create loading skeleton component
- Use RxJS operators: debounceTime, switchMap, tap
- Implement proper error handling
- Add rating stars component (or use emoji)
- Make filters work together (AND condition)
- Add "clear filters" button

---

**Ready for Copilot Agent Mode ✅**
