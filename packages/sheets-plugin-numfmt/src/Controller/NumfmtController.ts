import {
    Command,
    Range,
    IRangeData,
    ObjectMatrix,
    ObjectMatrixPrimitiveType,
    PLUGIN_NAMES,
    ACTION_NAMES as CORE_ACTION_NAME,
    ActionOperation,
    ISetRangeDataActionData,
} from '@univerjs/core';
import { BaseComponentRender } from '@univerjs/base-ui';
import { IToolBarItemProps, SheetPlugin } from '@univerjs/base-sheets';
import { numfmt } from '@univerjs/base-numfmt-engine';
import { ACTION_NAMES } from '../Basic/Enum';
import { DEFAULT_DATA, NUMFMT_PLUGIN_NAME, NumftmConfig } from '../Basic/Const';
import { NumfmtModel } from '../Model/NumfmtModel';
import { NumfmtPlugin } from '../NumfmtPlugin';

import styles from '../View/UI/index.module.less';

export class NumfmtController {
    protected _sheetPlugin: SheetPlugin;

    protected _model: NumfmtModel;

    protected _numfmtList: IToolBarItemProps;

    protected _plugin: NumfmtPlugin;

    protected _render: BaseComponentRender;

    constructor(plugin: NumfmtPlugin) {
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
                let matrix = new ObjectMatrix();
                Range.foreach(range, (row, col) => {
                    const cell = cellMatrix.getValue(row, col);
                    if (cell) {
                        const formatter = numfmt(type);
                        matrix.setValue(row, col, { v: cell.v, m: formatter(cell.v) });
                    }
                });
                const setRangeDataAction = {
                    sheetId: activeSheet.getSheetId(),
                    actionName: CORE_ACTION_NAME.SET_RANGE_DATA_ACTION,
                    cellValue: matrix.getData(),
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
            tooltipLocale: 'toolbar.moreFormats',
            className: styles.customFormat,
            show: NumftmConfig.show,
            border: true,
            children: [
                ...CHILDREN_DATA,
                {
                    locale: 'defaultFmt.CustomFormats.text',
                    customSuffix: { name: 'RightIcon' },
                    className: styles.customFormatMore,
                    children: [
                        {
                            locale: 'format.moreCurrency',
                            onClick: () => {
                                this._plugin.getNumfmtModalController().showModal('currency', true);
                            },
                        },
                        {
                            locale: 'format.moreDateTime',
                            onClick: () => {
                                this._plugin.getNumfmtModalController().showModal('date', true);
                            },
                        },
                        {
                            locale: 'format.moreNumber',
                            onClick: () => {
                                this._plugin.getNumfmtModalController().showModal('number', true);
                            },
                        },
                    ],
                },
            ],
        };
        this._sheetPlugin.addToolButton(this._numfmtList);
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
