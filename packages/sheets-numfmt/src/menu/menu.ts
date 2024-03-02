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

import { ICommandService, IUniverInstanceService, LocaleService, UniverInstanceType } from '@univerjs/core';
import { AddDigitsSingle, MoreDownSingle, PercentSingle, ReduceDigitsSingle, RmbSingle } from '@univerjs/icons';
import {
    getCurrentSheetDisabled$,
    INumfmtService,
    RemoveNumfmtMutation,
    SelectionManagerService,
    SetNumfmtMutation,
} from '@univerjs/sheets';
import type { ComponentManager, IMenuSelectorItem } from '@univerjs/ui';
import { getMenuHiddenObservable, MenuGroup, MenuItemType, MenuPosition } from '@univerjs/ui';
import type { IAccessor } from '@wendellhu/redi';
import { merge, Observable } from 'rxjs';

import { FormulaDataModel } from '@univerjs/engine-formula';
import { MENU_OPTIONS } from '../base/const/MENU-OPTIONS';
import { AddDecimalCommand } from '../commands/commands/add-decimal.command';
import { SetCurrencyCommand } from '../commands/commands/set-currency.command';
import { SubtractDecimalCommand } from '../commands/commands/subtract-decimal.command';
import { OpenNumfmtPanelOperator } from '../commands/operations/open.numfmt.panel.operation';
import { MoreNumfmtType, Options } from '../components/more-numfmt-type/MoreNumfmtType';
import { isPatternEqualWithoutDecimal } from '../utils/decimal';
import { SetPercentCommand } from '../commands/commands/set-percent.command';

export const CurrencyMenuItem = (componentManager: ComponentManager) => {
    const iconKey = 'icon-rmbSingle';
    componentManager.register(iconKey, RmbSingle);
    componentManager.register('MoreDownSingle', MoreDownSingle);

    return (accessor: IAccessor) => {
        return {
            icon: iconKey,
            id: SetCurrencyCommand.id,
            title: 'sheet.numfmt.currency',
            tooltip: 'sheet.numfmt.currency',
            type: MenuItemType.BUTTON,
            group: MenuGroup.TOOLBAR_FORMULAS_INSERT,
            positions: [MenuPosition.TOOLBAR_START],
            hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.SHEET),
            disabled$: getCurrentSheetDisabled$(accessor),
        };
    };
};

export const AddDecimalMenuItem = (componentManager: ComponentManager) => {
    const iconKey = 'icon-addDigitsSingle';
    componentManager.register(iconKey, AddDigitsSingle);
    return (accessor: IAccessor) => ({
        icon: iconKey,
        id: AddDecimalCommand.id,
        title: 'sheet.numfmt.addDecimal',
        tooltip: 'sheet.numfmt.addDecimal',
        type: MenuItemType.BUTTON,
        positions: [MenuPosition.TOOLBAR_START],
        group: MenuGroup.TOOLBAR_FORMULAS_INSERT,
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.SHEET),
        disabled$: getCurrentSheetDisabled$(accessor),
    });
};
export const SubtractDecimalMenuItem = (componentManager: ComponentManager) => {
    const iconKey = 'icon-reduceDigitsSingle';
    componentManager.register(iconKey, ReduceDigitsSingle);
    return (accessor: IAccessor) => ({
        icon: iconKey,
        id: SubtractDecimalCommand.id,
        title: 'sheet.numfmt.subtractDecimal',
        tooltip: 'sheet.numfmt.subtractDecimal',
        type: MenuItemType.BUTTON,
        group: MenuGroup.TOOLBAR_FORMULAS_INSERT,
        positions: [MenuPosition.TOOLBAR_START],
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.SHEET),
        disabled$: getCurrentSheetDisabled$(accessor),
    });
};

export const PercentMenuItem = (componentManager: ComponentManager) => {
    const iconKey = 'icon-PercentSingle';
    componentManager.register(iconKey, PercentSingle);
    return (accessor: IAccessor) => ({
        icon: iconKey,
        id: SetPercentCommand.id,
        title: 'sheet.numfmt.percent',
        tooltip: 'sheet.numfmt.percent',
        type: MenuItemType.BUTTON,
        group: MenuGroup.TOOLBAR_FORMULAS_INSERT,
        positions: [MenuPosition.TOOLBAR_START],
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.SHEET),
        disabled$: getCurrentSheetDisabled$(accessor),
    });
};

export const FactoryOtherMenuItem = (componentManager: ComponentManager) => {
    const moreTypeKey = 'sheet.numfmt.moreNumfmtType';
    const optionsKey = 'sheet.numfmt.moreNumfmtType.options';

    componentManager.register(moreTypeKey, MoreNumfmtType);
    componentManager.register(optionsKey, Options);

    return (_accessor: IAccessor) => {
        const numfmtService = _accessor.get(INumfmtService);
        const formulaDataModel = _accessor.get(FormulaDataModel);
        const univerInstanceService = _accessor.get(IUniverInstanceService);
        const commandService = _accessor.get(ICommandService);
        const localeService = _accessor.get(LocaleService);

        const selectionManagerService = _accessor.get(SelectionManagerService);
        const value$ = new Observable((subscribe) =>
            merge(
                selectionManagerService.selectionMoveEnd$,
                new Observable<null>((commandSubscribe) => {
                    const commandList = [RemoveNumfmtMutation.id, SetNumfmtMutation.id];
                    const disposable = commandService.onCommandExecuted((commandInfo) => {
                        if (commandList.includes(commandInfo.id)) {
                            commandSubscribe.next(null);
                        }
                    });
                    return () => disposable.dispose();
                })
            ).subscribe(() => {
                const selections = selectionManagerService.getSelections();
                if (selections && selections[0]) {
                    const workbook = univerInstanceService.getCurrentUniverSheetInstance();
                    const worksheet = workbook.getActiveSheet();
                    const range = selections[0].range;
                    const row = range.startRow;
                    const col = range.startColumn;

                    const numfmtValue = numfmtService.getValue(workbook.getUnitId(), worksheet.getSheetId(), row, col);
                    const numfmtValueByFormula = formulaDataModel.getNumfmtValue(workbook.getUnitId(), worksheet.getSheetId(), row, col);

                    const pattern = numfmtValue?.pattern || numfmtValueByFormula;
                    let value: string = localeService.t('sheet.numfmt.general');

                    if (pattern) {
                        const item = MENU_OPTIONS.filter((item) => typeof item === 'object' && item.pattern).find(
                            (item) => isPatternEqualWithoutDecimal(pattern, (item as { pattern: string }).pattern)
                        );
                        if (item && typeof item === 'object' && item.pattern) {
                            value = localeService.t(item.label);
                        } else {
                            value = localeService.t('sheet.numfmt.moreFmt');
                        }
                    }
                    subscribe.next(value);
                }
            })
        );

        return {
            // icon: 'MoreDownSingle',
            label: moreTypeKey,
            id: OpenNumfmtPanelOperator.id,
            tooltip: 'sheet.numfmt.title',
            type: MenuItemType.SELECTOR,
            group: MenuGroup.TOOLBAR_FORMULAS_INSERT,
            positions: [MenuPosition.TOOLBAR_START],
            selections: [
                {
                    label: {
                        name: optionsKey,
                        hoverable: false,
                    },
                },
            ],
            value$,
            hidden$: getMenuHiddenObservable(_accessor, UniverInstanceType.SHEET),
            disabled$: getCurrentSheetDisabled$(_accessor),
        } as IMenuSelectorItem;
    };
};
