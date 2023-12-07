import { IUniverInstanceService } from '@univerjs/core';
import { SheetPermissionService } from '@univerjs/sheets';
import type { IMenuItem } from '@univerjs/ui';
import { MenuGroup, MenuItemType, MenuPosition } from '@univerjs/ui';
import type { IAccessor } from '@wendellhu/redi';
import { Observable } from 'rxjs';

import { DataConnectorSidebarOperation } from '../commands/operations/data-connector-sidebar.operation';

export function DataConnectorSidebarMenuItemFactory(accessor: IAccessor): IMenuItem {
    const sheetPermissionService = accessor.get(SheetPermissionService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const workbookId = univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
    const sheetId = univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet().getSheetId();
    return {
        id: DataConnectorSidebarOperation.id,
        group: MenuGroup.TOOLBAR_OTHERS,
        type: MenuItemType.BUTTON,
        icon: 'PipingSingle',
        title: 'Open Data Connector',
        tooltip: 'dataConnector.insert.tooltip',
        positions: [MenuPosition.TOOLBAR_START],
        disabled$: new Observable<boolean>((subscriber) => {
            const permission$ = sheetPermissionService.getEditable$(workbookId, sheetId)?.subscribe((e) => {
                subscriber.next(!e.value);
            });
            return () => {
                permission$?.unsubscribe();
            };
        }),
    };
}
