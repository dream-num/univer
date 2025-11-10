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
import type { IMenuButtonItem, IMenuSelectorItem } from '@univerjs/ui';
import {
    DEFAULT_STYLES,
    EDITOR_ACTIVATED,
    FOCUSING_SHEET,
    ICommandService,
    IContextService,
    IUniverInstanceService,
    UniverInstanceType,
} from '@univerjs/core';
import { SetTextSelectionsOperation } from '@univerjs/docs';
import { SetInlineFormatCommand } from '@univerjs/docs-ui';
import {
    RangeProtectionPermissionEditPoint,
    SetRangeValuesMutation,
    SetSelectionsOperation,
    SetWorksheetActiveOperation,
    SheetsSelectionsService,
    WorkbookEditablePermission,
    WorksheetEditPermission,
    WorksheetSetCellStylePermission,
} from '@univerjs/sheets';
import { FONT_SIZE_COMPONENT, FONT_SIZE_LIST, getMenuHiddenObservable, MenuItemType } from '@univerjs/ui';
import { Observable } from 'rxjs';
import {
    SetRangeFontDecreaseCommand,
    SetRangeFontIncreaseCommand,
    SetRangeFontSizeCommand,
} from '../../commands/commands/inline-format.command';
import { deriveStateFromActiveSheet$, getCurrentRangeDisable$ } from './menu-util';
import { getFontStyleAtCursor } from './utils';

function updateFontSizeValue(accessor: IAccessor, defaultValue: number) {
    const selectionManagerService = accessor.get(SheetsSelectionsService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const commandService = accessor.get(ICommandService);
    const contextService = accessor.get(IContextService);

    return deriveStateFromActiveSheet$(univerInstanceService, defaultValue, ({ worksheet }) => new Observable((subscriber) => {
        const updateSheet = () => {
            let fs = defaultValue;
            const primary = selectionManagerService.getCurrentLastSelection()?.primary;
            if (primary != null) {
                const style = worksheet.getComposedCellStyle(primary.startRow, primary.startColumn);
                if (style.fs) {
                    fs = style.fs;
                }
            }

            subscriber.next(fs);
        };

        const updateSheetEditor = () => {
            const textRun = getFontStyleAtCursor(accessor);
            if (textRun != null) {
                const fs = (textRun.ts?.fs ?? defaultValue);

                subscriber.next(fs);
            }
        };

        const disposable = commandService.onCommandExecuted((c) => {
            const id = c.id;
            if (id === SetRangeValuesMutation.id || id === SetSelectionsOperation.id || id === SetWorksheetActiveOperation.id) {
                updateSheet();
            }

            if (
                (id === SetTextSelectionsOperation.id || id === SetInlineFormatCommand.id) &&
                    contextService.getContextValue(EDITOR_ACTIVATED) &&
                    contextService.getContextValue(FOCUSING_SHEET)
            ) {
                updateSheetEditor();
            }
        });

        updateSheet();
        return disposable.dispose;
    }));
}

export function FontSizeSelectorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<number> {
    const defaultValue = DEFAULT_STYLES.fs;
    const disabled$ = getCurrentRangeDisable$(accessor, {
        workbookTypes: [WorkbookEditablePermission],
        worksheetTypes: [WorksheetEditPermission, WorksheetSetCellStylePermission],
        rangeTypes: [RangeProtectionPermissionEditPoint],
    }, true);

    return {
        id: SetRangeFontSizeCommand.id,
        type: MenuItemType.SELECTOR,
        tooltip: 'toolbar.fontSize',
        label: {
            name: FONT_SIZE_COMPONENT,
            props: {
                min: 6,
                max: 400,
                disabled$,
            },
        },
        selections: FONT_SIZE_LIST,
        disabled$,
        value$: updateFontSizeValue(accessor, defaultValue),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}

export function FontSizeIncreaseMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const disabled$ = getCurrentRangeDisable$(accessor, {
        workbookTypes: [WorkbookEditablePermission],
        worksheetTypes: [WorksheetEditPermission, WorksheetSetCellStylePermission],
        rangeTypes: [RangeProtectionPermissionEditPoint],
    }, true);

    return {
        id: SetRangeFontIncreaseCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'FontSizeIncreaseIcon',
        tooltip: 'toolbar.fontSizeIncrease',
        disabled$,
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}

export function FontSizeDecreaseMenuItemFactory(accessor: IAccessor) {
    const disabled$ = getCurrentRangeDisable$(accessor, {
        workbookTypes: [WorkbookEditablePermission],
        worksheetTypes: [WorksheetEditPermission, WorksheetSetCellStylePermission],
        rangeTypes: [RangeProtectionPermissionEditPoint],
    }, true);

    return {
        id: SetRangeFontDecreaseCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'FontSizeReduceIcon',
        tooltip: 'toolbar.fontSizeDecrease',
        disabled$,
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}
