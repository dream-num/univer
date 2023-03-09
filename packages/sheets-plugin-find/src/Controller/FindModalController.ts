import { SheetUIPlugin, SHEET_UI_PLUGIN_NAME } from '@univerjs/ui-plugin-sheets';
import { FIND_PLUGIN_NAME } from '../Const/PLUGIN_NAME';
import { FindPlugin } from '../FindPlugin';
import { FindModal } from '../View/UI/FindModal';

export class FindModalController {
    private _plugin: FindPlugin;

    private _findModal: FindModal;

    constructor(plugin: FindPlugin) {
        this._plugin = plugin;

        this._initialize();
    }

    getComponent(ref: FindModal) {
        this._findModal = ref;
    }

    showModal(show: boolean) {
        this._findModal?.showFindModal(show);
    }

    findNext(text: string) {
        const TextFinder = this._plugin.getTextFinder().searchText(text);
        if (!TextFinder) return { count: 0, current: 0 };
        TextFinder.findNext();
        const count = TextFinder.getCount();
        const current = TextFinder.getCurrentIndex();
        return {
            count,
            current: current + 1,
        };
    }

    replaceText(text: string) {
        const TextFinder = this._plugin.getTextFinder().searchText(text);
        if (!TextFinder) return;
        TextFinder.replaceWith(text);
        const count = TextFinder.getCount();
        const current = TextFinder.getCurrentIndex();
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
            },
        });
    }
}
