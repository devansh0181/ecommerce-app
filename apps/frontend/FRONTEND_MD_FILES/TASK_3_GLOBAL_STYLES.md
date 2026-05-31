# TASK 3: Global Styles & Responsive Utilities

## 🎯 Objective
Create global styling files with responsive utilities and default component styles.

## 📍 Location
Create/modify files in: `apps/frontend/src/app/styles/`

## 📋 Instructions for GitHub Copilot

**Copy this entire content and give to Copilot with:**
```
"Execute this task in agent mode. Create all SCSS files for global styles, responsive utilities, 
and component defaults. Make sure all files are properly created and organized."
```

---

## 📝 FILE 1: _global.scss

**Path:** `src/app/styles/_global.scss`

```scss
// ========================================
// GLOBAL STYLES
// ========================================

@import 'variables';

// ========================================
// ROOT STYLES
// ========================================
:root {
  // Color variables for CSS
  --color-primary: #{$primary-purple};
  --color-primary-dark: #{$primary-purple-dark};
  --color-success: #{$success-green};
  --color-danger: #{$danger-red};
  --color-warning: #{$warning-yellow};
  --color-info: #{$info-blue};
  --color-text: #{$color-text};
  --color-text-secondary: #{$color-text-secondary};
  --color-border: #{$color-border};
}

// ========================================
// RESET
// ========================================
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  scroll-behavior: smooth;
}

// ========================================
// BODY DEFAULTS
// ========================================
body {
  font-family: $font-family-base;
  font-size: $font-size-base;
  line-height: $line-height-base;
  color: $color-text;
  background-color: $bg-secondary;
  font-weight: $font-weight-regular;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

// ========================================
// IMAGES
// ========================================
img {
  max-width: 100%;
  height: auto;
  display: block;
}

// ========================================
// BUTTONS
// ========================================
button {
  font-family: inherit;
  cursor: pointer;
}

// ========================================
// LINKS
// ========================================
a {
  color: inherit;
  text-decoration: none;
}

// ========================================
// LISTS
// ========================================
ul, ol {
  list-style: none;
}

// ========================================
// TABLE
// ========================================
table {
  border-collapse: collapse;
  border-spacing: 0;
  width: 100%;
}

// ========================================
// FORM ELEMENTS
// ========================================
input, textarea, select {
  font-family: inherit;
  font-size: inherit;
}

input[type="checkbox"],
input[type="radio"] {
  margin: 0 $spacing-sm 0 0;
}

// ========================================
// SCROLLBAR
// ========================================
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: $bg-tertiary;
}

::-webkit-scrollbar-thumb {
  background: $color-border;
  border-radius: $border-radius-md;

  &:hover {
    background: $color-text-secondary;
  }
}

// Firefox
* {
  scrollbar-color: $color-border $bg-tertiary;
  scrollbar-width: thin;
}

// ========================================
// SELECTION
// ========================================
::selection {
  background: $primary-purple;
  color: #fff;
}

::-moz-selection {
  background: $primary-purple;
  color: #fff;
}

// ========================================
// FOCUS VISIBLE
// ========================================
:focus-visible {
  outline: 2px solid $primary-purple;
  outline-offset: 2px;
}

// ========================================
// PLACEHOLDER
// ========================================
::placeholder {
  color: $color-text-muted;
  opacity: 1;
}

::-webkit-input-placeholder {
  color: $color-text-muted;
  opacity: 1;
}

// ========================================
// PRINT STYLES
// ========================================
@media print {
  * {
    background: transparent !important;
    color: #000 !important;
    box-shadow: none !important;
    text-shadow: none !important;
  }

  a,
  a:visited {
    text-decoration: underline;
  }

  img {
    max-width: 100% !important;
  }

  @page {
    margin: 0.5cm;
  }
}

// ========================================
// UTILITY CLASSES
// ========================================

// Display
.d-none {
  display: none;
}

.d-block {
  display: block;
}

.d-inline {
  display: inline;
}

.d-inline-block {
  display: inline-block;
}

.d-flex {
  display: flex;
}

.d-grid {
  display: grid;
}

// Visibility
.visible {
  visibility: visible;
}

.hidden {
  visibility: hidden;
}

.invisible {
  visibility: hidden;
}

// Overflow
.overflow-auto {
  overflow: auto;
}

.overflow-hidden {
  overflow: hidden;
}

.overflow-visible {
  overflow: visible;
}

.overflow-x-auto {
  overflow-x: auto;
  overflow-y: hidden;
}

.overflow-y-auto {
  overflow-y: auto;
  overflow-x: hidden;
}

// Position
.position-static {
  position: static;
}

.position-relative {
  position: relative;
}

.position-absolute {
  position: absolute;
}

.position-fixed {
  position: fixed;
}

.position-sticky {
  position: sticky;
}

// Cursor
.cursor-auto {
  cursor: auto;
}

.cursor-pointer {
  cursor: pointer;
}

.cursor-not-allowed {
  cursor: not-allowed;
}

.cursor-default {
  cursor: default;
}

// Opacity
.opacity-0 {
  opacity: 0;
}

.opacity-50 {
  opacity: 0.5;
}

.opacity-100 {
  opacity: 1;
}

// Transform
.transform-none {
  transform: none;
}

// User Select
.user-select-none {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.user-select-auto {
  user-select: auto;
  -webkit-user-select: auto;
  -moz-user-select: auto;
  -ms-user-select: auto;
}

// Pointer Events
.pointer-events-none {
  pointer-events: none;
}

.pointer-events-auto {
  pointer-events: auto;
}
```

