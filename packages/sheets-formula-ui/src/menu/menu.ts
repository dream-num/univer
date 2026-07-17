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
import type { LocaleKey } from '../locale/types';
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
import {
    SheetCopyFormulaOnlyCommand,
    SheetOnlyPasteFormulaCommand,
} from '../commands/commands/formula-clipboard.command';
import { InsertFunctionOperation } from '../commands/operations/insert-function.operation';
import { MoreFunctionsOperation } from '../commands/operations/more-functions.operation';

type FunctionCategoryKey =
    | 'financial'
    | 'logical'
    | 'text'
    | 'date'
    | 'lookup'
    | 'math'
    | 'statistical'
    | 'engineering'
    | 'information'
    | 'database';

type EnsureLocaleKey<T extends LocaleKey> = T;
type FunctionCategoryLocaleKey = EnsureLocaleKey<`sheets-formula-ui.functionType.${FunctionCategoryKey}`>;

export function InsertCommonFunctionMenuItemFactory(accessor: IAccessor): IMenuItem<LocaleKey> {
    const commonFunctions = ['SUMIF', 'SUM', 'AVERAGE', 'IF', 'COUNT', 'SIN', 'MAX'];
    let selections: IValueOption<LocaleKey>[] = commonFunctions.map((name) => ({
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
        title: 'sheets-formula-ui.insert.common',
        tooltip: 'sheets-formula-ui.insert.tooltip',
        icon: 'FunctionIcon',
        type: MenuItemType.SELECTOR,
        selections,
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}

function createInsertFunctionCategoryMenuItemFactory(
    functionType: FunctionType,
    categoryKey: FunctionCategoryKey,
    icon?: string
) {
    return function insertFunctionCategoryMenuItemFactory(accessor: IAccessor): IMenuItem<LocaleKey> {
        let selections: IValueOption<LocaleKey>[] = [];

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

        const localeKey = `sheets-formula-ui.functionType.${categoryKey}` as FunctionCategoryLocaleKey;

        return {
            id: `${InsertFunctionOperation.id}.${categoryKey}`,
            commandId: InsertFunctionOperation.id,
            title: localeKey,
            tooltip: localeKey,
            icon,
            type: MenuItemType.SELECTOR,
            selections,
            hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        };
    };
}

export const InsertFinancialFunctionMenuItemFactory = createInsertFunctionCategoryMenuItemFactory(FunctionType.Financial, 'financial', 'FinancialFunctionIcon');
export const InsertLogicalFunctionMenuItemFactory = createInsertFunctionCategoryMenuItemFactory(FunctionType.Logical, 'logical', 'LogicalFunctionIcon');
export const InsertTextFunctionMenuItemFactory = createInsertFunctionCategoryMenuItemFactory(FunctionType.Text, 'text', 'TextFunctionIcon');
export const InsertDateFunctionMenuItemFactory = createInsertFunctionCategoryMenuItemFactory(FunctionType.Date, 'date', 'DateFunctionIcon');
export const InsertLookupFunctionMenuItemFactory = createInsertFunctionCategoryMenuItemFactory(FunctionType.Lookup, 'lookup', 'LookupFunctionIcon');
export const InsertMathFunctionMenuItemFactory = createInsertFunctionCategoryMenuItemFactory(FunctionType.Math, 'math', 'MathFunctionIcon');
export const InsertStatisticalFunctionMenuItemFactory = createInsertFunctionCategoryMenuItemFactory(FunctionType.Statistical, 'statistical', 'StatisticalFunctionIcon');
export const InsertEngineeringFunctionMenuItemFactory = createInsertFunctionCategoryMenuItemFactory(FunctionType.Engineering, 'engineering', 'EngineeringFunctionIcon');
export const InsertInformationFunctionMenuItemFactory = createInsertFunctionCategoryMenuItemFactory(FunctionType.Information, 'information', 'InformationFunctionIcon');
export const InsertDatabaseFunctionMenuItemFactory = createInsertFunctionCategoryMenuItemFactory(FunctionType.Database, 'database', 'DatabaseFunctionIcon');

// All Functions entry displayed at the bottom of category dropdowns.
export function AllFunctionsMenuItemFactory(accessor: IAccessor): IMenuItem<LocaleKey> {
    return {
        id: MoreFunctionsOperation.id,
        title: 'sheets-formula-ui.moreFunctions.allFunctions',
        tooltip: 'sheets-formula-ui.insert.tooltip',
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
export function CopyFormulaOnlyMenuItemFactory(accessor: IAccessor): IMenuItem<LocaleKey> {
    return {
        id: SheetCopyFormulaOnlyCommand.id,
        type: MenuItemType.BUTTON,
        title: 'sheets-formula-ui.operation.copyFormulaOnly',
        disabled$: getCurrentRangeDisable$(accessor, {
            workbookTypes: [WorkbookCopyPermission],
            worksheetTypes: [WorksheetCopyPermission],
            rangeTypes: [RangeProtectionPermissionViewPoint],
        }),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}

// Right click menu - Paste Formula
export function PasteFormulaMenuItemFactory(accessor: IAccessor): IMenuItem<LocaleKey> {
    return {
        id: SheetOnlyPasteFormulaCommand.id,
        type: MenuItemType.BUTTON,
        title: 'sheets-formula-ui.operation.pasteFormula',
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
