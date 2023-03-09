import { DocPlugin } from '../DocPlugin';

interface BorderInfo {
    color: string;
    width: string;
}

/**
 *
 */
export class ToolbarController {
    private _plugin: DocPlugin;

    constructor(plugin: DocPlugin) {
        this._plugin = plugin;
    }
}
