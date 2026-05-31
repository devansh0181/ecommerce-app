# TASK 2: SCSS Design System & Variables

## 🎯 Objective
Create complete SCSS design system with colors, typography, spacing, and mixins.

## 📍 Location
Create files in: `apps/frontend/src/app/styles/`

## 📋 Instructions for GitHub Copilot

**Copy this entire content and give to Copilot with:**
```
"Execute this task in agent mode. Create all SCSS files with variables and mixins exactly as specified below. 
Use these exact file names and locations. Make sure all variables are properly defined."
```

---

## 📝 FILE 1: _variables.scss

**Path:** `src/app/styles/_variables.scss`

```scss
// ========================================
// QUEUECUT DESIGN SYSTEM - VARIABLES
// ========================================

// ========================================
// PRIMARY COLORS
// ========================================
$primary-purple: #667eea;
$primary-purple-dark: #764ba2;
$primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

// ========================================
// SEMANTIC COLORS
// ========================================
$success-green: #28a745;
$success-gradient: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);

$warning-yellow: #ffc107;
$warning-bg: #fff3cd;

$danger-red: #eb5757;
$danger-orange: #f09f4f;
$danger-gradient: linear-gradient(135deg, #eb5757 0%, #f09f4f 100%);

$info-blue: #17a2b8;
$info-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

// ========================================
// NEUTRAL COLORS
// ========================================
$color-dark: #2c3e50;
$color-light: #ecf0f1;
$color-lighter: #f8f9fa;
$color-border: #ddd;
$color-text: #333;
$color-text-secondary: #666;
$color-text-muted: #999;

// ========================================
// BACKGROUND COLORS
// ========================================
$bg-primary: #ffffff;
$bg-secondary: #f8f9fa;
$bg-tertiary: #ecf0f1;
$bg-dark: #2c3e50;

// ========================================
// TYPOGRAPHY
// ========================================

// Font Family
$font-family-base: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
$font-family-mono: 'Monaco', 'Courier New', monospace;

// Font Weights
$font-weight-light: 300;
$font-weight-regular: 400;
$font-weight-medium: 500;
$font-weight-semibold: 600;
$font-weight-bold: 700;
$font-weight-extrabold: 800;

// Font Sizes
$font-size-xs: 12px;
$font-size-sm: 14px;
$font-size-base: 16px;
$font-size-lg: 18px;
$font-size-xl: 20px;
$font-size-2xl: 24px;
$font-size-3xl: 28px;
$font-size-4xl: 32px;

// Line Heights
$line-height-xs: 16px;
$line-height-sm: 20px;
$line-height-base: 24px;
$line-height-lg: 28px;
$line-height-xl: 32px;
$line-height-2xl: 36px;
$line-height-3xl: 40px;

// Headings
$h1-size: $font-size-4xl;
$h1-height: $line-height-3xl;
$h1-weight: $font-weight-bold;

$h2-size: $font-size-3xl;
$h2-height: $line-height-2xl;
$h2-weight: $font-weight-semibold;

$h3-size: $font-size-2xl;
$h3-height: $line-height-xl;
$h3-weight: $font-weight-semibold;

$h4-size: $font-size-xl;
$h4-height: $line-height-lg;
$h4-weight: $font-weight-medium;

// ========================================
// SPACING (8px grid system)
// ========================================
$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 12px;
$spacing-lg: 16px;
$spacing-xl: 24px;
$spacing-2xl: 32px;
$spacing-3xl: 48px;
$spacing-4xl: 64px;

// ========================================
// BORDER RADIUS
// ========================================
$border-radius-sm: 4px;
$border-radius-md: 6px;
$border-radius-lg: 8px;
$border-radius-xl: 12px;
$border-radius-2xl: 16px;
$border-radius-full: 50%;

// ========================================
// SHADOWS
// ========================================
$shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
$shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
$shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.15);
$shadow-xl: 0 20px 50px rgba(0, 0, 0, 0.2);

// ========================================
// TRANSITIONS
// ========================================
$transition-fast: 150ms ease-in-out;
$transition-base: 300ms ease-in-out;
$transition-slow: 500ms ease-in-out;

// ========================================
// Z-INDEX
// ========================================
$z-dropdown: 100;
$z-sticky: 200;
$z-fixed: 300;
$z-modal-backdrop: 400;
$z-modal: 500;
$z-tooltip: 600;

// ========================================
// BREAKPOINTS
// ========================================
$breakpoint-xs: 320px;
$breakpoint-sm: 480px;
$breakpoint-md: 768px;
$breakpoint-lg: 1024px;
$breakpoint-xl: 1280px;
$breakpoint-2xl: 1440px;

// ========================================
// CONTAINER WIDTHS
// ========================================
$container-xs: 100%;
$container-sm: 540px;
$container-md: 720px;
$container-lg: 960px;
$container-xl: 1140px;
$container-2xl: 1320px;
```

