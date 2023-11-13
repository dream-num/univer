import { IMenuItem, MenuGroup, MenuItemType, MenuPosition } from '@univerjs/base-ui';
import { IAccessor } from '@wendellhu/redi';

import { InsertFunctionOperation } from '../commands/operations/insert-function.operation';
import { MoreFunctionsOperation } from '../commands/operations/more-functions.operation';

export function InsertFunctionMenuItemFactory(accessor: IAccessor): IMenuItem {
    return {
        id: InsertFunctionOperation.id,
        icon: 'FunctionSingle',
        tooltip: 'formula.insert.tooltip',
        group: MenuGroup.TOOLBAR_FORMULAS_INSERT,
        type: MenuItemType.SELECTOR,
        positions: [MenuPosition.TOOLBAR_START],
        selections: [
            {
                label: 'SUM',
                value: 'SUM',
                icon: 'SumSingle',
            },
            {
                label: 'AVERAGE',
                value: 'AVERAGE',
                icon: 'AvgSingle',
            },
            {
                label: 'COUNT',
                value: 'COUNT',
                icon: 'CntSingle',
            },
            {
                label: 'MAX',
                value: 'MAX',
                icon: 'MaxSingle',
            },
            {
                label: 'MIN',
                value: 'MIN',
                icon: 'MinSingle',
            },
        ],
    };
}

export function MoreFunctionsMenuItemFactory(accessor: IAccessor): IMenuItem {
    return {
        id: MoreFunctionsOperation.id,
        title: 'formula.insert.more',
        positions: InsertFunctionOperation.id,
        type: MenuItemType.BUTTON,
    };
}
