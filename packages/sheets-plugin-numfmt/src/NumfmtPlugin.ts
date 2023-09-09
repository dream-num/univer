import { IRangeData, LocaleService, ObjectMatrixPrimitiveType, Plugin, PluginType } from '@univerjs/core';
import { SheetContainerUIController } from '@univerjs/ui-plugin-sheets';
import { Dependency, Inject, Injector } from '@wendellhu/redi';

import { install, NUMFMT_PLUGIN_NAME, NumfmtActionExtensionFactory, NumfmtPluginObserve } from './Basics';
import { NumfmtController, NumfmtModalController } from './Controller';
import { INumfmtPluginConfig } from './Interfaces';
import en from './Locale/en';
import zh from './Locale/zh';
import { NumfmtModel } from './Model';
import { NumfmtService } from './services/numfmt.service';
import { INumfmtPluginData } from './Symbol';

export class NumfmtPlugin extends Plugin<NumfmtPluginObserve> {
    static override type = PluginType.Sheet;

    private _numfmtModalController: NumfmtModalController;

    private _numfmtController: NumfmtController;

    private _numfmtPluginData: NumfmtModel;

    private _numfmtActionExtensionFactory: NumfmtActionExtensionFactory;

    constructor(
        config: Partial<INumfmtPluginConfig>,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @Inject(Injector) override readonly _injector: Injector
    ) {
        super(NUMFMT_PLUGIN_NAME);

        this._numfmtPluginData = new NumfmtModel();
        this._injector.add([INumfmtPluginData, { useFactory: () => this._numfmtPluginData }]);

        const sheetContainerUIController = this._injector.get(SheetContainerUIController);
        sheetContainerUIController.UIDidMount(() => {
            this.initializeDependencies(_injector);
            this.registerExtension();
        });
    }

    override onMounted(): void {
        install(this);
        this._localeService.getLocale().load({ en, zh });
        this._numfmtController = this._injector.get(NumfmtController);
        this._numfmtModalController = this._injector.get(NumfmtModalController);
        // const actionRegister = this._commandManager.getActionExtensionManager().getRegister();
        // actionRegister.add(this._numfmtActionExtensionFactory);
    }

    override onDestroy(): void {
        super.onDestroy();
        // const actionRegister = this._commandManager.getActionExtensionManager().getRegister();
        // actionRegister.delete(this._numfmtActionExtensionFactory);
    }

    registerExtension(): void {
        // const actionRegister = this._commandManager.getActionExtensionManager().getRegister();
        // this._numfmtActionExtensionFactory = new NumfmtActionExtensionFactory(this, this._injector);
        // actionRegister.add(this._numfmtActionExtensionFactory);
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

    private initializeDependencies(sheetInjector: Injector): void {
        // this._injector = new Injector([
        //     [IRenderingEngine, { useFactory: () => this.getGlobalContext().getPluginManager().getRequirePluginByName<RenderEngine>(PLUGIN_NAMES.BASE_RENDER).getEngine() }],
        //     [NumfmtController],
        //     [NumfmtModalController],
        // ]);
        const dependencies: Dependency[] = [[NumfmtController], [NumfmtModalController], [NumfmtService]];
        dependencies.forEach((d) => {
            sheetInjector.add(d);
        });
    }
}