---

## 📝 FILE 2: _typography.scss

**Path:** `src/app/styles/_typography.scss`

```scss
// ========================================
// TYPOGRAPHY STYLES
// ========================================

@import 'variables';

// ========================================
// FONT FAMILY
// ========================================
html, body {
  font-family: $font-family-base;
  font-size: $font-size-base;
  line-height: $line-height-base;
  color: $color-text;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

// ========================================
// HEADINGS
// ========================================
h1, .h1 {
  font-size: $h1-size;
  line-height: $h1-height;
  font-weight: $h1-weight;
  margin: $spacing-xl 0 $spacing-lg 0;
}

h2, .h2 {
  font-size: $h2-size;
  line-height: $h2-height;
  font-weight: $h2-weight;
  margin: $spacing-lg 0 $spacing-md 0;
}

h3, .h3 {
  font-size: $h3-size;
  line-height: $h3-height;
  font-weight: $h3-weight;
  margin: $spacing-md 0 $spacing-sm 0;
}

h4, .h4 {
  font-size: $h4-size;
  line-height: $h4-height;
  font-weight: $h4-weight;
  margin: $spacing-md 0 $spacing-sm 0;
}

h5, .h5 {
  font-size: $font-size-lg;
  line-height: $line-height-lg;
  font-weight: $font-weight-semibold;
  margin: $spacing-sm 0 $spacing-xs 0;
}

h6, .h6 {
  font-size: $font-size-base;
  line-height: $line-height-base;
  font-weight: $font-weight-semibold;
  margin: $spacing-sm 0 $spacing-xs 0;
}

// ========================================
// PARAGRAPH
// ========================================
p {
  margin: 0 0 $spacing-md 0;
  line-height: $line-height-base;

  &:last-child {
    margin-bottom: 0;
  }
}

// ========================================
// LINKS
// ========================================
a {
  color: $primary-purple;
  text-decoration: none;
  transition: color $transition-fast;

  &:hover {
    color: $primary-purple-dark;
    text-decoration: underline;
  }

  &:active {
    color: darken($primary-purple-dark, 10%);
  }
}

// ========================================
// LISTS
// ========================================
ul, ol {
  margin: $spacing-md 0;
  padding-left: $spacing-2xl;

  li {
    margin: $spacing-sm 0;
  }
}

ul {
  list-style: disc;
}

ol {
  list-style: decimal;
}

// ========================================
// CODE
// ========================================
code, pre {
  font-family: $font-family-mono;
  background-color: $bg-tertiary;
  border-radius: $border-radius-md;
}

code {
  padding: $spacing-xs $spacing-sm;
  font-size: $font-size-sm;
  color: $danger-red;
}

pre {
  padding: $spacing-lg;
  overflow-x: auto;
  margin: $spacing-md 0;

  code {
    background-color: transparent;
    color: $color-text;
    padding: 0;
  }
}

// ========================================
// BLOCKQUOTE
// ========================================
blockquote {
  border-left: 4px solid $primary-purple;
  padding-left: $spacing-lg;
  margin: $spacing-lg 0;
  color: $color-text-secondary;
  font-style: italic;
}

// ========================================
// SMALL TEXT
// ========================================
small, .small {
  font-size: $font-size-sm;
  line-height: $line-height-sm;
}

// ========================================
// TEXT UTILITIES
// ========================================
.text-muted {
  color: $color-text-muted;
}

.text-secondary {
  color: $color-text-secondary;
}

.text-danger {
  color: $danger-red;
}

.text-success {
  color: $success-green;
}

.text-warning {
  color: $warning-yellow;
}

.text-info {
  color: $info-blue;
}

.font-bold {
  font-weight: $font-weight-bold;
}

.font-semibold {
  font-weight: $font-weight-semibold;
}

.font-medium {
  font-weight: $font-weight-medium;
}

.text-center {
  text-align: center;
}

.text-left {
  text-align: left;
}

.text-right {
  text-align: right;
}

.text-justify {
  text-align: justify;
}

// ========================================
// TRUNCATE
// ========================================
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

---

## 📝 FILE 3: _spacing.scss

**Path:** `src/app/styles/_spacing.scss`

```scss
// ========================================
// SPACING UTILITIES
// ========================================

