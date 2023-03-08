import { DocPlugin } from '@univerjs/base-docs';
import { DocUIPlugin } from '../DocUIPlugin';

export class UIController {
    protected _docPlugin: DocPlugin;

    protected _plugin: DocUIPlugin;

    constructor(plugin: DocUIPlugin) {
        this._plugin = plugin;
    }
}