---

## 📝 FILE 2: _responsive.scss

**Path:** `src/app/styles/_responsive.scss`

```scss
// ========================================
// RESPONSIVE UTILITIES
// ========================================

@import 'variables';

// ========================================
// DISPLAY RESPONSIVE
// ========================================

// Hide on mobile, show on tablet+
.hidden-xs {
  display: none;

  @include md {
    display: block;
  }
}

// Show on mobile, hide on tablet+
.hidden-md-up {
  @include md {
    display: none;
  }
}

// ========================================
// FLEX RESPONSIVE
// ========================================
.flex-col {
  display: flex;
  flex-direction: column;

  @include md {
    flex-direction: row;
  }
}

.flex-col-reverse {
  display: flex;
  flex-direction: column-reverse;

  @include md {
    flex-direction: row-reverse;
  }
}

// ========================================
// GRID RESPONSIVE
// ========================================
.grid-1 {
  @include grid-cols(1);

  @include sm {
    @include grid-cols(2);
  }

  @include lg {
    @include grid-cols(3);
  }
}

.grid-auto {
  @include grid-auto(auto-fit, 280px);
}

// ========================================
// PADDING RESPONSIVE
// ========================================
.p-responsive {
  padding: $spacing-md;

  @include md {
    padding: $spacing-lg;
  }

  @include lg {
    padding: $spacing-xl;
  }
}

// ========================================
// MARGIN RESPONSIVE
// ========================================
.m-responsive {
  margin: $spacing-md;

  @include md {
    margin: $spacing-lg;
  }

  @include lg {
    margin: $spacing-xl;
  }
}

// ========================================
// FONT SIZE RESPONSIVE
// ========================================
.text-responsive-lg {
  font-size: $font-size-2xl;
  line-height: $line-height-2xl;

  @include lg {
    font-size: $font-size-3xl;
    line-height: $line-height-3xl;
  }
}

.text-responsive-xl {
  font-size: $font-size-3xl;
  line-height: $line-height-3xl;

  @include lg {
    font-size: $font-size-4xl;
    line-height: $line-height-3xl;
  }
}

// ========================================
// WIDTH RESPONSIVE
// ========================================
.w-full {
  width: 100%;
}

.w-auto {
  width: auto;
}

.w-screen {
  width: 100vw;
}

.max-w-sm {
  max-width: 540px;
}

.max-w-md {
  max-width: 720px;
}

.max-w-lg {
  max-width: 960px;
}

.max-w-xl {
  max-width: 1140px;
}

.max-w-2xl {
  max-width: 1320px;
}

.mx-auto {
  margin-left: auto;
  margin-right: auto;
}

// ========================================
// CONTAINER
// ========================================
.container {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding-left: $spacing-lg;
  padding-right: $spacing-lg;

  @include sm {
    max-width: $container-sm;
  }

  @include md {
    max-width: $container-md;
    padding-left: $spacing-xl;
    padding-right: $spacing-xl;
  }

  @include lg {
    max-width: $container-lg;
  }

  @include xl {
    max-width: $container-xl;
  }

  @include 2xl {
    max-width: $container-2xl;
  }
}

// ========================================
// ASPECT RATIO
// ========================================
.aspect-square {
  aspect-ratio: 1 / 1;
}

.aspect-video {
  aspect-ratio: 16 / 9;
}

// ========================================
// TOUCH FRIENDLY RESPONSIVE
// ========================================
@media (hover: none) and (pointer: coarse) {
  // Mobile-specific styles
  button, a {
    min-height: 48px;
    min-width: 48px;
  }

  input, textarea, select {
    min-height: 48px;
    font-size: 16px; // Prevents zoom on iOS
  }
}

// ========================================
// DARK MODE (if needed later)
// ========================================
@media (prefers-color-scheme: dark) {
  // Dark mode styles can be added here
  // body {
  //   background-color: darken($bg-dark, 5%);
  //   color: lighten($color-text, 30%);
  // }
}

// ========================================
// LANDSCAPE ORIENTATION
// ========================================
@media (orientation: landscape) and (max-height: 500px) {
  // Adjust for landscape small screens
  .hidden-landscape {
    display: none;
  }
}

// ========================================
// PRINT MEDIA
// ========================================
@media print {
  .no-print {
    display: none !important;
  }
}
```