@import 'variables';

// ========================================
// MARGIN UTILITIES
// ========================================
.m-0 { margin: 0; }
.m-xs { margin: $spacing-xs; }
.m-sm { margin: $spacing-sm; }
.m-md { margin: $spacing-md; }
.m-lg { margin: $spacing-lg; }
.m-xl { margin: $spacing-xl; }
.m-2xl { margin: $spacing-2xl; }
.m-3xl { margin: $spacing-3xl; }
.m-4xl { margin: $spacing-4xl; }

// Margin Top
.mt-0 { margin-top: 0; }
.mt-xs { margin-top: $spacing-xs; }
.mt-sm { margin-top: $spacing-sm; }
.mt-md { margin-top: $spacing-md; }
.mt-lg { margin-top: $spacing-lg; }
.mt-xl { margin-top: $spacing-xl; }
.mt-2xl { margin-top: $spacing-2xl; }
.mt-3xl { margin-top: $spacing-3xl; }

// Margin Right
.mr-0 { margin-right: 0; }
.mr-xs { margin-right: $spacing-xs; }
.mr-sm { margin-right: $spacing-sm; }
.mr-md { margin-right: $spacing-md; }
.mr-lg { margin-right: $spacing-lg; }
.mr-xl { margin-right: $spacing-xl; }
.mr-2xl { margin-right: $spacing-2xl; }

// Margin Bottom
.mb-0 { margin-bottom: 0; }
.mb-xs { margin-bottom: $spacing-xs; }
.mb-sm { margin-bottom: $spacing-sm; }
.mb-md { margin-bottom: $spacing-md; }
.mb-lg { margin-bottom: $spacing-lg; }
.mb-xl { margin-bottom: $spacing-xl; }
.mb-2xl { margin-bottom: $spacing-2xl; }
.mb-3xl { margin-bottom: $spacing-3xl; }

// Margin Left
.ml-0 { margin-left: 0; }
.ml-xs { margin-left: $spacing-xs; }
.ml-sm { margin-left: $spacing-sm; }
.ml-md { margin-left: $spacing-md; }
.ml-lg { margin-left: $spacing-lg; }
.ml-xl { margin-left: $spacing-xl; }
.ml-2xl { margin-left: $spacing-2xl; }

// ========================================
// PADDING UTILITIES
// ========================================
.p-0 { padding: 0; }
.p-xs { padding: $spacing-xs; }
.p-sm { padding: $spacing-sm; }
.p-md { padding: $spacing-md; }
.p-lg { padding: $spacing-lg; }
.p-xl { padding: $spacing-xl; }
.p-2xl { padding: $spacing-2xl; }
.p-3xl { padding: $spacing-3xl; }

// Padding Top
.pt-0 { padding-top: 0; }
.pt-xs { padding-top: $spacing-xs; }
.pt-sm { padding-top: $spacing-sm; }
.pt-md { padding-top: $spacing-md; }
.pt-lg { padding-top: $spacing-lg; }
.pt-xl { padding-top: $spacing-xl; }
.pt-2xl { padding-top: $spacing-2xl; }

// Padding Right
.pr-0 { padding-right: 0; }
.pr-xs { padding-right: $spacing-xs; }
.pr-sm { padding-right: $spacing-sm; }
.pr-md { padding-right: $spacing-md; }
.pr-lg { padding-right: $spacing-lg; }
.pr-xl { padding-right: $spacing-xl; }

// Padding Bottom
.pb-0 { padding-bottom: 0; }
.pb-xs { padding-bottom: $spacing-xs; }
.pb-sm { padding-bottom: $spacing-sm; }
.pb-md { padding-bottom: $spacing-md; }
.pb-lg { padding-bottom: $spacing-lg; }
.pb-xl { padding-bottom: $spacing-xl; }
.pb-2xl { padding-bottom: $spacing-2xl; }

