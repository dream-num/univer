import { BorderStyleManagerService, IBorderInfo, SetBorderBasicCommand } from '@univerjs/sheets';
import { IMenuSelectorItem, MenuGroup, MenuItemType, MenuPosition } from '@univerjs/ui';
import { ICommandService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';
import { Observable } from 'rxjs';

import { BORDER_LINE_CHILDREN, BORDER_PANEL_COMPONENT } from '../../components/border-panel/interface';

export function CellBorderSelectorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<IBorderInfo, IBorderInfo> {
    // const permissionService = accessor.get(IPermissionService);

    const borderStyleManagerService = accessor.get(BorderStyleManagerService);
    return {
        id: SetBorderBasicCommand.id,
        icon: new Observable<string>((subscriber) => {
            const defaultIcon = 'AllBorderSingle';
            const borderManager = accessor.get(BorderStyleManagerService);

            const disposable = accessor.get(ICommandService).onCommandExecuted((c) => {
                const id = c.id;
                if (id !== SetBorderBasicCommand.id) {
                    return;
                }

                const { type } = borderManager.getBorderInfo();

                const item = BORDER_LINE_CHILDREN.find((item) => item.value === type);

                const icon = item?.icon ?? defaultIcon;

                subscriber.next(icon);
            });

            subscriber.next(defaultIcon);

            return disposable.dispose;
        }),
        group: MenuGroup.TOOLBAR_FORMAT,
        tooltip: 'toolbar.border.main',
        positions: [MenuPosition.TOOLBAR_START],
        type: MenuItemType.BUTTON_SELECTOR,
        selections: [
            {
                label: {
                    name: BORDER_PANEL_COMPONENT,
                    hoverable: false,
                },
                value$: borderStyleManagerService.borderInfo$,
            },
        ],
        value$: borderStyleManagerService.borderInfo$,
    };
}
