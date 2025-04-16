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

// NOTE: editors has the following states:
// 1. Not focused. The `contenteditable` is not focused and the editor would not respond
// to keyboard events.
// 2. Focused (but not activated). The `contenteditable` is focused and editor
// would respond to keyboard events. This is the state when a user focus a spreadsheet
// without the editor being visible.
// 3. Activated. User can see the cursor blinking.

export const FOCUSING_UNIT = 'FOCUSING_UNIT';

export const FOCUSING_SHEET = 'FOCUSING_SHEET';
export const FOCUSING_DOC = 'FOCUSING_DOC';
export const FOCUSING_SLIDE = 'FOCUSING_SLIDE';

/** @deprecated */
export const FOCUSING_EDITOR_BUT_HIDDEN = 'FOCUSING_EDITOR_BUT_HIDDEN';

export const EDITOR_ACTIVATED = 'EDITOR_ACTIVATED';
export const FOCUSING_EDITOR_INPUT_FORMULA = 'FOCUSING_EDITOR_INPUT_FORMULA';

/** The focusing state of the formula editor (Fx bar). */
export const FOCUSING_FX_BAR_EDITOR = 'FOCUSING_FX_BAR_EDITOR';

/** The focusing state of the cell editor. */
export const FOCUSING_UNIVER_EDITOR = 'FOCUSING_UNIVER_EDITOR';

export const FOCUSING_EDITOR_STANDALONE = 'FOCUSING_EDITOR_INPUT_FORMULA';

/** The focusing state of the editor in side panel, such as Chart Editor Panel. */
export const FOCUSING_PANEL_EDITOR = 'FOCUSING_PANEL_EDITOR';

// WTF: what does this even means?
export const FOCUSING_UNIVER_EDITOR_STANDALONE_SINGLE_MODE = 'FOCUSING_UNIVER_EDITOR_STANDALONE_SINGLE_MODE';

/**
 * The focusing state of the common drawings.
 */
export const FOCUSING_COMMON_DRAWINGS = 'FOCUSING_COMMON_DRAWINGS';

export const FORMULA_EDITOR_ACTIVATED = 'FORMULA_EDITOR_ACTIVATED';
