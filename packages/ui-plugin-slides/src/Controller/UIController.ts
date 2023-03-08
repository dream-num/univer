import { SlidePlugin } from '@univerjs/base-slides';
import { SlideUIPlugin } from '../SlideUIPlugin';

export class UIController {
    protected _slidePlugin: SlidePlugin;

    protected _plugin: SlideUIPlugin;

    constructor(plugin: SlideUIPlugin) {
        this._plugin = plugin;
    }
}
