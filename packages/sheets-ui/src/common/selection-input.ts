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

import type { IMouseEvent } from '@univerjs/engine-render';

export function isSheetContextMenuGesture(
    event: Pick<IMouseEvent, 'button' | 'ctrlKey'>,
    isMac: boolean,
    refSelectionsEnabled: boolean
): boolean {
    return event.button === 2 || (isMac && !refSelectionsEnabled && event.button === 0 && event.ctrlKey);
}

export function isSheetMultiSelectModifier(
    event: Pick<IMouseEvent, 'ctrlKey' | 'metaKey'>,
    isMac: boolean
): boolean {
    return isMac ? event.metaKey : event.ctrlKey;
}
