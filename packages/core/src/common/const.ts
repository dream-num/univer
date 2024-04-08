/**
 * Copyright 2023-present DreamNum Inc.
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

export const DOCS_NORMAL_EDITOR_UNIT_ID_KEY = '__defaultDocumentNormalEditorSpecialUnitId_20231006__';

export const DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY = '__defaultDocumentFormulaBarEditorSpecialUnitId_20231012__';

export const DEFAULT_EMPTY_DOCUMENT_VALUE = '\r\n';

export function createInternalEditorID(id: string) {
    return `__internalEditorId__${id}`;
}

export function isInternalEditorID(id: string) {
    return id.startsWith('__');
}
