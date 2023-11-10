import { IUniverInstanceService, LocaleService, Plugin, PluginType } from '@univerjs/core';
// import { TextFinder } from './domain/text-find';
import { Dependency, Inject, Injector } from '@wendellhu/redi';

import { FIND_PLUGIN_NAME } from './const/plugin-name';
import { FindController } from './controllers/find-controller';
import { FindModalController } from './controllers/find-modal-controller';
import { TextFinder } from './domain/text-find';
import { enUS } from './locale';
import { FindService } from './services/find.service';
// import { FindPluginObserve, install } from './basics/observer';
// import { FindModalController } from './controllers/find-modal-controller';
// import { TextFinder } from './domain';

export interface IFindPluginConfig {}

export class FindPlugin extends Plugin {
    static override type = PluginType.Sheet;

    private _config: IFindPluginConfig = {};

    private _findController: FindController | null = null;

    private _findModalController: FindModalController | null = null;

    constructor(
        config: Partial<IFindPluginConfig>,
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @Inject(Injector) protected readonly _injector: Injector
    ) {
        super(FIND_PLUGIN_NAME);

        this.initializeDependencies(_injector);
    }

    // installTo(universheetInstance: UniverSheet) {
    //     universheetInstance.installPlugin(this);
    // }

    // installTo(universheetInstance: UniverSheet) {
    //     universheetInstance.installPlugin(this);

    //     this._textFinder = new TextFinder(this);
    //     this._findModalController = new FindModalController(this);
    //     this._findController = new FindController(this);

    //     const context = this.getContext();
    //     let sheetPlugin = context.getUniver().getGlobalContext().getPluginManager().getRequirePluginByName<SheetUIPlugin>(SHEET_UI_PLUGIN_NAME);
    //     sheetPlugin?.UIDidMount(() => {
    //         sheetPlugin.getComponentManager().register('SearchIcon', Icon.SearchIcon);
    //         sheetPlugin.addToolButton(this._findController.getFindList());
    //     });
    // }

    initialize(): void {
        this._localeService.load({
            enUS,
        });

        this.initController();
    }

    // createTextFinder(workSheet: Worksheet, type: FindType, text: string) {
    //     // return new TextFinder(workSheet, type, text);
    // }

    override onRendered(): void {
        this.initialize();
    }

    initController() {
        this._findController = this._injector.get(FindController);
        this._findModalController = this._injector.get(FindModalController);
    }

    initializeDependencies(sheetInjector: Injector) {
        const dependencies: Dependency[] = [[FindController], [TextFinder], [FindModalController], [FindService]];

        dependencies.forEach((d) => {
            sheetInjector.add(d);
        });
    }
}
