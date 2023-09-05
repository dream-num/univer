import { ISelectionManager, SetRangeStyleMutation, SetSelectionsOperation } from "@univerjs/base-sheets";
import { IMenuSelectorItem, SelectTypes, MenuItemType, DisplayTypes, MenuPosition } from "@univerjs/base-ui";
import { IPermissionService, ICommandService, Observable } from "@univerjs/core";
import { FONT_FAMILY_CHILDREN } from "@univerjs/ui-plugin-sheets/src/View/Toolbar/Const";
import { IAccessor } from "@wendellhu/redi";
import { DEFAULT_DATA, MORE_FORMATS_SELECTIONS } from "../Basics/Const/DEFAULT_DATA";

export function NumfmtRangeDataMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    const permissionService = accessor.get(IPermissionService);
    const commandService = accessor.get(ICommandService);
    const selectionManager = accessor.get(ISelectionManager);

    return {
        // TODO replace with real command
        id: "SetNumfmtRangeDataCommand.id",
        title: 'toolbar.moreFormats',
        tooltip: 'toolbar.moreFormats',
        selectType: SelectTypes.NEO,
        type: MenuItemType.SELECTOR,
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
        // TODO@Dushusir 1. replace with real command
        // 2. suffix
        id: "OpenMoreFormatsModalCommand.id",
        title: 'defaultFmt.CustomFormats.text',
        positions: "SetNumfmtRangeDataCommand.id",
        display: DisplayTypes.LABEL,
        selectType: SelectTypes.NEO,
        type: MenuItemType.SELECTOR,
        selections: [...MORE_FORMATS_SELECTIONS],
    };
}