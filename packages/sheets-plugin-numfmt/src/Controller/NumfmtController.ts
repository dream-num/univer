import {
    PLUGIN_NAMES,
    ObjectMatrixPrimitiveType,
    Command,
    ObjectMatrix,
    IRangeData,
    Range,
    ACTION_NAMES as CORE_ACTION_NAME,
    ICellData,
    ActionOperation,
    ISetRangeDataActionData,
} from '@univerjs/core';
import { BaseComponentRender } from '@univerjs/base-ui';
import { SheetPlugin } from '@univerjs/base-sheets';
import { numfmt } from '@univerjs/base-numfmt-engine';
import { IToolbarItemProps, SHEET_UI_PLUGIN_NAME, SheetUIPlugin } from '@univerjs/ui-plugin-sheets';
import { ACTION_NAMES } from '../Basics/Enum';
import { NumfmtPlugin } from '../NumfmtPlugin';
import { DEFAULT_DATA, NUMFMT_PLUGIN_NAME, NumftmConfig } from '../Basics/Const';
import { NumfmtModel } from '../Model/NumfmtModel';

import styles from '../View/UI/index.module.less';

export class NumfmtController {
    protected _sheetPlugin: SheetPlugin;

    protected _numfmtList: IToolbarItemProps;

    protected _model: NumfmtModel;

    protected _plugin: NumfmtPlugin;

    protected _sheetUIPlugin: SheetUIPlugin;

    protected _render: BaseComponentRender;

