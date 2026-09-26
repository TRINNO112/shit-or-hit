---
name: fluid-ui-interactions
description: >-
  Master directives for 60 FPS fluid UI animations, spring physics, modal lifecycles,
  and micro-interactions derived from Emil Kowalski (Vaul, Sonner), Radix UI primitives,
  and Vercel design engineering. Grounded in local reference repos d:\Trinno\vaul and d:\Trinno\sonner.
---

# 🌊 Fluid UI Interactions & Spring Physics Directives

> **Source Repositories**: `d:\Trinno\vaul` & `d:\Trinno\sonner` (Emil Kowalski)  
> **Philosophy**: Interfaces should feel physical, weightless, and alive — never sluggish, never jarring, and never producing Cumulative Layout Shift (CLS).

---

## 📐 1. The Core Physics Hierarchy: Springs Over Curves

Never use generic CSS cubic-bezier curves (`ease`, `ease-in-out`) for interactive UI elements. Real-world objects have inertia, mass, and tension.

### Optimal Spring Parameter Tokens (Framer Motion)

| Interaction Type | Stiffness | Damping | Mass | Visual Behavior |
| :--- | :--- | :--- | :--- | :--- |
| **Modal Entry** | `360` | `26` | `0.8` | Snappy, crisp pop-in with zero rubber-band wobble. |
| **Modal Exit** | `420` | `32` | `0.6` | Fast, decisive exit that never makes the user wait. |
| **Sheet / Drawer Drag** | `300` | `30` | `1.0` | Natural finger tracking with velocity transfer. |
| **Tactile Button Tap** | `500` | `20` | `0.4` | Instantaneous physical micro-haptic response. |
| **Micro-Affirmation Tick** | `400` | `22` | `0.5` | Smooth scale-in from 0.8 to 1.0 with subtle weight. |

---

## 🚫 2. The React AnimatePresence Unmount Trap (Must Avoid)

### The Anti-Pattern (Janky Instant Dismissal):
```jsx
// ❌ WRONG: Parent unmounts immediately, killing the child exit animation!
{isOpen && <ModalComponent isOpen={isOpen} onClose={...} />}
```
When `isOpen` changes from `true` to `false`, React immediately unmounts `<ModalComponent>` from the DOM. Any `<AnimatePresence>` or `exit` props inside the child are terminated before they can play.

### The Correct Pattern (Butter-Smooth Exit):
```jsx
// ✅ CORRECT: AnimatePresence wraps the conditional render at the parent level!
<AnimatePresence>
  {isOpen && (
    <ModalComponent
      key="unique-modal-id"
      onClose={handleClose}
    />
  )}
</AnimatePresence>
```
Framer Motion intercepts the removal, plays `exit={{ opacity: 0, scale: 0.94, y: 12 }}`, and unmounts the node only after all animations complete at 60 FPS.

---

## ⚡ 3. The Asymmetric Timing Law

Human perception reacts differently to appearing versus disappearing elements:
- **Entry (Opening)**: The user is looking for content. Give them ~180ms–220ms with natural deceleration so they can orient themselves.
- **Exit (Closing)**: The user has already made the decision to leave. **Exit must always be 25–30% faster than entry** (e.g. ~140ms–160ms). Sluggish exit animations make an app feel heavy and laggy.

---

## 🌿 4. Zero Cumulative Layout Shift (CLS) Micro-Affirmations

Feedback must be **noticeable, but not loud**.
- **Never insert a 60px–80px banner box** above a `<textarea>` or input field that shifts existing layout.
- Use **pure floating SVG icons** (`<Check />`) that smoothly fade in (`scale: 0.8 → 1.0`) and auto-dismiss after 2.0s–2.5s.
- Keep the writing canvas completely stationary.

---

## 🎯 5. Neobrutalist Motion Integration

When applying fluid spring physics to bold Neobrutalist design:
- Keep the borders solid (`border-2 border-black` / `border-3 border-black`) and drop-shadows sharp (`shadow-[4px_4px_0px_#000000]`).
- Do not blur or melt borders during animation.
- Active states must translate `translate-x-px translate-y-px` while flattening the shadow to simulate physical mechanical switches.
