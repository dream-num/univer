import { SheetContext, UniverSheet, Plugin, Worksheet } from '@univerjs/core';
// import { TextFinder } from './Domain/TextFind';
import { SheetUIPlugin, SHEET_UI_PLUGIN_NAME } from '@univerjs/ui-plugin-sheets';
import { Icon } from '@univerjs/base-ui';
import { FindType } from './IData/IFind';
import { FIND_PLUGIN_NAME } from './Const/PLUGIN_NAME';
import { FindController } from './Controller/FindController';
import en from './Locale/en';
import zh from './Locale/zh';
import { FindPluginObserve, install } from './Basics/Observer';
import { FindModalController } from './Controller/FindModalController';
import { TextFinder } from './Domain';

export interface IFindPluginConfig {}

export class FindPlugin extends Plugin<FindPluginObserve> {
    private _findController: FindController;

    private _findModalController: FindModalController;

    private _textFinder: TextFinder;

    constructor(config?: IFindPluginConfig) {
        super(FIND_PLUGIN_NAME);
    }

    static create(config?: IFindPluginConfig) {
        return new FindPlugin(config);
    }

    installTo(universheetInstance: UniverSheet) {
        universheetInstance.installPlugin(this);

        this._textFinder = new TextFinder(this);
        this._findModalController = new FindModalController(this);
        this._findController = new FindController(this);

        const context = this.getContext();
        let sheetPlugin = context.getUniver().getGlobalContext().getPluginManager().getRequirePluginByName<SheetUIPlugin>(SHEET_UI_PLUGIN_NAME);
        sheetPlugin?.UIDidMount(() => {
            sheetPlugin.getComponentManager().register('SearchIcon', Icon.SearchIcon);
            sheetPlugin.addToolButton(this._findController.getFindList());
        });
    }

    initialize(): void {
        this.getLocale().load({
            en,
            zh,
        });
    }

    createTextFinder(workSheet: Worksheet, type: FindType, text: string) {
        // return new TextFinder(workSheet, type, text);
    }

    onMounted(ctx: SheetContext): void {
        install(this);
        this.initialize();
    }

    onDestroy(): void {}

    onMapping(): void {}

    getFindModalController() {
        return this._findModalController;
    }

    getTextFinder() {
        return this._textFinder;
    }
}
