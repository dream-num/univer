import { ClipboardOfficePlugin } from '../ClipboardOfficePlugin';

export class ClipboardOfficeController {
    protected _plugin: ClipboardOfficePlugin;

    constructor(plugin: ClipboardOfficePlugin) {
        this._plugin = plugin;
    }
}
