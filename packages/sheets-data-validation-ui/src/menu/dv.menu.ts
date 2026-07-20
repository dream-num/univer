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
import type { IMenuItem, IMenuSelectorItem } from '@univerjs/ui';
import type { IQuickDataValidationRuleInput } from '../commands/commands/data-validation-ui.command';
import type { LocaleKey } from '../locale/types';
import { DataValidationRenderMode, DataValidationType, LocaleService, UniverInstanceType } from '@univerjs/core';
import {
    RangeProtectionPermissionEditPoint,
    serializeListOptions,
    WorkbookEditablePermission,
    WorksheetEditPermission,
    WorksheetSetCellStylePermission,
} from '@univerjs/sheets';
import { getCurrentRangeDisable$ } from '@univerjs/sheets-ui';
import { getMenuHiddenObservable, MenuItemType } from '@univerjs/ui';
import {
    AddSheetDataValidationAndOpenCommand,
    ClearQuickSheetDataValidationCommand,
    InsertQuickSheetDataValidationCommand,
} from '../commands/commands/data-validation-ui.command';
import { OpenValidationPanelOperation } from '../commands/operations/data-validation.operation';
import { DROPDOWN_PRESETS_COMPONENT } from '../views/components/DropdownPresets';

export const DATA_VALIDATION_MENU_ID = 'sheet.menu.data-validation';
export const QUICK_DROPDOWN_MENU_ID = 'sheet.menu.quick-dropdown';
export const QUICK_DATE_MENU_ID = 'sheet.menu.quick-date';

const CHECKBOX_RULE_INPUT: IQuickDataValidationRuleInput = {
    type: DataValidationType.CHECKBOX,
    operator: undefined,
    formula1: undefined,
    formula2: undefined,
};

const DATE_RULE_INPUT: IQuickDataValidationRuleInput = {
    type: DataValidationType.DATE,
    operator: undefined,
    formula1: undefined,
    formula2: undefined,
};

const DATE_TIME_RULE_INPUT: IQuickDataValidationRuleInput = {
    ...DATE_RULE_INPUT,
    bizInfo: { showTime: true },
};

function createDropdownRuleInput(formula1: string): IQuickDataValidationRuleInput {
    return {
        type: DataValidationType.LIST,
        operator: undefined,
        formula1,
        formula2: '',
        renderMode: DataValidationRenderMode.CUSTOM,
    };
}

function createDropdownCommandParams(value?: string | number) {
    return typeof value === 'undefined' ? {} : { rule: createDropdownRuleInput(String(value)) };
}

function getQuickDataValidationMenuState(accessor: IAccessor) {
    return {
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        disabled$: getCurrentRangeDisable$(accessor, {
            workbookTypes: [WorkbookEditablePermission],
            worksheetTypes: [WorksheetSetCellStylePermission, WorksheetEditPermission],
            rangeTypes: [RangeProtectionPermissionEditPoint],
        }),
    };
}

export function dataValidationMenuFactory(accessor: IAccessor): IMenuItem<LocaleKey> {
    return {
        id: DATA_VALIDATION_MENU_ID,
        type: MenuItemType.SUBITEMS,
        icon: 'DataValidationIcon',
        tooltip: 'sheets-data-validation-ui.title',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        disabled$: getCurrentRangeDisable$(accessor, {
            workbookTypes: [WorkbookEditablePermission],
            worksheetTypes: [WorksheetSetCellStylePermission, WorksheetEditPermission],
            rangeTypes: [RangeProtectionPermissionEditPoint],
        }),
    };
}

