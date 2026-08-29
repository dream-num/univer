/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Context key indicating that pinch-to-zoom gesture is in progress on mobile.
 * Used to prevent selection operations during pinch zoom.
 */
export const MOBILE_PINCH_ZOOMING = 'MOBILE_PINCH_ZOOMING';

/**
 * Context key indicating that selection is being expanded on mobile (dragging fill controls).
 * Used to prevent scroll/inertia/zoom operations during selection expansion.
 */
export const MOBILE_EXPANDING_SELECTION = 'MOBILE_EXPANDING_SELECTION';

/**
 * Context key indicating that the next selection-end event was triggered by a mobile long press.
 * Used to ensure the context menu only opens for long-press gestures, not normal taps.
 */
export const MOBILE_TRIGGER_CONTEXT_MENU = 'MOBILE_TRIGGER_CONTEXT_MENU';

/** Mobile sheets edit through the formula bar while the in-cell editor stays hidden. */
export const MOBILE_SHEET_FX_EDITOR = 'MOBILE_SHEET_FX_EDITOR';

/** Whether the software keyboard currently occupies the mobile visual viewport. */
export const MOBILE_KEYBOARD_VISIBLE = 'MOBILE_KEYBOARD_VISIBLE';

/** Whether the mobile formula editor currently occupies the immersive full-screen surface. */
export const MOBILE_FX_EDITOR_EXPANDED = 'MOBILE_FX_EDITOR_EXPANDED';

/** Whether the compact mobile formula operator strip is currently visible. */
export const MOBILE_FORMULA_OPERATORS_VISIBLE = 'MOBILE_FORMULA_OPERATORS_VISIBLE';

/** Height of the compact mobile formula operator strip in pixels. */
export const MOBILE_FORMULA_OPERATOR_BAR_HEIGHT = 36;

/** Submit the compact mobile formula bar without unmounting its input. */
export const MOBILE_FORMULA_BAR_SUBMIT_COMMAND_ID = 'sheet.command.mobile-formula-bar-submit';
