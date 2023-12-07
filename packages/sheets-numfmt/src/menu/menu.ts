import { ICommandService, IUniverInstanceService, LocaleService } from '@univerjs/core';
import { AddDigitsSingle, MoreDownSingle, ReduceDigitsSingle, RmbSingle } from '@univerjs/icons';
import { INumfmtService, SelectionManagerService, SetNumfmtMutation } from '@univerjs/sheets';
import type { ComponentManager, IMenuSelectorItem } from '@univerjs/ui';
import { MenuGroup, MenuItemType, MenuPosition } from '@univerjs/ui';
import type { IAccessor } from '@wendellhu/redi';
import { merge, Observable } from 'rxjs';

import { MENU_OPTIONS } from '../base/const/MENU-OPTIONS';
import { AddDecimalCommand } from '../commands/commands/add.decimal.command';
import { SetCurrencyCommand } from '../commands/commands/set.currency.command';
import { SubtractDecimalCommand } from '../commands/commands/subtract.decimal.command';
import { OpenNumfmtPanelOperator } from '../commands/operators/open.numfmt.panel.operator';
import { MoreNumfmtType, Options } from '../components/more-numfmt-type/MoreNumfmtType';
import { isPatternEqualWithoutDecimal } from '../utils/decimal';

export const CurrencyMenuItem = (componentManager: ComponentManager) => {
    const iconKey = 'icon-rmbSingle';
    componentManager.register(iconKey, RmbSingle);
    componentManager.register('MoreDownSingle', MoreDownSingle);
    return () => ({
        icon: iconKey,
        id: SetCurrencyCommand.id,
        title: 'sheet.numfmt.currency',
        tooltip: 'sheet.numfmt.currency',
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
        title: 'sheet.numfmt.addDecimal',
        tooltip: 'sheet.numfmt.addDecimal',
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
        title: 'sheet.numfmt.subtractDecimal',
        tooltip: 'sheet.numfmt.subtractDecimal',
        type: MenuItemType.BUTTON,
        group: MenuGroup.TOOLBAR_FORMULAS_INSERT,
        positions: [MenuPosition.TOOLBAR_START],
    });
};

export const FactoryOtherMenuItem = (componentManager: ComponentManager) => {
    const moreTypeKey = 'sheet.numfmt.moreNumfmtType';
    const optionsKey = 'sheet.numfmt.moreNumfmtType.options';

    componentManager.register(moreTypeKey, MoreNumfmtType);
    componentManager.register(optionsKey, Options);

    return (_accessor: IAccessor) => {
        const numfmtService = _accessor.get(INumfmtService);
        const univerInstanceService = _accessor.get(IUniverInstanceService);
        const commandService = _accessor.get(ICommandService);
        const localeService = _accessor.get(LocaleService);

        const selectionManagerService = _accessor.get(SelectionManagerService);
        const value$ = new Observable((subscribe) =>
            merge(
                selectionManagerService.selectionMoveEnd$,
                new Observable<null>((commandSubscribe) => {
                    const disposable = commandService.onCommandExecuted((commandInfo) => {
                        if (commandInfo.id === SetNumfmtMutation.id) {
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
                    let value: string = localeService.t('sheet.numfmt.general');

                    if (numfmtValue) {
                        const pattern = numfmtValue.pattern;
                        const item = MENU_OPTIONS.filter((item) => typeof item === 'object' && item.pattern).find(
                            (item) => isPatternEqualWithoutDecimal(pattern, (item as { pattern: string }).pattern)
                        );
                        if (item && typeof item === 'object' && item.pattern) {
                            value = localeService.t(item.label);
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
        } as IMenuSelectorItem;
    };
};
