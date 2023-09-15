import { BorderType } from '@univerjs/core';

import { SlidePlugin } from '../SlidePlugin';

export interface BorderInfo {
    type: BorderType;
    color: string;
    style: number;
}

/**
 *
 */
export class ToolbarController {
    private _plugin: SlidePlugin;

    constructor(plugin: SlidePlugin) {
        this._plugin = plugin;
    }

    listenEventManager() {}
}
