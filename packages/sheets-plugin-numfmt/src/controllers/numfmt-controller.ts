import { ComponentManager, IMenuService } from '@univerjs/base-ui';
import {
    Disposable,
    ICommandService,
    IRange,
    IUniverInstanceService,
    ObjectMatrix,
    ObjectMatrixPrimitiveType,
    Range,
} from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';

import { NUMFMT_PLUGIN_NAME } from '../basics/const';
import { SetNumfmtRangeDataCommand } from '../commands/commands/set-numfmt-range-data.command';
import { ShowModalOperation } from '../commands/operations/show-modal.operation';
import { NumfmtModel } from '../model';
import { INumfmtPluginData } from '../symbol';
import { FormatItem } from '../views/ui/FormatItem';
import { NumfmtRangeDataMenuItemFactory, OpenMoreFormatsModalMenuItemFactory } from './menu';
import { NumfmtModalController } from './numfmt-modal-controller';

/**
 *         const CHILDREN_DATA = DEFAULT_DATA.map((item, index) => ({
            onClick: () => {
                switch (index) {
                    case 0: {
                        //executeFormatter('G');
                        break;
                    }
                    case 1: {
                        //executeFormatter('@');
                        break;
                    }
                    case 2: {
                        //executeFormatter('#.##');
                        break;
                    }
                    case 3: {
                        //executeFormatter('#.##%');
                        break;
                    }
                    case 4: {
                        //executeFormatter('#.##E+');
                        break;
                    }
                    case 5: {
                        // TODO
                        break;
                    }
                    case 6: {
                        //executeFormatter('¥#.##');
                        break;
                    }
                    case 7: {
                        // TODO
                        break;
                    }
                    case 8: {
                        //executeFormatter('yyyy-mm-dd');
                        break;
                    }
                    case 9: {
                        //executeFormatter('h:mm AM/PM');
                        break;
                    }
                    case 10: {
                        //executeFormatter('h:mm');
                        break;
                    }
                    // eslint-disable-next-line no-magic-numbers
                    case 11: {
                        //executeFormatter('yyyy-mm-dd h:mm AM/PM');
                        break;
                    }
                    // eslint-disable-next-line no-magic-numbers
                    case 12: {
                        //executeFormatter('yyyy-mm-dd h:mm');
                        break;
                    }
                    // eslint-disable-next-line no-magic-numbers
                    case 13: {
                        break;
                    }
                }
            },
            ...item,
        }));
 */
export class NumfmtController extends Disposable {
    constructor(
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager,
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(INumfmtPluginData) private _numfmtPluginData: NumfmtModel,
        @Inject(IUniverInstanceService) private readonly _currentUniverService: IUniverInstanceService,
        @Inject(NumfmtModalController) private readonly _numfmtModalController: NumfmtModalController,
        @IMenuService private readonly _menuService: IMenuService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();

        this._componentManager.register(NUMFMT_PLUGIN_NAME + FormatItem.name, FormatItem);

        this._initializeContextMenu();

        [ShowModalOperation, SetNumfmtRangeDataCommand].forEach((command) =>
            this.disposeWithMe(this._commandService.registerCommand(command))
        );
    }

    getNumfmtBySheetIdConfig(sheetId: string): ObjectMatrixPrimitiveType<string> {
        return this._numfmtPluginData.getNumfmtBySheetIdConfig(sheetId);
    }

    setNumfmtByRange(sheetId: string, numfmtRange: IRange, numfmtValue: string): void {
        const numfmtMatrix = new ObjectMatrix<string>();
        Range.foreach(numfmtRange, (row, column) => {
            numfmtMatrix.setValue(row, column, numfmtValue);
        });

        // TODO new command

        // const commandManager = this._commandManager;
        // const config = {
        //     actionName: CORE_ACTION_NAME.SET_RANGE_DATA_ACTION,
        //     sheetId,
        //     range: numfmtRange,
        //     cellValue: numfmtMatrix.toJSON(),
        // };
        // const command = new Command(
        //     {
        //         WorkBookUnit: this._currentUniverService.getCurrentUniverSheetInstance(),
        //     },
        //     config
        // );
        // commandManager.invoke(command);
    }

    setNumfmtByCoords(sheetId: string, row: number, column: number, numfmt: string): void {
        const numfmtMatrix = new ObjectMatrix<string>();
        numfmtMatrix.setValue(row, column, numfmt);
        const numfmtRange: IRange = { startRow: row, startColumn: column, endRow: row, endColumn: column };

        // TODO new command

        // const commandManager = this._commandManager;
        // const config = {
        //     actionName: CORE_ACTION_NAME.SET_RANGE_DATA_ACTION,
        //     sheetId,
        //     range: numfmtRange,
        //     cellValue: numfmtMatrix.toJSON(),
        // };
        // const command = new Command(
        //     {
        //         WorkBookUnit: this._currentUniverService.getCurrentUniverSheetInstance(),
        //     },
        //     config
        // );
        // commandManager.invoke(command);
    }

    private _initializeContextMenu() {
        [NumfmtRangeDataMenuItemFactory, OpenMoreFormatsModalMenuItemFactory].forEach((factory) => {
            this.disposeWithMe(this._menuService.addMenuItem(this._injector.invoke(factory)));
        });
    }
}