    constructor(plugin: NumfmtPlugin) {
        this._sheetUIPlugin = plugin.getGlobalContext().getPluginManager().getRequirePluginByName<SheetUIPlugin>(SHEET_UI_PLUGIN_NAME);
        this._model = new NumfmtModel();
        this._plugin = plugin;
        this._sheetPlugin = this._plugin.getContext().getPluginManager().getPluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET)!;
        const executeFormatter = (type: string): void => {
            const manager = this._sheetPlugin.getSelectionManager();
            const workbook = this._plugin.getContext().getWorkBook();
            const activeSheet = workbook.getActiveSheet();
            const activeRange = manager.getActiveRangeList();
            const cellMatrix = activeSheet.getCellMatrix();
            if (activeRange == null) {
                return;
            }
            // update cell data
            activeRange.getRangeList().forEach((range) => {
                let matrix = new ObjectMatrix<ICellData>();
                Range.foreach(range, (row, col) => {
                    const cell = cellMatrix.getValue(row, col);
                    if (cell) {
                        const formatter = numfmt(type);
                        matrix.setValue(row, col, { v: cell.v, m: formatter(cell.v) });
                    }
                });
                const setRangeDataAction: ISetRangeDataActionData = {
                    sheetId: activeSheet.getSheetId(),
                    cellValue: matrix.getData(),
                    actionName: CORE_ACTION_NAME.SET_RANGE_DATA_ACTION,
                };
                const newSetRangeDataAction = ActionOperation.make<ISetRangeDataActionData>(setRangeDataAction).removeExtension().getAction();
                const cmd = new Command({ WorkBookUnit: workbook }, newSetRangeDataAction);
                workbook.getCommandManager().invoke(cmd);
            });
            // update numfmt data
            activeRange.getRangeList().forEach((range) => {
                let matrix = new ObjectMatrix();
                Range.foreach(range, (row, col) => {
                    matrix.setValue(row, col, type);
                });
                const setNumfmtRangeDataAction = {
                    sheetId: activeSheet.getSheetId(),
                    actionName: ACTION_NAMES.SET_NUMFMT_RANGE_DATA_ACTION,
                    numfmtMatrix: matrix.getData(),
                };
                const cmd = new Command({ WorkBookUnit: workbook }, setNumfmtRangeDataAction);
                cmd.invoke();
            });
        };
        const CHILDREN_DATA = DEFAULT_DATA.map((item, index) => ({
            onClick: () => {
                switch (index) {
                    case 0: {
                        executeFormatter('G');
                        break;
                    }
                    case 1: {
                        executeFormatter('@');
                        break;
                    }
                    case 2: {
                        executeFormatter('#.##');
                        break;
                    }
                    case 3: {
                        executeFormatter('#.##%');
                        break;
                    }
                    case 4: {
                        executeFormatter('#.##E+');
                        break;
                    }
                    case 5: {
                        // TODO
                        break;
                    }
                    case 6: {
                        executeFormatter('¥#.##');
                        break;
                    }
                    case 7: {
                        // TODO
                        break;
                    }
                    case 8: {
                        executeFormatter('yyyy-mm-dd');
                        break;
                    }
                    case 9: {
                        executeFormatter('h:mm AM/PM');
                        break;
                    }
                    case 10: {
                        executeFormatter('h:mm');
                        break;
                    }
                    case 11: {
                        executeFormatter('yyyy-mm-dd h:mm AM/PM');
                        break;
                    }
                    case 12: {
                        executeFormatter('yyyy-mm-dd h:mm');
                        break;
                    }
                    case 13: {
                        break;
                    }
                }
            },
            ...item,
        }));
        this._numfmtList = {
            name: NUMFMT_PLUGIN_NAME,
            type: 0,
            label: 'toolbar.moreFormats',
            className: styles.customFormat,
            show: NumftmConfig.show,
            border: true,
            children: [
                ...CHILDREN_DATA,
                {
                    label: 'defaultFmt.CustomFormats.text',
                    suffix: { name: 'RightIcon' },
                    className: styles.customFormatMore,
                    children: [
                        {
                            label: 'format.moreCurrency',
                            onClick: () => {
                                this._plugin.getNumfmtModalController().showModal('currency', true);
                            },
                        },
                        {
                            label: 'format.moreDateTime',
                            onClick: () => {
                                this._plugin.getNumfmtModalController().showModal('date', true);
                            },
                        },
                        {
                            label: 'format.moreNumber',
                            onClick: () => {
                                this._plugin.getNumfmtModalController().showModal('number', true);
                            },
                        },
                    ],
                },
            ],
        };
        this._sheetUIPlugin.addToolButton(this._numfmtList);
    }

    getNumfmtBySheetIdConfig(sheetId: string): ObjectMatrixPrimitiveType<string> {
        return this._model.getNumfmtBySheetIdConfig(sheetId);
    }

    setNumfmtByRange(sheetId: string, numfmtRange: IRangeData, numfmtValue: string): void {
        const numfmtMatrix = new ObjectMatrix<string>();
        Range.foreach(numfmtRange, (row, column) => {
            numfmtMatrix.setValue(row, column, numfmtValue);
        });
        const pluginContext = this._plugin.getContext();
        const commandManager = pluginContext.getCommandManager();
        const config = {
            actionName: CORE_ACTION_NAME.SET_RANGE_DATA_ACTION,
            sheetId,
            rangeData: numfmtRange,
            cellValue: numfmtMatrix.toJSON(),
        };
        const command = new Command(
            {
                WorkBookUnit: pluginContext.getWorkBook(),
            },
            config
        );
        commandManager.invoke(command);
    }

    setNumfmtByCoords(sheetId: string, row: number, column: number, numfmt: string): void {
        const numfmtMatrix = new ObjectMatrix<string>();
        numfmtMatrix.setValue(row, column, numfmt);
        const numfmtRange: IRangeData = { startRow: row, startColumn: column, endRow: row, endColumn: column };
        const pluginContext = this._plugin.getContext();
        const commandManager = pluginContext.getCommandManager();
        const config = {
            actionName: CORE_ACTION_NAME.SET_RANGE_DATA_ACTION,
            sheetId,
            rangeData: numfmtRange,
            cellValue: numfmtMatrix.toJSON(),
        };
        const command = new Command(
            {
                WorkBookUnit: pluginContext.getWorkBook(),
            },
            config
        );
        commandManager.invoke(command);
    }
}
