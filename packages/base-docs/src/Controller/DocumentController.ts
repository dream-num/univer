import { DocPlugin, IDocPluginConfig } from '../DocPlugin';
import { InputController } from './InputController';

export class DocumentController {
    private _inputController: InputController;

    constructor(private _plugin: DocPlugin, private _config: Partial<IDocPluginConfig> = {}) {
        this._initialize();
    }

    private _initialize() {
        this._inputController = new InputController(this._plugin);
    }
}
