import { SheetUIPlugin } from '../SheetUIPlugin';

export class SheetUIController {
    protected _plugin: SheetUIPlugin;

    constructor(plugin: SheetUIPlugin) {
        this._plugin = plugin;
    }
}
