import { SelectionManagerService } from '@univerjs/base-sheets';
import {
    ComponentManager,
    IMenuItem,
    IMenuService,
    IValueOption,
    MenuGroup,
    MenuItemType,
    MenuPosition,
} from '@univerjs/base-ui';
import { IUniverInstanceService } from '@univerjs/core';
import { AddDigitsSingle, ReduceDigitsSingle, RmbSingle } from '@univerjs/icons';
import { IAccessor } from '@wendellhu/redi';
import { Observable } from 'rxjs';

import { AddDecimalCommand } from '../commands/commands/add.decimal.command';
import { PreviewCommand } from '../commands/commands/preview.command';
import { SetCurrencyOperator } from '../commands/commands/set.currency.command';
import { SubtractDecimalCommand } from '../commands/commands/subtract.decimal.command';
import { isAccountingPanel } from '../components/accounting';
import { isCurrencyPanel } from '../components/currency';
import { isDatePanel } from '../components/date';
import { isGeneralPanel } from '../components/general';
import { NumfmtService } from '../service/numfmt.service';
import { getCurrencyType } from '../utils/currency';
import { getCurrencyFormatOptions, getDateFormatOptions, getNumberFormatOptions } from '../utils/options';

export const CurrencyMenuItem = (componentManager: ComponentManager) => {
    const iconKey = 'icon-rmbSingle';
    componentManager.register(iconKey, RmbSingle);
    return (_accessor: IAccessor) => ({
        icon: iconKey,
        id: SetCurrencyOperator.id,
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
    return (_accessor: IAccessor) => ({
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
    return (_accessor: IAccessor) => ({
        icon: iconKey,
        id: SubtractDecimalCommand.id,
        title: 'numfmt.menu.subtract.decimal',
        tooltip: 'numfmt.menu.subtract.decimal',
        type: MenuItemType.BUTTON,
        group: MenuGroup.TOOLBAR_FORMULAS_INSERT,
        positions: [MenuPosition.TOOLBAR_START],
    });
};

export const FactoryOtherMenuItem = (_accessor: IAccessor) => {
    const menuService = _accessor.get(IMenuService);
    const numfmtService = _accessor.get(NumfmtService);
    const univerInstanceService = _accessor.get(IUniverInstanceService);

    const selectionManagerService = _accessor.get(SelectionManagerService);
    const selection$ = new Observable((subscribe) => {
        selectionManagerService.selectionInfo$.subscribe((selections) => {
            if (selections && selections[0]) {
                const workbook = univerInstanceService.getCurrentUniverSheetInstance();
                const worksheet = workbook.getActiveSheet();
                const range = selections[0].range;
                const row = range.startRow;
                const col = range.startColumn;
                const numfmtValue = numfmtService.getValue(workbook.getUnitId(), worksheet.getSheetId(), row, col);
                if (numfmtValue) {
                    const pattern = numfmtValue.pattern;
                    let selection: IValueOption[] = [];
                    if (isAccountingPanel(pattern) || isCurrencyPanel(pattern)) {
                        const currencyType = getCurrencyType(pattern);
                        selection = getCurrencyFormatOptions(currencyType!);
                    }

                    if (isDatePanel(pattern)) {
                        selection = getDateFormatOptions();
                    }
                    if (isGeneralPanel(pattern)) {
                        selection = getNumberFormatOptions();
                    }
                    subscribe.next(selection);
                }
                subscribe.next([]);
            }
        });
        subscribe.next([]);
    });
    return {
        id: PreviewCommand.id,
        title: 'numfmt.menu.preview',
        tooltip: 'numfmt.menu.preview',
        type: MenuItemType.SELECTOR,
        group: MenuGroup.TOOLBAR_FORMULAS_INSERT,
        positions: [MenuPosition.TOOLBAR_START],
        selections: selection$,
    } as IMenuItem;
};
