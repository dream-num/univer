import {
    NORMAL_SELECTION_PLUGIN_NAME,
    SelectionManagerService,
    SetBoldCommand,
    SetRangeStyleMutation,
    SetStyleCommand,
} from '@univerjs/base-sheets';
import {
    DisposableCollection,
    ICommandService,
    IPermissionService,
    RANGE_TYPE,
    toDisposable,
    Univer,
} from '@univerjs/core';
import { Injector } from '@wendellhu/redi';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { BoldMenuItemFactory } from '../menu';
import { createMenuTestBed } from './create-menu-test-bed';

describe('Test menu items', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;
    let disposableCollection: DisposableCollection;

    beforeEach(() => {
        const testBed = createMenuTestBed();

        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        commandService.registerCommand(SetBoldCommand);
        commandService.registerCommand(SetStyleCommand);
        commandService.registerCommand(SetRangeStyleMutation);

        disposableCollection = new DisposableCollection();
    });

    afterEach(() => {
        univer.dispose();

        disposableCollection.dispose();
    });

    it('Test bold menu item', async () => {
        let activated = false;
        let disabled = false;

        const menuItem = get(Injector).invoke(BoldMenuItemFactory);
        disposableCollection.add(toDisposable(menuItem.activated$!.subscribe((v) => (activated = v))));
        disposableCollection.add(toDisposable(menuItem.disabled$!.subscribe((v) => (disabled = v))));
        expect(activated).toBe(false);
        expect(disabled).toBe(false);

        const selectionManager = get(SelectionManagerService);
        selectionManager.setCurrentSelection({
            pluginName: NORMAL_SELECTION_PLUGIN_NAME,
            unitId: 'test',
            sheetId: 'sheet1',
        });
        selectionManager.add([
            {
                range: { startRow: 0, startColumn: 0, endColumn: 0, endRow: 0, rangeType: RANGE_TYPE.NORMAL },
                primary: {
                    startRow: 0,
                    startColumn: 0,
                    endColumn: 0,
                    endRow: 0,
                    row: 0,
                    column: 0,
                    isMerged: false,
                    isMergedMainCell: false,
                },
                style: null,
            },
        ]);

        expect(await commandService.executeCommand(SetBoldCommand.id)).toBeTruthy();
        expect(activated).toBe(true);

        const permissionService = get(IPermissionService);
        permissionService.setEditable(false);
        expect(disabled).toBe(true);
    });
});
