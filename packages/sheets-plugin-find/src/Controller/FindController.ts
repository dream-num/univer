import { IToolbarItemProps } from '@univerjs/ui-plugin-sheets';
import { FIND_PLUGIN_NAME } from '../Const/PLUGIN_NAME';
import { FindPlugin } from '../FindPlugin';

export class FindController {
    private _plugin: FindPlugin;

    private _findList: IToolbarItemProps;

    constructor(plugin: FindPlugin) {
        this._plugin = plugin;

        this._findList = {
            name: FIND_PLUGIN_NAME,
            toolbarType: 1,
            tooltip: 'find.findLabel',
            label: {
                name: 'SearchIcon',
            },
            show: true,
            onClick: () => {
                this._plugin.getFindModalController().showModal(true);
            },
        };
    }

    getFindList() {
        return this._findList;
    }
}
