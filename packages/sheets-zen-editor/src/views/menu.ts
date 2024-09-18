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

import { RangeProtectionPermissionEditPoint, WorkbookEditablePermission, WorksheetEditPermission, WorksheetSetCellStylePermission, WorksheetSetCellValuePermission } from '@univerjs/sheets';

import { getCurrentExclusiveRangeInterest$, getCurrentRangeDisable$ } from '@univerjs/sheets-ui';
import { type IMenuButtonItem, MenuItemType } from '@univerjs/ui';
import type { IAccessor } from '@univerjs/core';
import { OpenZenEditorOperation } from '../commands/operations/zen-editor.operation';

export function ZenEditorMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: OpenZenEditorOperation.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.zenEditor',
        icon: 'AmplifySingle',
        hidden$: getCurrentExclusiveRangeInterest$(accessor),
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission, WorksheetSetCellValuePermission, WorksheetSetCellStylePermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),
    };
}