---

## 📝 FILE 3: components/_buttons.scss

**Path:** `src/app/styles/components/_buttons.scss`

```scss
// ========================================
// BUTTON STYLES
// ========================================

@import '../variables';
@import '../mixins';

// ========================================
// BASE BUTTON
// ========================================
button,
.btn {
  @include button-base;
  gap: $spacing-sm;
  padding: $spacing-md $spacing-lg;
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;

  // Icon + Text
  svg, i {
    width: 20px;
    height: 20px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

// ========================================
// BUTTON VARIANTS
// ========================================

// Primary Button
.btn-primary {
  @include button-primary;

  &.loading {
    position: relative;
    color: transparent;

    &::after {
      content: '';
      position: absolute;
      width: 16px;
      height: 16px;
      top: 50%;
      left: 50%;
      margin-left: -8px;
      margin-top: -8px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: #fff;
      animation: spin 0.8s linear infinite;
    }
  }
}

// Secondary Button
.btn-secondary {
  @include button-secondary;
}

// Danger Button
.btn-danger {
  @include button-danger;
}

// Success Button
.btn-success {
  @include button-base;
  background: $success-gradient;
  color: #fff;
  padding: $spacing-md $spacing-lg;

  &:hover {
    opacity: 0.9;
  }
}

// Ghost Button
.btn-ghost {
  @include button-base;
  background: transparent;
  color: $primary-purple;
  border: 1px solid $primary-purple;
  padding: $spacing-md $spacing-lg;

  &:hover {
    background: rgba($primary-purple, 0.1);
  }
}

// ========================================
// BUTTON SIZES
// ========================================

// Small Button
.btn-sm {
  padding: $spacing-sm $spacing-md;
  font-size: $font-size-sm;

  svg, i {
    width: 16px;
    height: 16px;
  }
}

// Large Button
.btn-lg {
  padding: $spacing-lg $spacing-2xl;
  font-size: $font-size-lg;

  svg, i {
    width: 24px;
    height: 24px;
  }
}

// Full Width
.btn-full {
  width: 100%;
}

// ========================================
// BUTTON STATES
// ========================================

.btn:active {
  transform: scale(0.98);
}

.btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba($primary-purple, 0.1);
}

// ========================================
// ICON BUTTON
// ========================================
.btn-icon {
  @include button-base;
  width: 40px;
  height: 40px;
  padding: 0;
  border-radius: 50%;

  svg, i {
    width: 24px;
    height: 24px;
  }

  &:hover {
    background: $bg-tertiary;
  }
}

.btn-icon-sm {
  width: 32px;
  height: 32px;

  svg, i {
    width: 18px;
    height: 18px;
  }
}
```

---

## 📝 FILE 4: components/_cards.scss

**Path:** `src/app/styles/components/_cards.scss`

