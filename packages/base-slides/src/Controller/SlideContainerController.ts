import { BooleanNumber, CommandManager } from '@univer/core';
import { SlidePlugin } from '../SlidePlugin';

export class SlideContainerController {
    private _plugin: SlidePlugin;

    constructor(plugin: SlidePlugin) {
        this._plugin = plugin;

        this._initialize();
    }

    private _initialize() {}
}
