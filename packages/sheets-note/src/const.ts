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

import type { IPermissionTypes } from '@univerjs/core';
import { RangeProtectionPermissionEditPoint, WorkbookEditablePermission, WorksheetEditPermission } from '@univerjs/sheets';

export const PLUGIN_NAME = 'SHEET_NOTE_PLUGIN';

export const SHEET_NOTE_TOGGLE_PERMISSIONS: IPermissionTypes = {
    workbookTypes: [WorkbookEditablePermission],
    worksheetTypes: [WorksheetEditPermission],
};

/**
 * Notes have no permission point of their own; they follow the cell edit points.
 */
export const SHEET_NOTE_EDIT_PERMISSIONS: IPermissionTypes = {
    ...SHEET_NOTE_TOGGLE_PERMISSIONS,
    rangeTypes: [RangeProtectionPermissionEditPoint],
};
