import { Command, Range, IRangeData, ObjectMatrix, ObjectMatrixPrimitiveType, PLUGIN_NAMES, ACTION_NAMES } from '@univer/core';
import { BaseComponentRender } from '@univer/base-component';
import { IToolBarItemProps, SheetPlugin } from '@univer/base-sheets';
import { IActionData } from '@univer/core/src/Command/ActionBase';
import { NumfmtModel } from '../Model/NumfmtModel';
import { DEFAULT_DATA } from '../Basic/Const/DEFAULT_DATA';
import { NUMFMT_PLUGIN_NAME, NumftmConfig } from '../Basic/Const';
import { NumfmtPlugin } from '../NumfmtPlugin';
import styles from '../View/UI/index.module.less';

export class NumfmtController {
    protected _plugin: NumfmtPlugin;

    protected _model: NumfmtModel;

    private _sheetPlugin: SheetPlugin;

    private _numfmtList: IToolBarItemProps;

    private _render: BaseComponentRender;

    constructor(plugin: NumfmtPlugin) {
        this._model = new NumfmtModel();
        this._plugin = plugin;
        this._sheetPlugin = this._plugin.getContext().getPluginManager().getPluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET)!;

        const wrappingRangeData = (row: number, col: number): IRangeData => ({
            startRow: row,
            endRow: row,
            startColumn: col,
            endColumn: col,
        });
        const executeFormatter = (type: string): void => {
            const workbook = this._plugin.getContext().getWorkBook();
            const selectManager = this._sheetPlugin.getSelectionManager();
            const selectRangeList = selectManager.getActiveRangeList();
            if (selectRangeList == null) {
                return;
            }
            selectRangeList.getRangeList().forEach((value) => {
                const actions: IActionData[] = [];
                Range.foreach(value, (row, col) => {
                    const setRangeAction = {
                        actionName: ACTION_NAMES.SET_RANGE_DATA_ACTION,
                        cellValue: { m: type },
                        rangeData: wrappingRangeData(row, col),
                    };
                    actions.push(setRangeAction);
                });
                new Command(
                    {
                        WorkBookUnit: workbook,
                    },
                    ...actions
                );
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
            actionName: ACTION_NAMES.SET_RANGE_DATA_ACTION,
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
            actionName: ACTION_NAMES.SET_RANGE_DATA_ACTION,
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
