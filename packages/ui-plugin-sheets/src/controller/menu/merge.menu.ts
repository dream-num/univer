import {
    AddWorksheetMergeAllCommand,
    AddWorksheetMergeCommand,
    AddWorksheetMergeHorizontalCommand,
    AddWorksheetMergeVerticalCommand,
    RemoveWorksheetMergeCommand,
} from '@univerjs/base-sheets';
import {
    DisplayTypes,
    IMenuButtonItem,
    IMenuSelectorItem,
    MenuItemType,
    MenuPosition,
    SelectTypes,
} from '@univerjs/base-ui';
import { ICommandService, IPermissionService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

export const MERGE_CHILDREN = [
    {
        label: 'merge.all',
        value: 'all',
    },
    {
        label: 'merge.vertical',
        value: 'vertical',
    },
    {
        label: 'merge.horizontal',
        value: 'horizontal',
    },
    {
        label: 'merge.cancel',
        value: 'cancel',
    },
];

// export function CellMergeSelectorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
//     const permissionService = accessor.get(IPermissionService);
//     const commandService = accessor.get(ICommandService);

//     return {
//         id: AddWorksheetMergeCommand.id,
//         title: 'merge',
//         icon: 'MergeIcon',
//         display: DisplayTypes.ICON,
//         positions: [MenuPosition.TOOLBAR],
//         type: MenuItemType.SELECTOR,
//         selectType: SelectTypes.NEO,
//         selections: [...MERGE_CHILDREN],
//     };
// }

export function CellMergeMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    const permissionService = accessor.get(IPermissionService);
    const commandService = accessor.get(ICommandService);

    return {
        id: AddWorksheetMergeCommand.id,
        title: 'merge',
        icon: 'MergeIcon',
        tooltip: 'toolbar.mergeCell.main',
        display: DisplayTypes.ICON,
        positions: [MenuPosition.TOOLBAR],
        type: MenuItemType.SUBITEMS,
        selectType: SelectTypes.NEO,
        // selections: [...MERGE_CHILDREN],
    };
}
export function CellMergeAllMenuItemFactory(accessor: IAccessor): IMenuButtonItem<string> {
    const permissionService = accessor.get(IPermissionService);
    const commandService = accessor.get(ICommandService);

    return {
        id: AddWorksheetMergeAllCommand.id,
        type: MenuItemType.BUTTON,
        title: 'merge.all',
        positions: [AddWorksheetMergeCommand.id],
    };
}
export function CellMergeVerticalMenuItemFactory(accessor: IAccessor): IMenuButtonItem<string> {
    const permissionService = accessor.get(IPermissionService);
    const commandService = accessor.get(ICommandService);

    return {
        id: AddWorksheetMergeVerticalCommand.id,
        type: MenuItemType.BUTTON,
        title: 'merge.vertical',
        positions: [AddWorksheetMergeCommand.id],
    };
}
export function CellMergeHorizontalMenuItemFactory(accessor: IAccessor): IMenuButtonItem<string> {
    const permissionService = accessor.get(IPermissionService);
    const commandService = accessor.get(ICommandService);

    return {
        id: AddWorksheetMergeHorizontalCommand.id,
        type: MenuItemType.BUTTON,
        title: 'merge.horizontal',
        positions: [AddWorksheetMergeCommand.id],
    };
}
export function CellMergeCancelMenuItemFactory(accessor: IAccessor): IMenuButtonItem<string> {
    const permissionService = accessor.get(IPermissionService);
    const commandService = accessor.get(ICommandService);

    return {
        id: RemoveWorksheetMergeCommand.id,
        type: MenuItemType.BUTTON,
        title: 'merge.cancel',
        positions: [AddWorksheetMergeCommand.id],
    };
}
