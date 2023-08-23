import { CommandManager, ICurrentUniverService, LocaleService, Plugin, PluginType } from '@univerjs/core';
// import { TextFinder } from './Domain/TextFind';
import { Dependency, Inject, Injector } from '@wendellhu/redi';
import { FIND_PLUGIN_NAME } from './Const/PLUGIN_NAME';
import { FindPluginObserve } from './Basics/Observer';
import { FindController } from './Controller/FindController';
import { en, zh } from './Locale';
import { TextFinder } from './Domain/TextFind';
import { FindModalController } from './Controller/FindModalController';
// import { FindPluginObserve, install } from './Basics/Observer';
// import { FindModalController } from './Controller/FindModalController';
// import { TextFinder } from './Domain';

export interface IFindPluginConfig {}

export class FindPlugin extends Plugin<FindPluginObserve> {
    static override type = PluginType.Sheet;

    private _config: IFindPluginConfig;

    private _findController: FindController;

    private _findModalController: FindModalController;

    constructor(
        config: Partial<IFindPluginConfig>,
        @ICurrentUniverService private readonly _currentUniverService: ICurrentUniverService,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @Inject(Injector) private readonly _sheetInjector: Injector,
        @Inject(CommandManager) private readonly _commandManager: CommandManager
    ) {
        super(FIND_PLUGIN_NAME);

        this.initializeDependencies(_sheetInjector);
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
        this._localeService.getLocale().load({
            en,
            zh,
        });

        this.initController();
    }

    // createTextFinder(workSheet: Worksheet, type: FindType, text: string) {
    //     // return new TextFinder(workSheet, type, text);
    // }

    override onMounted(): void {
        this.initialize();
    }

    initController() {
        this._findController = this._sheetInjector.get(FindController);
        this._findModalController = this._sheetInjector.get(FindModalController);
    }

    initializeDependencies(sheetInjector: Injector) {
        const dependencies: Dependency[] = [[FindController], [TextFinder], [FindModalController]];

        dependencies.forEach((d) => {
            sheetInjector.add(d);
        });
    }
}
