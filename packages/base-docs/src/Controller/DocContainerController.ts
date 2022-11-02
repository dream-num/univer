import { BooleanNumber, CommandManager } from '@univer/core';
import { DocPlugin } from '../DocPlugin';

export class DocContainerController {
    private _plugin: DocPlugin;

    constructor(plugin: DocPlugin) {
        this._plugin = plugin;

        this._initialize();
    }

    private _initialize() {}
}
