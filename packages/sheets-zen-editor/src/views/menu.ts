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

import type { IAccessor } from '@univerjs/core';
import type { IMenuButtonItem } from '@univerjs/ui';
import { RangeProtectionPermissionEditPoint, WorkbookEditablePermission, WorksheetEditPermission, WorksheetSetCellStylePermission, WorksheetSetCellValuePermission } from '@univerjs/sheets';
import { getCurrentExclusiveRangeInterest$, getCurrentRangeDisable$, IEditorBridgeService } from '@univerjs/sheets-ui';
import { MenuItemType } from '@univerjs/ui';
import { map, switchMap } from 'rxjs';
import { OpenZenEditorCommand } from '../commands/commands/zen-editor.command';

export function ZenEditorMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const editorBridgeService = accessor.get(IEditorBridgeService);
    return {
        id: OpenZenEditorCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.zenEditor',
        icon: 'AmplifySingle',
        hidden$: getCurrentExclusiveRangeInterest$(accessor),
        disabled$: editorBridgeService.currentEditCell$.pipe(
            switchMap((cell) => getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission, WorksheetSetCellValuePermission, WorksheetSetCellStylePermission], rangeTypes: [RangeProtectionPermissionEditPoint] })
                .pipe(map((disabled) => disabled || (cell?.documentLayoutObject.documentModel?.getBody()?.customBlocks?.length ?? 0) > 0)))
        ),
    };
}
