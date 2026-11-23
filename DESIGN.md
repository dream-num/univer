# Univer workbench UI

Univer is an editor. Keep the document, sheet or canvas visible while people work. Use the ribbon for frequently used commands, a floating toolbar for actions on the current selection, a dropdown for a short choice, and a sidebar for settings that people adjust while inspecting the result. Reserve modal dialogs for tasks that need a decision before editing can continue.

## Choose the surface first

| Surface | Frame and spacing |
| --- | --- |
| Desktop dropdown | The host draws one border, a 6 px radius and the dropdown shadow. A standard menu already has a 6 px inset around its rows. A custom picker supplies the space its content needs inside the host. |
| Compact form | Use a 32 px single-line input, button or selector with 6 px corners. A multi-value trigger can grow when its chips wrap. The desktop link editors use 12 px padding and 12 px corners. |
| Floating editor toolbar | Use 4 px of padding, 4 px corners and the light toolbar shadow. Put dividers between visible groups, inset from the frame. Inspect the result with optional groups hidden and with the toolbar near the viewport edge. |
| Sidebar | Align the title, section labels and controls to a common leading edge. Leave room around the close button. Let long content scroll while keeping the panel controls reachable. |
| Mobile drawer | A resizable workbench drawer has 24 px top corners and an interactive handle. A temporary dropdown uses 16 px top corners and a close action. Show a handle only when it can change the drawer height. |

These dimensions describe the named surfaces at the default scale. Reuse the component and its size variant so the theme and interaction states travel with it. For example, a small Input and a middle Button both render at the compact desktop height. Use the class utilities from the design package for shared borders and focus treatment. Preserve larger touch targets on mobile. [Input](packages/design/src/components/input/Input.tsx) · [Button](packages/design/src/components/button/Button.tsx) · [Dropdown menu](packages/design/src/components/dropdown-menu/DropdownMenuPrimitive.tsx) · [Floating toolbar](packages/ui/src/components/editor-toolbar/EditorFloatingToolbar.tsx) · [Mobile drawer](packages/ui/src/views/components/mobile-drawer/MobileDrawer.tsx)

### Embedding a picker

Decide who draws the background, border, corners and shadow. In a dropdown, the parent owns the frame. In a drawer, a picker card on a contrasting background still needs space between its edge and its controls. When the picker shares the drawer background, align its first control with the header using the drawer’s inset. In each case, keep spacing between search, results and category navigation.

The emoji picker exposes separate controls for its frame and its horizontal padding. Set `embedded` when the host supplies the frame. Set `horizontalPadding={false}` only when the host also supplies the content inset. For a color picker, open both the swatch grid and the custom editor. The last swatch, selection indicator, inputs and confirmation action must all fit or be reachable by scrolling. [Emoji picker](packages/ui/src/views/emoji-picker/EmojiPicker.tsx) · [Color picker](packages/design/src/components/color-picker/ColorPicker.tsx)

## Text, color and icons

Use the existing workbench typography. Menu items and compact form text typically use 14 px. Secondary descriptions use 12 px. In a statistics panel, a semibold title and aligned, tabular values let readers scan the rows. Add a label or description when it identifies a control, explains a choice or communicates state. [Document statistics](packages/docs-ui/src/views/doc-statistics/DocStatistics.tsx)

Use theme-aware utilities for backgrounds, text, dividers and interaction states. Resolve canvas colors through the theme service. Keep user-selected document colors and palette swatches faithful to their stored values, including in dark mode. Give an icon-only action a localized accessible name and keep the icon centered in its hit target. [Theme utilities](common/shared/tailwind/tailwind.config.ts) · [Theme service](packages/core/src/services/theme/theme.service.ts) · [Color presets](packages/design/src/components/color-picker/ColorPresets.tsx)

## Interaction

- Use a button for an action and a link for navigation. A chooser that opens on hover must also open on deliberate keyboard activation. Hovering preserves editor focus. Show keyboard focus on the active control, allow selection using the keyboard, and return focus to the trigger when Escape dismisses the chooser.
- A composite search field has one visible focus ring around its icon and text. Put validation messages next to the relevant field and expose the invalid state. Ensure pressed, selected and disabled controls remain distinguishable in both themes. [Shared control states](packages/design/src/helper/class-utilities.ts)
- Open nested editors without losing the parent selection. Cancel or Escape in a custom color editor discards its draft and returns to the palette. Preserve the expected distinction between previewing a value and applying it. [Color picker](packages/design/src/components/color-picker/ColorPicker.tsx)
- Keep labels localized. Use leading and trailing edges for layouts that mirror. Inspect the rendered picker in RTL, including portals, icon placement, text padding and the alignment of values. A directional class name alone does not establish where the browser placed an icon.

## Reviewing a UI change

Start from the product command that opens the control. For a shared component, trace its consumers and exercise each distinct host or interaction affected by the change. Include keyboard and pointer paths, relevant light and dark states, and a narrow viewport such as 390 CSS px for mobile work. Measure the edges that should align. Try a long label, a wrapped selection or the last item in a scrollable grid where appropriate.

Capture Before and After at the same viewport, theme, locale, selection and interaction state. Include the complete panel frame in the crop. Use a separate comparison for a different state, such as switching from a palette to its custom editor. Use React refs for imperative DOM access and query by role, accessible name or label in tests. Keep test-only DOM attributes such as `data-testid` out of components. Tests should protect selection, application, cancellation or focus behavior. A screenshot or computed layout measurement is more informative for a spacing change.
