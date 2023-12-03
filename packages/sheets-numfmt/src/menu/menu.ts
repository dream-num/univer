import { INumfmtService, SelectionManagerService } from '@univerjs/sheets';
import type { ComponentManager, IMenuButtonItem } from '@univerjs/ui';
import { MenuGroup, MenuItemType, MenuPosition } from '@univerjs/ui';
import { IUniverInstanceService } from '@univerjs/core';
import { AddDigitsSingle, MoreDownSingle, ReduceDigitsSingle, RmbSingle } from '@univerjs/icons';
import type { IAccessor } from '@wendellhu/redi';
import { Observable } from 'rxjs';

import { AddDecimalCommand } from '../commands/commands/add.decimal.command';
import { SetCurrencyCommand } from '../commands/commands/set.currency.command';
import { SubtractDecimalCommand } from '../commands/commands/subtract.decimal.command';
import { OpenNumfmtPanelOperator } from '../commands/operators/open.numfmt.panel.operator';
import { isAccountingPanel } from '../components/accounting';
import { isCurrencyPanel } from '../components/currency';
import { isDatePanel } from '../components/date';
import { MoreNumfmtType } from '../components/more-numfmt-type/MoreNumfmtType';
import { isThousandthPercentilePanel } from '../components/thousandth-percentile';

export const CurrencyMenuItem = (componentManager: ComponentManager) => {
    const iconKey = 'icon-rmbSingle';
    componentManager.register(iconKey, RmbSingle);
    componentManager.register('MoreDownSingle', MoreDownSingle);
    return () => ({
        icon: iconKey,
        id: SetCurrencyCommand.id,
        title: 'numfmt.menu.currency',
        tooltip: 'numfmt.menu.currency',
        type: MenuItemType.BUTTON,
        group: MenuGroup.TOOLBAR_FORMULAS_INSERT,
        positions: [MenuPosition.TOOLBAR_START],
    });
};

export const AddDecimalMenuItem = (componentManager: ComponentManager) => {
    const iconKey = 'icon-addDigitsSingle';
    componentManager.register(iconKey, AddDigitsSingle);
    return () => ({
        icon: iconKey,
        id: AddDecimalCommand.id,
        title: 'numfmt.menu.add.decimal',
        tooltip: 'numfmt.menu.add.decimal',
        type: MenuItemType.BUTTON,
        positions: [MenuPosition.TOOLBAR_START],
        group: MenuGroup.TOOLBAR_FORMULAS_INSERT,
    });
};
export const SubtractDecimalMenuItem = (componentManager: ComponentManager) => {
    const iconKey = 'icon-reduceDigitsSingle';
    componentManager.register(iconKey, ReduceDigitsSingle);
    return () => ({
        icon: iconKey,
        id: SubtractDecimalCommand.id,
        title: 'numfmt.menu.subtract.decimal',
        tooltip: 'numfmt.menu.subtract.decimal',
        type: MenuItemType.BUTTON,
        group: MenuGroup.TOOLBAR_FORMULAS_INSERT,
        positions: [MenuPosition.TOOLBAR_START],
    });
};

export const FactoryOtherMenuItem = (componentManager: ComponentManager) => {
    componentManager.register('sheet.numfmt.moreNumfmtType', MoreNumfmtType);
    return (_accessor: IAccessor) => {
        const numfmtService = _accessor.get(INumfmtService);
        const univerInstanceService = _accessor.get(IUniverInstanceService);
        const selectionManagerService = _accessor.get(SelectionManagerService);
        const value$ = new Observable((subscribe) =>
            selectionManagerService.selectionInfo$.subscribe((selections) => {
                if (selections && selections[0]) {
                    const workbook = univerInstanceService.getCurrentUniverSheetInstance();
                    const worksheet = workbook.getActiveSheet();
                    const range = selections[0].range;
                    const row = range.startRow;
                    const col = range.startColumn;
                    const numfmtValue = numfmtService.getValue(workbook.getUnitId(), worksheet.getSheetId(), row, col);
                    let value: string = '常规';

                    if (numfmtValue) {
                        const pattern = numfmtValue.pattern;
                        if (isAccountingPanel(pattern)) {
                            value = '会计';
                        }

                        if (isCurrencyPanel(pattern)) {
                            value = '货币';
                        }

                        if (isDatePanel(pattern)) {
                            value = '日期';
                        }
                        if (isThousandthPercentilePanel(pattern)) {
                            value = '千分位';
                        }
                    }
                    subscribe.next(value);
                }
            })
        );
        return {
            // icon: 'MoreDownSingle',
            label: 'sheet.numfmt.moreNumfmtType',
            id: OpenNumfmtPanelOperator.id,
            // title: 'numfmt.menu.preview',
            tooltip: 'numfmt.menu.preview',
            type: MenuItemType.BUTTON,
            group: MenuGroup.TOOLBAR_FORMULAS_INSERT,
            positions: [MenuPosition.TOOLBAR_START],
            value$,
        } as IMenuButtonItem;
    };
};
