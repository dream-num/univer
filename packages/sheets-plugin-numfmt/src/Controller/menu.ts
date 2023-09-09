import { ISelectionManager } from '@univerjs/base-sheets';
import { DisplayTypes, IMenuSelectorItem, MenuItemType, MenuPosition, SelectTypes } from '@univerjs/base-ui';
import { ICommandService, IPermissionService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { DEFAULT_DATA, MORE_FORMATS_SELECTIONS } from '../Basics/Const/DEFAULT_DATA';
import { SetNumfmtRangeDataCommand } from '../commands/commands/set-numfmt-range-data.command';
import { ShowModalOperation } from '../commands/operations/show-modal.operation';

export function NumfmtRangeDataMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    const permissionService = accessor.get(IPermissionService);
    const commandService = accessor.get(ICommandService);
    const selectionManager = accessor.get(ISelectionManager);

    return {
        id: SetNumfmtRangeDataCommand.id,
        title: 'toolbar.moreFormats',
        tooltip: 'toolbar.moreFormats',
        selectType: SelectTypes.NEO,
        type: MenuItemType.SELECTOR,
        display: DisplayTypes.CUSTOM,
        // display: DisplayTypes.FONT,
        positions: [MenuPosition.TOOLBAR],
        selections: DEFAULT_DATA,
        // disabled$: new Observable((subscriber) => {
        //     let editable = false;
        //     function update() {
        //         subscriber.next(!editable);
        //     }

        //     update();

        //     const permission$ = permissionService.editable$.subscribe((e) => {
        //         editable = e;
        //         update();
        //     });

        //     return () => {
        //         permission$.unsubscribe();
        //     };
        // }),
        // value$: new Observable((subscriber) => {
        //     const defaultValue = FONT_FAMILY_CHILDREN[0].value;

        //     const disposable = commandService.onCommandExecuted((c) => {
        //         const id = c.id;
        //         if (id !== SetRangeStyleMutation.id && id !== SetSelectionsOperation.id) {
        //             return;
        //         }

        //         const range = selectionManager.getCurrentCell();
        //         const ff = range?.getFontFamily();

        //         subscriber.next(ff ?? defaultValue);
        //     });

        //     subscriber.next(defaultValue);
        //     return disposable.dispose;
        // }),
    };
}

export function OpenMoreFormatsModalMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    const permissionService = accessor.get(IPermissionService);
    const commandService = accessor.get(ICommandService);
    const selectionManager = accessor.get(ISelectionManager);
    return {
        // 2. suffix
        id: ShowModalOperation.id,
        title: 'defaultFmt.CustomFormats.text',
        positions: SetNumfmtRangeDataCommand.id,
        display: DisplayTypes.LABEL,
        selectType: SelectTypes.NEO,
        type: MenuItemType.SELECTOR,
        selections: [...MORE_FORMATS_SELECTIONS],
    };
}
