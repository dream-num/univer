import { BasePasteExtension, BasePasteExtensionFactory, IPasteData } from '@univerjs/base-ui';
import { OperationPlugin } from '../../OperationPlugin';

/**
 * TODO
 */
export class PasteOfficeExtension extends BasePasteExtension<OperationPlugin> {}

export class PasteOfficeExtensionFactory extends BasePasteExtensionFactory<OperationPlugin> {
    get zIndex(): number {
        return 2;
    }

    create(data: IPasteData): BasePasteExtension {
        return new PasteOfficeExtension(data, this._plugin);
    }

    check(data: IPasteData): false | BasePasteExtension {
        return false;
    }
}
