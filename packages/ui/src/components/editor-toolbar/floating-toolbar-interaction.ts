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

import type { MouseEvent, PointerEvent } from 'react';

const KEEP_MOUSE_DOWN_DEFAULT_SELECTOR = 'input, textarea, [contenteditable="true"], [role="combobox"], [data-u-comp="select"], .univer-select';

export function shouldKeepFloatingToolbarMouseDownDefault(target: EventTarget | null): boolean {
    return target instanceof HTMLElement && target.closest(KEEP_MOUSE_DOWN_DEFAULT_SELECTOR) !== null;
}

export function preventFloatingToolbarPanelBlur(event: MouseEvent<HTMLElement> | PointerEvent<HTMLElement>): void {
    if (!shouldKeepFloatingToolbarMouseDownDefault(event.target)) {
        event.preventDefault();
    }
}

export function keepFloatingToolbarPanelInteraction(event: MouseEvent<HTMLElement> | PointerEvent<HTMLElement>): void {
    event.stopPropagation();
    preventFloatingToolbarPanelBlur(event);
}
