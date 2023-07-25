import { IRenderingEngine, RenderEngine } from '@univerjs/base-render';
import { IGlobalContext, ISheetContext } from '@univerjs/base-sheets';
import { IRangeData, ObjectMatrixPrimitiveType, Plugin, PLUGIN_NAMES, SheetContext } from '@univerjs/core';
import { Injector } from '@wendellhu/redi';
import { NUMFMT_PLUGIN_NAME } from './Basics/Const/PLUGIN_NAME';
import { install, NumfmtPluginObserve } from './Basics/Observer';
import { NumfmtActionExtensionFactory } from './Basics/Register/NumfmtActionExtension';
import { NumfmtController } from './Controller/NumfmtController';
import { NumfmtModalController } from './Controller/NumfmtModalController';
import en from './Locale/en';
import zh from './Locale/zh';

export interface INumfmtPluginConfig {}

export class NumfmtPlugin extends Plugin<NumfmtPluginObserve, SheetContext> {
    private _numfmtController: NumfmtController;

    private _numfmtModalController: NumfmtModalController;

    private _injector: Injector;

    private _numfmtActionExtensionFactory: NumfmtActionExtensionFactory;

    constructor(config?: INumfmtPluginConfig) {
        super(NUMFMT_PLUGIN_NAME);
        this.initializeDependencies();
    }

    static create(config?: INumfmtPluginConfig): NumfmtPlugin {
        return new NumfmtPlugin(config);
    }

    onMounted(context: SheetContext): void {
        install(this);
        console.log('NumfmtPlugin onMounted');
        this.getLocale().load({ en, zh });
        this._numfmtActionExtensionFactory = new NumfmtActionExtensionFactory(this);
        this._numfmtController = this._injector.get(NumfmtController);
        this._numfmtModalController = this._injector.get(NumfmtModalController);
        const actionRegister = this.context.getCommandManager().getActionExtensionManager().getRegister();
        actionRegister.add(this._numfmtActionExtensionFactory);
    }

    onDestroy(): void {
        super.onDestroy();
        const actionRegister = this.context.getCommandManager().getActionExtensionManager().getRegister();
        actionRegister.delete(this._numfmtActionExtensionFactory);
    }

    getNumfmtBySheetIdConfig(sheetId: string): ObjectMatrixPrimitiveType<string> {
        return this._numfmtController.getNumfmtBySheetIdConfig(sheetId);
    }

    setNumfmtByRange(sheetId: string, range: IRangeData, format: string): void {
        this._numfmtController.setNumfmtByRange(sheetId, range, format);
    }

    setNumfmtByCoords(sheetId: string, row: number, column: number, format: string): void {
        this._numfmtController.setNumfmtByCoords(sheetId, row, column, format);
    }

    getNumfmtModalController(): NumfmtModalController {
        return this._numfmtModalController;
    }

    private initializeDependencies(): void {
        this._injector = new Injector([
            [IGlobalContext, { useFactory: () => this.getGlobalContext() }],
            [ISheetContext, { useFactory: () => this.getContext() }],
            [IRenderingEngine, { useFactory: () => this.getGlobalContext().getPluginManager().getRequirePluginByName<RenderEngine>(PLUGIN_NAMES.BASE_RENDER).getEngine() }],
            [NumfmtController],
            [NumfmtModalController],
        ]);
    }
}
