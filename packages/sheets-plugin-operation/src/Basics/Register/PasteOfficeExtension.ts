import { BasePasteExtension, BasePasteExtensionFactory, IPasteData } from '@univerjs/base-ui';
import { OperationPlugin } from '../../OperationPlugin';

/**
 * TODO
 */
export class ClipboardOfficeExtension extends BasePasteExtension<OperationPlugin> {
    execute() {}
}

export class ClipboardOfficeExtensionFactory extends BasePasteExtensionFactory<OperationPlugin> {
    get zIndex(): number {
        return 2;
    }

    create(data: IPasteData): BasePasteExtension {
        return new ClipboardOfficeExtension(data, this._plugin);
    }

    check(data: IPasteData): false | BasePasteExtension {
        return false;
    }
}
