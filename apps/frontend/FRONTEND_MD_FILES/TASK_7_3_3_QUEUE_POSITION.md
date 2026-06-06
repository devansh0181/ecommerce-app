# TASK 7.3.3: Queue Position Display & Live Updates

## 🎯 Objective
Build real-time queue position display with auto-refresh and live updates.

## 📍 Location
Create files in: `apps/frontend/src/app/features/customer/components/queue-position-card/`

## 📋 Instructions for GitHub Copilot

**Copy this entire content and give to Copilot with:**
```
"Execute this task in agent mode. Create queue-position-card component with:
- Display position number (large)
- Show estimated wait time
- Count of customers ahead
- Live refresh functionality
- Auto-refresh timer (every 30s with toggle)
- Last updated timestamp
- Success animation on completion
- Loading state
Include TypeScript, HTML, and SCSS."
```

---

## COMPONENT STRUCTURE

### queue-position-card.component.ts
```
Inputs:
- bookingId (string)
- autoRefreshInterval? (number, default 30000ms)

Features:
- Load queue position on init
- Auto-refresh with configurable interval
- Manual refresh button
- Show last updated time
- Animation on position change
- Completion detection (position 0 = completed)
```

### queue-position-card.component.html
```
Layout:
- Header "Queue Position"
- Large position number
- Position text ("You are #3 in queue" or "You're next!")
- Estimated wait time
- Customers ahead count
- Last updated time
- Refresh button
- Auto-refresh toggle
```

---

## DISPLAY LOGIC

```
Position = 0 → "Waiting for barber to start!"
Position = 1 → "You're next! ✨"
Position > 1 → "You are #X in queue"

WaitTime Calculation:
- QueueService.calculateWaitTime(position)
- Format: "X minutes" or "Xh Ym"

Status Messages:
- "Last updated 2 seconds ago"
- "Last updated 1 minute ago"
- "Last updated 5 minutes ago"
```

---

## AUTO-REFRESH LOGIC

```
1. Start timer on component init
2. Every 30 seconds:
   - Call QueueService.getQueuePosition(bookingId)
   - Update display
   - Update "Last updated" time
3. User can manually refresh anytime
4. User can toggle auto-refresh on/off
5. Stop timer on component destroy
6. Detect completion (wait time = 0 or position = 0)
   - Show success animation
   - Optional: toast notification
```

---

## ANIMATIONS

```
Position Change:
- Number scales up (1.2x)
- Bounce animation
- 300ms duration

Completion:
- Checkmark animation ✓
- Success color (green)
- Pulse effect

Refresh:
- Spinner on button
- Fade transition for new data
```

---

## STYLING NOTES

- Large position number: 64px or larger
- Gradient background (purple → blue)
- Cards with shadow and rounded corners
- Color coding: Green if next, Blue if waiting
- Responsive: Full width on mobile, contained on desktop
- Status text: Centered, with supporting info below

---

## COMPONENT USAGE

```typescript
// In booking-detail.component.html:
<app-queue-position-card 
  [bookingId]="booking.id"
  [autoRefreshInterval]="30000">
</app-queue-position-card>
```

---

## KEY FEATURES

✓ Real-time queue position
✓ Estimated wait time calculation
✓ Auto-refresh with toggle
✓ Manual refresh button
✓ Last updated timestamp (relative)
✓ Completion detection
✓ Success animations
✓ Loading states
✓ Error handling
✓ Responsive design

---

## IMPORTANT NOTES

1. Use interval with takeUntil for cleanup
2. Calculate wait time using average duration (30min default)
3. Show "Last updated X ago" with relativeTime pipe (ngx-translate or custom)
4. Disable auto-refresh if auto-closed by user
5. Stop polling on component destroy
6. Handle API errors gracefully
7. Show spinner during refresh
8. Animate position changes
9. Detect completion (position = 0 or done)

---

## DATA STRUCTURE (QueuePosition)

```typescript
{
  bookingId: string;
  position: number;
  estimatedWaitTimeMinutes: number;
  bookingsAhead: number;
  status: string;
  message: string;
}
```

---

**Ready for Copilot Agent Mode ✅**