// Padding Left
.pl-0 { padding-left: 0; }
.pl-xs { padding-left: $spacing-xs; }
.pl-sm { padding-left: $spacing-sm; }
.pl-md { padding-left: $spacing-md; }
.pl-lg { padding-left: $spacing-lg; }
.pl-xl { padding-left: $spacing-xl; }

// ========================================
// GAP (Flexbox)
// ========================================
.gap-0 { gap: 0; }
.gap-xs { gap: $spacing-xs; }
.gap-sm { gap: $spacing-sm; }
.gap-md { gap: $spacing-md; }
.gap-lg { gap: $spacing-lg; }
.gap-xl { gap: $spacing-xl; }
.gap-2xl { gap: $spacing-2xl; }
```

---

## 📝 FILE 4: _mixins.scss

**Path:** `src/app/styles/_mixins.scss`

```scss
// ========================================
// REUSABLE MIXINS
// ========================================

@import 'variables';

// ========================================
// FLEXBOX MIXINS
// ========================================
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

@mixin flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

@mixin flex-col {
  display: flex;
  flex-direction: column;
}

@mixin flex-col-center {
  @include flex-col;
  align-items: center;
  justify-content: center;
}

// ========================================
// GRID MIXINS
// ========================================
@mixin grid-auto($columns: auto-fit, $minmax: 250px) {
  display: grid;
  grid-template-columns: repeat($columns, minmax($minmax, 1fr));
  gap: $spacing-lg;
}

@mixin grid-cols($cols) {
  display: grid;
  grid-template-columns: repeat($cols, 1fr);
  gap: $spacing-lg;
}

// ========================================
// SHADOW MIXINS
// ========================================
@mixin shadow-sm {
  box-shadow: $shadow-sm;
}

@mixin shadow-md {
  box-shadow: $shadow-md;
}

@mixin shadow-lg {
  box-shadow: $shadow-lg;
}

@mixin shadow-xl {
  box-shadow: $shadow-xl;
}

