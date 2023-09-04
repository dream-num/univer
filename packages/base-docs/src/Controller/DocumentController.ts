import { Injector } from '@wendellhu/redi';
import { InputController } from './InputController';

export class DocumentController {
    private readonly _inputController: InputController;

    constructor(injector: Injector) {
        this._inputController = injector.createInstance(InputController) as InputController;
    }
}
