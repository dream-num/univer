import { Nullable } from '@univerjs/core';
import { SheetUIPlugin, SHEET_UI_PLUGIN_NAME } from '@univerjs/ui-plugin-sheets';
import { FIND_PLUGIN_NAME } from '../Const/PLUGIN_NAME';
import { TextFinder } from '../Domain';
import { FindPlugin } from '../FindPlugin';
import { FindModal } from '../View/UI/FindModal';

export class FindModalController {
    private _plugin: FindPlugin;

    private _findModal: FindModal;

    private _textFinder: Nullable<TextFinder>;

    constructor(plugin: FindPlugin) {
        this._plugin = plugin;
        this._textFinder = plugin.getTextFinder();

        this._initialize();
    }

    getComponent(ref: FindModal) {
        this._findModal = ref;
    }

    showModal(show: boolean) {
        this._findModal?.showFindModal(show);
    }

    findNext(text: string) {
        this._textFinder = this._plugin.getTextFinder().searchText(text);
        if (!this._textFinder) return { count: 0, current: 0 };
        this._textFinder.findNext();
        return this._getCountInfo();
    }

    findPrevious(text: string) {
        this._textFinder = this._plugin.getTextFinder().searchText(text);
        if (!this._textFinder) return { count: 0, current: 0 };
        this._textFinder.findPrevious();
        return this._getCountInfo();
    }

    replaceText(text: string) {
        if (!this._textFinder) return;
        const replaceCount = this._textFinder.replaceWith(text);
        return {
            ...this._getCountInfo(),
            replaceCount,
        };
    }

    replaceAll(text: string) {
        if (!this._textFinder) return;
        const replaceCount = this._textFinder.replaceAllWith(text);
        return {
            ...this._getCountInfo(),
            replaceCount,
        };
    }

    matchCase(matchCase: boolean) {
        if (!this._textFinder) return;
        this._textFinder.matchCase(matchCase);
    }

    matchEntireCell(matchEntire: boolean) {
        if (!this._textFinder) return;
        this._textFinder.matchEntireCell(matchEntire);
    }

    private _getCountInfo() {
        const count = this._textFinder?.getCount() ?? 0;
        const current = this._textFinder?.getCurrentIndex() ?? 0;
        return {
            count,
            current: current + 1,
        };
    }

    private _initialize() {
        const sheetUIPlugin = this._plugin.getContext().getUniver().getGlobalContext().getPluginManager().getRequirePluginByName<SheetUIPlugin>(SHEET_UI_PLUGIN_NAME);
        sheetUIPlugin.addSlot(FIND_PLUGIN_NAME + FindModal.name, {
            component: FindModal,
            props: {
                getComponent: this.getComponent.bind(this),
                findNext: this.findNext.bind(this),
                findPrevious: this.findPrevious.bind(this),
                replaceText: this.replaceText.bind(this),
                replaceAll: this.replaceAll.bind(this),
                matchCase: this.matchCase.bind(this),
                matchEntireCell: this.matchEntireCell.bind(this),
            },
        });
    }
}