```scss
// ========================================
// CARD STYLES
// ========================================

@import '../variables';
@import '../mixins';

// ========================================
// BASE CARD
// ========================================
.card {
  @include card;
  background: $bg-primary;
  border-radius: $border-radius-lg;

  &.card-clickable {
    cursor: pointer;

    &:active {
      transform: scale(0.98);
    }
  }
}

// ========================================
// CARD COMPONENTS
// ========================================

.card-header {
  padding: $spacing-lg;
  border-bottom: 1px solid $color-border;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-body {
  padding: $spacing-lg;
}

.card-footer {
  padding: $spacing-lg;
  border-top: 1px solid $color-border;
  display: flex;
  gap: $spacing-md;
  justify-content: flex-end;
}

// ========================================
// CARD VARIANTS
// ========================================

// Highlighted Card
.card-highlight {
  @include card;
  border: 1px solid $primary-purple;
  background: linear-gradient(135deg, rgba($primary-purple, 0.05), rgba($primary-purple-dark, 0.02));
}

// Bordered Card
.card-bordered {
  @include card;
  border: 2px solid $primary-purple;
}

// Flat Card (no shadow)
.card-flat {
  background: $bg-primary;
  border-radius: $border-radius-lg;
  border: 1px solid $color-border;
  padding: $spacing-lg;
}

// ========================================
// IMAGE CARD
// ========================================
.card-image {
  overflow: hidden;
  border-radius: $border-radius-lg;

  img {
    width: 100%;
    height: 200px;
    object-fit: cover;
    display: block;
  }
}

// ========================================
// GRADIENT CARD
// ========================================
.card-gradient {
  @include card;
  background: $primary-gradient;
  color: #fff;

  &:hover {
    border-color: $primary-purple-dark;
  }
}
```

---

## 📝 FILE 5: components/_forms.scss

**Path:** `src/app/styles/components/_forms.scss`

```scss
// ========================================
// FORM STYLES
// ========================================

@import '../variables';
@import '../mixins';

// ========================================
// FORM GROUP
// ========================================
.form-group {
  margin-bottom: $spacing-lg;

  &:last-child {
    margin-bottom: 0;
  }
}

// ========================================
// FORM LABEL
// ========================================
label {
  display: block;
  margin-bottom: $spacing-sm;
  font-weight: $font-weight-medium;
  color: $color-text;
  font-size: $font-size-sm;
}

.label-required::after {
  content: ' *';
  color: $danger-red;
}

// ========================================
// INPUT FIELD
// ========================================
input[type="text"],
input[type="email"],
input[type="password"],
input[type="number"],
input[type="tel"],
input[type="url"],
input[type="date"],
input[type="time"],
textarea,
select {
  @include input-base;
}

// ========================================
// TEXTAREA
// ========================================
textarea {
  resize: vertical;
  min-height: 120px;
  font-family: $font-family-base;
}

// ========================================
// SELECT
// ========================================
select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='#{$color-text}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right $spacing-md center;
  background-size: 20px;
  padding-right: $spacing-2xl;
}

// ========================================
// CHECKBOX & RADIO
// ========================================
input[type="checkbox"],
input[type="radio"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: $primary-purple;
}

.checkbox-group,
.radio-group {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.checkbox-item,
.radio-item {
  display: flex;
  align-items: center;
  gap: $spacing-md;

  input {
    margin: 0;
  }

  label {
    margin: 0;
  }
}

// ========================================
// INPUT STATES
// ========================================
.form-error {
  border-color: $danger-red !important;
  box-shadow: 0 0 0 3px rgba($danger-red, 0.1) !important;
}

.form-success {
  border-color: $success-green !important;
  box-shadow: 0 0 0 3px rgba($success-green, 0.1) !important;
}

// ========================================
// HELP TEXT
// ========================================
.form-text {
  display: block;
  margin-top: $spacing-sm;
  font-size: $font-size-sm;
  color: $color-text-muted;
}

.form-error-text {
  color: $danger-red;
}

.form-success-text {
  color: $success-green;
}

// ========================================
// FORM LAYOUT
// ========================================
.form-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: $spacing-lg;

  @include md {
    grid-template-columns: 1fr 1fr;
  }
}

.form-row-3 {
  @include grid-cols(1);

  @include md {
    @include grid-cols(3);
  }
}
```

---

## 📝 FILE 6: components/_modals.scss

**Path:** `src/app/styles/components/_modals.scss`

