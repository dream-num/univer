import { IRange, LocaleService, ObjectMatrixPrimitiveType, Plugin, PluginType } from '@univerjs/core';
import { Dependency, Inject, Injector } from '@wendellhu/redi';

import { NUMFMT_PLUGIN_NAME } from './basics';
import { NumfmtController, NumfmtModalController } from './controllers';
import { INumfmtPluginConfig } from './interfaces';
import { enUS } from './locale';
import { NumfmtModel } from './model';
import { NumfmtService } from './services/numfmt.service';
import { INumfmtPluginData } from './symbol';

export class NumfmtPlugin extends Plugin {
    static override type = PluginType.Sheet;

    private _numfmtModalController!: NumfmtModalController;

    private _numfmtController!: NumfmtController;

    private _numfmtPluginData: NumfmtModel;

    constructor(
        config: Partial<INumfmtPluginConfig>,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @Inject(Injector) override readonly _injector: Injector
    ) {
        super(NUMFMT_PLUGIN_NAME);

        this._numfmtPluginData = new NumfmtModel();
        this._injector.add([INumfmtPluginData, { useFactory: () => this._numfmtPluginData }]);
    }

    override onRendered(): void {
        this.initializeDependencies(this._injector);
        this.registerExtension();
        this._numfmtController = this._injector.get(NumfmtController);
        this._numfmtModalController = this._injector.get(NumfmtModalController);
        this._localeService.load({ enUS });
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

    setNumfmtByRange(sheetId: string, range: IRange, format: string): void {
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
