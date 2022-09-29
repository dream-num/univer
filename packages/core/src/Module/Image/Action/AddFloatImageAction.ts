import { ActionBase } from '../../../Command';

export class AddFloatImageAction extends ActionBase<any, any> {
    do(): void {}

    redo(): void {}

    undo(): void {}

    validate(): boolean {
        return false;
    }
}