```scss
// ========================================
// MODAL / DIALOG STYLES
// ========================================

@import '../variables';
@import '../mixins';

// ========================================
// MODAL BACKDROP
// ========================================
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: $z-modal-backdrop;
  animation: fadeIn $transition-base;

  &.closing {
    animation: fadeOut $transition-base;
  }
}

// ========================================
// MODAL DIALOG
// ========================================
.modal-dialog {
  @include card;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  z-index: $z-modal;
  animation: scaleIn $transition-base;
  border-radius: $border-radius-xl;

  &.closing {
    animation: scaleOut $transition-base;
  }

  @include md {
    width: 100%;
  }
}

// Sizes
.modal-sm {
  max-width: 300px;
}

.modal-md {
  max-width: 500px;
}

.modal-lg {
  max-width: 800px;
}

.modal-xl {
  max-width: 1000px;
}

// ========================================
// MODAL HEADER
// ========================================
.modal-header {
  padding: $spacing-xl;
  border-bottom: 1px solid $color-border;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-lg;

  h1, h2, h3 {
    margin: 0;
  }
}

.modal-close {
  @include button-reset;
  width: 32px;
  height: 32px;
  @include flex-center;
  border-radius: $border-radius-md;
  transition: all $transition-fast;

  &:hover {
    background: $bg-tertiary;
  }
}

// ========================================
// MODAL BODY
// ========================================
.modal-body {
  padding: $spacing-xl;
}

// ========================================
// MODAL FOOTER
// ========================================
.modal-footer {
  padding: $spacing-xl;
  border-top: 1px solid $color-border;
  display: flex;
  gap: $spacing-md;
  justify-content: flex-end;

  button {
    margin: 0;
  }
}

// ========================================
// TOAST / NOTIFICATION
// ========================================
.toast-container {
  position: fixed;
  top: $spacing-lg;
  right: $spacing-lg;
  z-index: $z-tooltip;
  display: flex;
  flex-direction: column;
  gap: $spacing-md;

  @include md {
    width: 100%;
    right: 0;
    top: 0;
    border-radius: 0;
  }
}

.toast {
  @include card;
  padding: $spacing-lg;
  border-radius: $border-radius-lg;
  display: flex;
  align-items: flex-start;
  gap: $spacing-md;
  min-width: 300px;
  animation: slideInRight $transition-base;

  &.closing {
    animation: slideOutDown $transition-base;
  }

  @include md {
    min-width: 100%;
  }
}

// Toast variants
.toast-success {
  background: lighten($success-green, 30%);
  border-left: 4px solid $success-green;
  color: darken($success-green, 10%);
}

.toast-error {
  background: lighten($danger-red, 30%);
  border-left: 4px solid $danger-red;
  color: $danger-red;
}

.toast-warning {
  background: $warning-bg;
  border-left: 4px solid $warning-yellow;
  color: darken($warning-yellow, 20%);
}

.toast-info {
  background: lighten($info-blue, 30%);
  border-left: 4px solid $info-blue;
  color: darken($info-blue, 10%);
}

.toast-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
}

.toast-content {
  flex: 1;

  .toast-title {
    font-weight: $font-weight-semibold;
    margin-bottom: $spacing-xs;
  }

  .toast-message {
    font-size: $font-size-sm;
  }
}

.toast-close {
  @include button-reset;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
}
```

---

## 📝 FILE 7: Update main styles.scss

**Path:** `src/app/styles/styles.scss`

```scss
// ========================================
// MAIN STYLESHEET
// ========================================

// Variables & Mixins
@import 'variables';
@import 'typography';
@import 'spacing';
@import 'mixins';
@import 'animations';

// Global Styles
@import 'global';
@import 'responsive';

// Component Styles
@import 'components/buttons';
@import 'components/cards';
@import 'components/forms';
@import 'components/modals';
@import 'components/navigation';
@import 'components/alerts';
```

---

## 🚨 Important

Create empty placeholder files for these (they get populated in later tasks):
- `components/_navigation.scss` - Empty for now
- `components/_alerts.scss` - Empty for now

Just create them with a comment:
```scss
// Navigation styles - Will be added in component task
```

---

## ✅ Verification Checklist

- [ ] `_global.scss` created
- [ ] `_responsive.scss` created
- [ ] `components/_buttons.scss` created
- [ ] `components/_cards.scss` created
- [ ] `components/_forms.scss` created
- [ ] `components/_modals.scss` created
- [ ] `components/_navigation.scss` created (placeholder)
- [ ] `components/_alerts.scss` created (placeholder)
- [ ] `styles.scss` updated to import all files
- [ ] No SCSS compilation errors

---

## 🎯 Next Step

After this task completes:
1. Run `ng serve` to verify styles load
2. Proceed to **TASK_4_CORE_SERVICES.md**

---

**Status: Ready for Copilot Agent Mode ✅**
