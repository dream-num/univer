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

import type { IMenuButtonItem } from '@univerjs/ui';
import { getMenuHiddenObservable, MenuItemType } from '@univerjs/ui';
import type { IAccessor } from '@univerjs/core';

import { UniverInstanceType } from '@univerjs/core';
import { getCurrentRangeDisable$ } from '@univerjs/sheets-ui';
import { RangeProtectionPermissionEditPoint, WorkbookEditablePermission, WorksheetEditPermission, WorksheetSetCellStylePermission, WorksheetSetCellValuePermission } from '@univerjs/sheets';
import { ToggleScriptPanelOperation } from '../commands/operations/panel.operation';

export function UniscriptMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: ToggleScriptPanelOperation.id,
        title: 'toggle-script-panel',
        tooltip: 'script-panel.tooltip.menu-button',
        icon: 'CodeSingle',
        type: MenuItemType.BUTTON,
        // FIXME hidden$ and disabled$ are not correctly in doc
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission, WorksheetSetCellStylePermission, WorksheetSetCellValuePermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),
    };
}
