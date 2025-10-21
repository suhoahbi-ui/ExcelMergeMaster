# Excel File Consolidation App - Design Guidelines

## Design Approach
**Selected System**: Material Design with Korean UI optimization
**Rationale**: Utility-focused data processing tool requiring clarity, efficiency, and intuitive file handling workflows

## Core Design Elements

### A. Color Palette

**Light Mode:**
- Primary: 59 91% 50% (Professional blue for CTAs and active states)
- Background: 0 0% 98% (Subtle warm gray for reduced eye strain)
- Surface: 0 0% 100% (Pure white cards and containers)
- Text Primary: 220 20% 15% (Near black with slight blue)
- Text Secondary: 220 10% 45% (Medium gray for labels)
- Success: 142 76% 36% (Green for successful uploads/processing)
- Error: 0 72% 51% (Red for errors/warnings)
- Border: 220 13% 91% (Light gray for dividers)

**Dark Mode:**
- Primary: 211 100% 65% (Lighter blue for visibility)
- Background: 220 20% 10% (Deep blue-gray)
- Surface: 220 18% 14% (Elevated dark gray)
- Text Primary: 0 0% 95% (Off-white)
- Text Secondary: 220 10% 70% (Light gray)

### B. Typography
- **Primary Font**: Pretendard (Korean optimized) via CDN
- **Fallback**: system-ui, -apple-system, sans-serif
- **Heading 1**: 2rem (32px), font-weight 700, tracking tight
- **Heading 2**: 1.5rem (24px), font-weight 600
- **Body**: 0.875rem (14px), font-weight 400, line-height 1.5
- **Labels**: 0.75rem (12px), font-weight 500, uppercase tracking

### C. Layout System
**Spacing Units**: Tailwind units of 2, 4, 6, 8, 12, 16 (e.g., p-4, gap-6, mb-8)
- Consistent padding: p-6 for cards, p-4 for smaller elements
- Gap spacing: gap-4 between related elements, gap-8 between sections
- Max width: max-w-6xl for main content area, centered

### D. Component Library

**File Upload Areas:**
- Two distinct upload zones with clear labeling (배차내역 / 매출리스트)
- Dashed border (border-2 border-dashed) in idle state
- Solid border with primary color on drag-over
- Icons: Upload cloud icon (Heroicons) centered above text
- Upload state indicators: file count, total size display
- Individual file chips with remove buttons
- Height: min-h-48 for adequate drop target

**Data Preview Table:**
- Sticky header row with column names
- Alternating row backgrounds (even rows with subtle gray)
- Compact row height: py-3 px-4
- Horizontal scroll on mobile with shadow indicators
- Column headers: font-weight 600, smaller text
- Zebra striping for better row tracking
- Max height: max-h-96 with vertical scroll

**Action Buttons:**
- Primary action (통합 파일 다운로드): Filled button, px-6 py-3, rounded-lg
- Secondary actions: Outlined buttons with transparent background
- Loading states with spinner icon
- Disabled state with reduced opacity

**Status Messages:**
- Success banner: Light green background, left border accent
- Error alerts: Light red background, icon + message
- Info messages: Light blue background for processing status
- Dismissible with X button

**Progress Indicators:**
- Linear progress bar during file processing
- Indeterminate animation for unknown duration tasks
- Percentage display for deterministic operations

### E. Layout Structure

**Main Container:**
- Centered layout with max-w-6xl
- Vertical padding: py-12
- Two-column grid on desktop (lg:grid-cols-2) for upload areas
- Single column stacked on mobile

**Upload Section:**
- Clear numbered steps (1단계, 2단계)
- Generous spacing between upload zones (gap-8)
- File format guidance below each uploader
- Descriptive helper text in smaller gray font

**Processing Section:**
- Centered status indicator
- Clear messaging about what's happening
- Progress visualization

**Preview Section:**
- Full-width table container
- Column count badge (예: 7개 항목)
- Row count display (예: 총 243행)
- Scrollable container with shadow hints

**Download Section:**
- Centered CTA button
- File name preview
- Secondary option to reset/start over

## Critical UX Patterns

**Upload Flow:**
1. Empty state with upload icon and instruction text
2. Drag-over state with visual feedback
3. Uploaded state showing file list
4. Ability to remove individual files
5. Re-upload capability

**Error Handling:**
- Invalid file format warnings
- Missing column alerts (with column name specified)
- No matching records messaging
- File size limit notifications

**Responsive Behavior:**
- Single column layout on mobile (<768px)
- Scrollable table on small screens
- Touch-friendly button sizes (min-h-12)
- Adequate spacing for finger targets (min 44x44px)

## Animations
- Smooth transitions on drag-over states (transition-colors duration-200)
- Fade-in for uploaded file chips
- Minimal, purposeful motion - avoid distracting animations
- Loading spinner only during processing

## No Hero Section
This is a utility app - no marketing hero needed. Start directly with clear instructions and upload interface.