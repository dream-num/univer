import {
    AddWorksheetMergeAllCommand,
    AddWorksheetMergeCommand,
    AddWorksheetMergeHorizontalCommand,
    AddWorksheetMergeVerticalCommand,
    RemoveWorksheetMergeCommand,
} from '@univerjs/sheets';
import type { IMenuButtonItem, IMenuSelectorItem } from '@univerjs/ui';
import { MenuGroup, MenuItemType, MenuPosition } from '@univerjs/ui';
import type { IAccessor } from '@wendellhu/redi';

export function CellMergeMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    return {
        id: AddWorksheetMergeCommand.id,
        icon: 'MergeAllSingle',
        tooltip: 'toolbar.mergeCell.main',
        positions: [MenuPosition.TOOLBAR_START],
        group: MenuGroup.TOOLBAR_LAYOUT,
        type: MenuItemType.SUBITEMS,
        // selections: [...MERGE_CHILDREN],
    };
}
export function CellMergeAllMenuItemFactory(accessor: IAccessor): IMenuButtonItem<string> {
    return {
        id: AddWorksheetMergeAllCommand.id,
        type: MenuItemType.BUTTON,
        title: 'merge.all',
        icon: 'MergeAllSingle',
        positions: [AddWorksheetMergeCommand.id],
    };
}
export function CellMergeVerticalMenuItemFactory(accessor: IAccessor): IMenuButtonItem<string> {
    return {
        id: AddWorksheetMergeVerticalCommand.id,
        type: MenuItemType.BUTTON,
        title: 'merge.vertical',
        icon: 'VerticalIntegrationSingle',
        positions: [AddWorksheetMergeCommand.id],
    };
}
export function CellMergeHorizontalMenuItemFactory(accessor: IAccessor): IMenuButtonItem<string> {
    return {
        id: AddWorksheetMergeHorizontalCommand.id,
        type: MenuItemType.BUTTON,
        title: 'merge.horizontal',
        icon: 'HorizontalMergeSingle',
        positions: [AddWorksheetMergeCommand.id],
    };
}
export function CellMergeCancelMenuItemFactory(accessor: IAccessor): IMenuButtonItem<string> {
    return {
        id: RemoveWorksheetMergeCommand.id,
        type: MenuItemType.BUTTON,
        title: 'merge.cancel',
        icon: 'CancelMergeSingle',
        positions: [AddWorksheetMergeCommand.id],
    };
}
