import { BaseClipboardExtension, BaseClipboardExtensionFactory, IClipboardData } from '@univerjs/base-ui';
import { OperationPlugin } from '../../OperationPlugin';

/**
 * TODO
 */
export class ClipboardOfficeExtension extends BaseClipboardExtension<OperationPlugin> {
    execute() {}
}

export class ClipboardOfficeExtensionFactory extends BaseClipboardExtensionFactory<OperationPlugin> {
    get zIndex(): number {
        return 2;
    }

    create(data: IClipboardData): BaseClipboardExtension {
        return new ClipboardOfficeExtension(data, this._plugin);
    }

    check(data: IClipboardData): false | BaseClipboardExtension {
        return false;
    }
}