export function quickCheckboxMenuFactory(accessor: IAccessor): IMenuSelectorItem<LocaleKey> {
    return {
        id: InsertQuickSheetDataValidationCommand.id,
        type: MenuItemType.BUTTON_SELECTOR,
        icon: 'CheckboxIcon',
        tooltip: 'sheets-data-validation-ui.checkbox.title',
        params: { rule: CHECKBOX_RULE_INPUT },
        selectionsCommandId: InsertQuickSheetDataValidationCommand.id,
        selections: [
            {
                label: 'sheets-data-validation-ui.ribbon.setCheckbox',
                value: DataValidationType.CHECKBOX,
                params: { rule: CHECKBOX_RULE_INPUT },
            },
            {
                label: 'sheets-data-validation-ui.ribbon.clearCheckbox',
                id: ClearQuickSheetDataValidationCommand.id,
                value: DataValidationType.CHECKBOX,
                params: { types: [DataValidationType.CHECKBOX] },
            },
        ],
        ...getQuickDataValidationMenuState(accessor),
    };
}

export function quickDropdownMenuFactory(accessor: IAccessor): IMenuSelectorItem<LocaleKey> {
    const localeService = accessor.get(LocaleService);
    const editDropdownValue = serializeListOptions([
        localeService.t<LocaleKey>('sheets-data-validation-ui.ribbon.presets.option1'),
        localeService.t<LocaleKey>('sheets-data-validation-ui.ribbon.presets.option2'),
    ]);

    return {
        id: QUICK_DROPDOWN_MENU_ID,
        type: MenuItemType.SUBITEMS,
        icon: 'DropdownListIcon',
        tooltip: 'sheets-data-validation-ui.list.title',
        selectionsCommandId: InsertQuickSheetDataValidationCommand.id,
        selections: [
            {
                label: {
                    name: DROPDOWN_PRESETS_COMPONENT,
                    hoverable: false,
                    selectable: false,
                },
                params: createDropdownCommandParams,
            },
            {
                id: AddSheetDataValidationAndOpenCommand.id,
                label: 'sheets-data-validation-ui.ribbon.editDropdown',
                value: editDropdownValue,
                params: { rule: createDropdownRuleInput(editDropdownValue) },
            },
            {
                id: ClearQuickSheetDataValidationCommand.id,
                label: 'sheets-data-validation-ui.ribbon.clearDropdown',
                value: DataValidationType.LIST,
                params: { types: [DataValidationType.LIST, DataValidationType.LIST_MULTIPLE] },
            },
        ],
        ...getQuickDataValidationMenuState(accessor),
    };
}

export function quickDateMenuFactory(accessor: IAccessor): IMenuSelectorItem<LocaleKey> {
    return {
        id: QUICK_DATE_MENU_ID,
        commandId: InsertQuickSheetDataValidationCommand.id,
        type: MenuItemType.BUTTON_SELECTOR,
        icon: 'DatePickerIcon',
        tooltip: 'sheets-data-validation-ui.date.title',
        params: { rule: DATE_RULE_INPUT },
        selectionsCommandId: InsertQuickSheetDataValidationCommand.id,
        selections: [
            {
                label: 'sheets-data-validation-ui.date.title',
                value: DataValidationType.DATE,
                params: { rule: DATE_RULE_INPUT },
            },
            {
                label: 'sheets-data-validation-ui.ribbon.dateTime',
                value: DataValidationType.DATE,
                params: { rule: DATE_TIME_RULE_INPUT },
            },
            {
                id: AddSheetDataValidationAndOpenCommand.id,
                label: 'sheets-data-validation-ui.list.edit',
                value: DataValidationType.DATE,
                params: { rule: DATE_RULE_INPUT },
            },
            {
                id: ClearQuickSheetDataValidationCommand.id,
                label: 'sheets-data-validation-ui.panel.removeRule',
                value: DataValidationType.DATE,
                params: { types: [DataValidationType.DATE] },
            },
        ],
        ...getQuickDataValidationMenuState(accessor),
    };
}

export function openDataValidationMenuFactory(): IMenuItem<LocaleKey> {
    return {
        id: OpenValidationPanelOperation.id,
        title: 'sheets-data-validation-ui.panel.title',
        type: MenuItemType.BUTTON,
    };
}

export function addDataValidationMenuFactory(): IMenuItem<LocaleKey> {
    return {
        id: AddSheetDataValidationAndOpenCommand.id,
        title: 'sheets-data-validation-ui.panel.add',
        type: MenuItemType.BUTTON,
    };
}
