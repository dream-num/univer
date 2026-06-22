import { ICommandService, Inject, Injector, Plugin, UniverInstanceType } from '@univerjs/core';
import { IShortcutService } from '@univerjs/ui';
import { CustomClearSelectionContentCommand } from './commands/commands/custom.command';
import { CustomClearSelectionValueShortcutItem } from './controllers/shortcuts/custom.shortcut';

const SHEET_CUSTOM_SHORTCUT_PLUGIN = 'SHEET_CUSTOM_SHORTCUT_PLUGIN';

export class UniverSheetsCustomShortcutPlugin extends Plugin {
    static override type = UniverInstanceType.UNIVER_SHEET;
    static override pluginName = SHEET_CUSTOM_SHORTCUT_PLUGIN;

    constructor(
        _config = undefined,
        @Inject(Injector) protected readonly _injector: Injector,
        @ICommandService private readonly _commandService: ICommandService,
        @IShortcutService private readonly _shortcutService: IShortcutService
    ) {
        super();

        this._initCommands();
        this._initShortcuts();
    }

    private _initCommands() {
        [
            CustomClearSelectionContentCommand,
        ].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));
    }

    private _initShortcuts() {
        [
            CustomClearSelectionValueShortcutItem,
        ].forEach((item) => this.disposeWithMe(this._shortcutService.registerShortcut(item)));
    }
}
