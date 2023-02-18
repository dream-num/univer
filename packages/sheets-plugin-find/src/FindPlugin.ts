import { SheetContext, UniverSheet, Plugin, Worksheet } from '@univerjs/core';
// import { TextFinder } from './Domain/TextFind';
import { FindType } from './IData/IFind';
import { FIND_PLUGIN_NAME } from './Const/PLUGIN_NAME';
import { FindController } from './Controller/FindController';
import en from './Locale/en';
import zh from './Locale/zh';
import { FindPluginObserve, install } from './Basic/Observer';
import { FindModalController } from './Controller/FindModalController';
import { SearchContentController } from './Controller/SearchContentController';

export interface IFindPluginConfig {}

export class FindPlugin extends Plugin<FindPluginObserve> {
    private _findController: FindController;

    private _findModalController: FindModalController;

    private _searchContentController: SearchContentController;

    constructor(config?: IFindPluginConfig) {
        super(FIND_PLUGIN_NAME);
    }

    static create(config?: IFindPluginConfig) {
        return new FindPlugin(config);
    }

    installTo(universheetInstance: UniverSheet) {
        universheetInstance.installPlugin(this);
    }

    initialize(): void {
        const context = this.getContext();

        context.getLocale().load({
            en,
            zh,
        });

        this._findModalController = new FindModalController(this);
        this._findController = new FindController(this);
        this._searchContentController = new SearchContentController(this);
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
}
