import { SheetsCommand, Range, IRangeData, ObjectMatrix, ObjectMatrixPrimitiveType, PLUGIN_NAMES, ACTION_NAMES } from '@univer/core';
import { BaseComponentRender, BaseComponentSheet } from '@univer/base-component';
import { IToolBarItemProps, SpreadsheetPlugin } from '@univer/base-sheets';
import { NumfmtModel } from '../Model/NumfmtModel';
import { NUMFMT_PLUGIN_NAME } from '../Const';
import { DEFAULT_DATA } from '../Const/DEFAULT_DATA';
import { NumfmtPlugin } from '../NumfmtPlugin';

export class NumfmtController {
    protected _model: NumfmtModel;

    protected _plugin: NumfmtPlugin;

    private _spreadSheetPlugin: SpreadsheetPlugin;

    private _numfmtList: IToolBarItemProps;

    private _render: BaseComponentRender;

    constructor(plugin: NumfmtPlugin) {
        this._model = new NumfmtModel();
        this._plugin = plugin;
        this._spreadSheetPlugin = this._plugin.getContext().getPluginManager().getPluginByName<SpreadsheetPlugin>(PLUGIN_NAMES.SPREADSHEET)!;

        this.initRegisterComponent();

        this._numfmtList = {
            name: NUMFMT_PLUGIN_NAME,
            type: 0,
            tooltipLocale: 'moreFormats',
            show: true,
            border: true,
            children: [
                ...DEFAULT_DATA,
                {
                    locale: 'defaultFmt.CustomFormats.text',
                    customSuffix: { name: 'RightIcon' },
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
                            onClick: () => {},
                        },
                    ],
                },
            ],
        };

        this._spreadSheetPlugin.addToolButton(this._numfmtList);
    }

    // 注册自定义组件
    initRegisterComponent() {
        const component = this._plugin.getContext().getPluginManager().getPluginByName<BaseComponentSheet>('ComponentSheet')!;
        this._render = component.getComponentRender();

        const registerIcon = {
            RightIcon: this._render.renderFunction('RightIcon'),
        };

        for (let k in registerIcon) {
            this._spreadSheetPlugin.registerComponent(k, registerIcon[k]);
        }
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
        const command = new SheetsCommand(pluginContext.getWorkBook(), config);
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
        const command = new SheetsCommand(pluginContext.getWorkBook(), config);
        commandManager.invoke(command);
    }
}
