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
import type { IMenuItem, IValueOption } from '@univerjs/ui';
import { UniverInstanceType } from '@univerjs/core';
import { FunctionType } from '@univerjs/engine-formula';
import {
    RangeProtectionPermissionEditPoint,
    RangeProtectionPermissionViewPoint,
    WorkbookCopyPermission,
    WorkbookEditablePermission,
    WorksheetCopyPermission,
    WorksheetEditPermission,
    WorksheetSetCellValuePermission,
} from '@univerjs/sheets';
import { IDescriptionService } from '@univerjs/sheets-formula';
import { getCurrentRangeDisable$, menuClipboardDisabledObservable } from '@univerjs/sheets-ui';
import { getMenuHiddenObservable, MenuItemType } from '@univerjs/ui';
import { combineLatestWith, map } from 'rxjs';
import { SheetCopyFormulaOnlyCommand, SheetOnlyPasteFormulaCommand } from '../commands/commands/formula-clipboard.command';
import { InsertFunctionOperation } from '../commands/operations/insert-function.operation';
import { MoreFunctionsOperation } from '../commands/operations/more-functions.operation';

export function InsertCommonFunctionMenuItemFactory(accessor: IAccessor): IMenuItem {
    const commonFunctions = ['SUMIF', 'SUM', 'AVERAGE', 'IF', 'COUNT', 'SIN', 'MAX'];
    let selections: IValueOption[] = commonFunctions.map((name) => ({
        label: {
            name,
            selectable: false,
        },
        value: name,
    }));

    try {
        const descriptionService = accessor.get(IDescriptionService);
        const filtered = commonFunctions.filter((name) => Boolean(descriptionService.getFunctionInfo(name)));
        if (filtered.length > 0) {
            selections = filtered.map((name) => ({
                label: {
                    name,
                    selectable: false,
                },
                value: name,
            }));
        }
    } catch {
        // Fallback to static common list.
    }

    return {
        id: `${InsertFunctionOperation.id}.common`,
        commandId: InsertFunctionOperation.id,
        title: 'formula.insert.common',
        tooltip: 'formula.insert.tooltip',
        icon: 'FunctionIcon',
        type: MenuItemType.SELECTOR,
        selections,
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}

function createInsertFunctionCategoryMenuItemFactory(functionType: FunctionType, categoryKey: string, icon?: string) {
    return function insertFunctionCategoryMenuItemFactory(accessor: IAccessor): IMenuItem {
        let selections: IValueOption[] = [];

        try {
            const descriptionService = accessor.get(IDescriptionService);
            selections = descriptionService.getSearchListByType(functionType).map(({ name }) => ({
                label: {
                    name,
                    selectable: false,
                },
                value: name,
            }));
        } catch {
            selections = [];
        }

        return {
            id: `${InsertFunctionOperation.id}.${categoryKey}`,
            commandId: InsertFunctionOperation.id,
            title: `formula.functionType.${categoryKey}`,
            tooltip: 'formula.insert.tooltip',
            icon,
            type: MenuItemType.SELECTOR,
            selections,
            hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        };
    };
}

export const InsertFinancialFunctionMenuItemFactory = createInsertFunctionCategoryMenuItemFactory(FunctionType.Financial, 'financial');
export const InsertLogicalFunctionMenuItemFactory = createInsertFunctionCategoryMenuItemFactory(FunctionType.Logical, 'logical');
export const InsertTextFunctionMenuItemFactory = createInsertFunctionCategoryMenuItemFactory(FunctionType.Text, 'text');
export const InsertDateFunctionMenuItemFactory = createInsertFunctionCategoryMenuItemFactory(FunctionType.Date, 'date');
export const InsertLookupFunctionMenuItemFactory = createInsertFunctionCategoryMenuItemFactory(FunctionType.Lookup, 'lookup');
export const InsertMathFunctionMenuItemFactory = createInsertFunctionCategoryMenuItemFactory(FunctionType.Math, 'math');
export const InsertStatisticalFunctionMenuItemFactory = createInsertFunctionCategoryMenuItemFactory(FunctionType.Statistical, 'statistical');
export const InsertEngineeringFunctionMenuItemFactory = createInsertFunctionCategoryMenuItemFactory(FunctionType.Engineering, 'engineering');
export const InsertInformationFunctionMenuItemFactory = createInsertFunctionCategoryMenuItemFactory(FunctionType.Information, 'information');
export const InsertDatabaseFunctionMenuItemFactory = createInsertFunctionCategoryMenuItemFactory(FunctionType.Database, 'database');

// All Functions entry displayed at the bottom of category dropdowns.
export function AllFunctionsMenuItemFactory(accessor: IAccessor): IMenuItem {
    return {
        id: MoreFunctionsOperation.id,
        title: 'formula.moreFunctions.allFunctions',
        tooltip: 'formula.insert.tooltip',
        type: MenuItemType.BUTTON,
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        disabled$: getCurrentRangeDisable$(accessor, {
            workbookTypes: [WorkbookEditablePermission],
            worksheetTypes: [WorksheetEditPermission, WorksheetSetCellValuePermission],
            rangeTypes: [RangeProtectionPermissionEditPoint],
        }),
    };
}

// Right click menu - Copy Formula Only
export function CopyFormulaOnlyMenuItemFactory(accessor: IAccessor): IMenuItem {
    return {
        id: SheetCopyFormulaOnlyCommand.id,
        type: MenuItemType.BUTTON,
        title: 'formula.operation.copyFormulaOnly',
        disabled$: getCurrentRangeDisable$(accessor, {
            workbookTypes: [WorkbookCopyPermission],
            worksheetTypes: [WorksheetCopyPermission],
            rangeTypes: [RangeProtectionPermissionViewPoint],
        }),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}

// Right click menu - Paste Formula
export function PasteFormulaMenuItemFactory(accessor: IAccessor): IMenuItem {
    return {
        id: SheetOnlyPasteFormulaCommand.id,
        type: MenuItemType.BUTTON,
        title: 'formula.operation.pasteFormula',
        disabled$: menuClipboardDisabledObservable(accessor).pipe(
            combineLatestWith(getCurrentRangeDisable$(accessor, {
                workbookTypes: [WorkbookEditablePermission],
                rangeTypes: [RangeProtectionPermissionEditPoint],
                worksheetTypes: [WorksheetSetCellValuePermission, WorksheetEditPermission],
            })),
            map(([d1, d2]) => d1 || d2)
        ),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}
