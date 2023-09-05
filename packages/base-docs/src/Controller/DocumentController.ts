import { Injector, Inject } from '@wendellhu/redi';
import { InputController } from './InputController';

export class DocumentController {
    private readonly _inputController: InputController;

    constructor(@Inject(Injector) private readonly _injector: Injector) {
        this._inputController = this._injector.createInstance(InputController);
    }
}
