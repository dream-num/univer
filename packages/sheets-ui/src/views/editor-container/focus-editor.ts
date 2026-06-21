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

import { DOCS_NORMAL_EDITOR_UNIT_ID_KEY } from '@univerjs/core';

const SHEET_CELL_EDITOR_ELEMENT_ID = `__editor_${DOCS_NORMAL_EDITOR_UNIT_ID_KEY}`;

export function focusSheetCellEditorElement(ownerDocument: Document = document): boolean {
    const element = ownerDocument.getElementById(SHEET_CELL_EDITOR_ELEMENT_ID) as HTMLElement | null;

    if (element == null || ownerDocument.activeElement === element) {
        return false;
    }

    if (!element.hasAttribute('tabindex')) {
        element.tabIndex = -1;
    }

    element.focus({ preventScroll: true });

    return ownerDocument.activeElement === element;
}