// ========================================
// TEXT OVERFLOW MIXINS
// ========================================
@mixin truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@mixin line-clamp($lines: 1) {
  display: -webkit-box;
  -webkit-line-clamp: $lines;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

// ========================================
// TRANSITION MIXINS
// ========================================
@mixin transition($property: all, $duration: $transition-base) {
  transition: $property $duration;
}

@mixin hover-lift {
  transition: transform $transition-fast, box-shadow $transition-fast;

  &:hover {
    transform: translateY(-4px);
    box-shadow: $shadow-lg;
  }
}

// ========================================
// BUTTON MIXINS
// ========================================
@mixin button-reset {
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;
  font: inherit;
}

@mixin button-base {
  @include button-reset;
  @include flex-center;
  border-radius: $border-radius-md;
  font-weight: $font-weight-semibold;
  transition: all $transition-fast;
  gap: $spacing-sm;
}

@mixin button-primary {
  @include button-base;
  background: $primary-gradient;
  color: #fff;
  padding: $spacing-md $spacing-lg;

  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

@mixin button-secondary {
  @include button-base;
  background: $bg-tertiary;
  color: $color-text;
  padding: $spacing-md $spacing-lg;
  border: 1px solid $color-border;

  &:hover {
    background: $color-border;
  }
}

@mixin button-danger {
  @include button-base;
  background: $danger-gradient;
  color: #fff;
  padding: $spacing-md $spacing-lg;

  &:hover {
    opacity: 0.9;
  }
}

// ========================================
// INPUT MIXINS
// ========================================
@mixin input-base {
  width: 100%;
  padding: $spacing-md $spacing-lg;
  border: 1px solid $color-border;
  border-radius: $border-radius-md;
  font-size: $font-size-base;
  font-family: inherit;
  background: #fff;
  color: $color-text;
  transition: all $transition-fast;

  &:focus {
    outline: none;
    border-color: $primary-purple;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &:disabled {
    background: $bg-tertiary;
    cursor: not-allowed;
    opacity: 0.6;
  }
}

// ========================================
// CARD MIXINS
// ========================================
@mixin card {
  background: $bg-primary;
  border-radius: $border-radius-lg;
  padding: $spacing-lg;
  border: 1px solid $color-border;
  @include shadow-md;
  @include transition;

  &:hover {
    @include shadow-lg;
    border-color: $primary-purple;
  }
}

// ========================================
// BADGE MIXINS
// ========================================
@mixin badge-success {
  background: lighten($success-green, 30%);
  color: darken($success-green, 10%);
  padding: $spacing-xs $spacing-sm;
  border-radius: $border-radius-md;
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
}

@mixin badge-warning {
  background: $warning-bg;
  color: darken($warning-yellow, 20%);
  padding: $spacing-xs $spacing-sm;
  border-radius: $border-radius-md;
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
}

@mixin badge-danger {
  background: lighten($danger-red, 30%);
  color: $danger-red;
  padding: $spacing-xs $spacing-sm;
  border-radius: $border-radius-md;
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
}

// ========================================
// RESPONSIVE MIXINS
// ========================================
@mixin sm {
  @media (min-width: $breakpoint-sm) {
    @content;
  }
}

@mixin md {
  @media (min-width: $breakpoint-md) {
    @content;
  }
}

@mixin lg {
  @media (min-width: $breakpoint-lg) {
    @content;
    @content;
  }
}

@mixin xl {
  @media (min-width: $breakpoint-xl) {
    @content;
  }
}

@mixin 2xl {
  @media (min-width: $breakpoint-2xl) {
    @content;
  }
}
```

---

## 📝 FILE 5: _animations.scss

**Path:** `src/app/styles/_animations.scss`

```scss
// ========================================
// ANIMATIONS & KEYFRAMES
// ========================================

@import 'variables';

// ========================================
// FADE ANIMATIONS
// ========================================
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

// ========================================
// SLIDE ANIMATIONS
// ========================================
@keyframes slideInDown {
  from {
    transform: translateY(-30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideInUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideInLeft {
  from {
    transform: translateX(-30px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideInRight {
  from {
    transform: translateX(30px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOutDown {
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(30px);
    opacity: 0;
  }
}

// ========================================
// SCALE ANIMATIONS
// ========================================
@keyframes scaleIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes scaleOut {
  from {
    transform: scale(1);
    opacity: 1;
  }
  to {
    transform: scale(0.95);
    opacity: 0;
  }
}

// ========================================
// BOUNCE ANIMATIONS
// ========================================
@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

// ========================================
// SPIN ANIMATIONS
// ========================================
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes spin-reverse {
  from {
    transform: rotate(360deg);
  }
  to {
    transform: rotate(0deg);
  }
}

// ========================================
// SHIMMER ANIMATIONS (Skeleton Loading)
// ========================================
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

// ========================================
// CHECKMARK ANIMATIONS
// ========================================
@keyframes checkmark {
  0% {
    stroke-dashoffset: 50;
  }
  100% {
    stroke-dashoffset: 0;
  }
}

// ========================================
// UTILITY CLASSES
// ========================================
.animate-fade-in {
  animation: fadeIn $transition-base ease-in-out;
}

.animate-fade-out {
  animation: fadeOut $transition-base ease-in-out;
}

.animate-slide-in-down {
  animation: slideInDown $transition-base ease-out;
}

.animate-slide-in-up {
  animation: slideInUp $transition-base ease-out;
}

.animate-slide-in-left {
  animation: slideInLeft $transition-base ease-out;
}

.animate-slide-in-right {
  animation: slideInRight $transition-base ease-out;
}

.animate-scale-in {
  animation: scaleIn $transition-base ease-out;
}

.animate-scale-out {
  animation: scaleOut $transition-base ease-out;
}

.animate-bounce {
  animation: bounce $transition-base infinite;
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

.animate-shimmer {
  background: linear-gradient(
    90deg,
    $bg-tertiary 25%,
    $color-light 50%,
    $bg-tertiary 75%
  );
  background-size: 1000px 100%;
  animation: shimmer 2s infinite;
}
```

---

## ✅ Summary

After Copilot completes this task, you will have:

- [ ] `_variables.scss` - All color, spacing, typography variables
- [ ] `_typography.scss` - Heading, paragraph, text utilities
- [ ] `_spacing.scss` - Margin, padding, gap utilities
- [ ] `_mixins.scss` - Reusable SCSS mixins for components
- [ ] `_animations.scss` - All keyframe animations

---

## 🚨 Important

**Do NOT modify app.scss yet** - That gets updated in Task 3

All files are ready to import and use in components.

---

## 🎯 Next Step

After this task completes:
1. Verify no SCSS compilation errors
2. Proceed to **TASK_3_GLOBAL_STYLES.md**

---

**Status: Ready for Copilot Agent Mode ✅**
