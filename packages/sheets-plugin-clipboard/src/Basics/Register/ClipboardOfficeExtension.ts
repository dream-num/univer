import { BaseClipboardExtension, BaseClipboardExtensionFactory, IClipboardData } from '@univerjs/base-ui';
import { ClipboardPlugin } from '../../ClipboardPlugin';

/**
 * TODO
 */
export class ClipboardOfficeExtension extends BaseClipboardExtension<ClipboardPlugin> {
    execute() {}
}

export class ClipboardOfficeExtensionFactory extends BaseClipboardExtensionFactory<ClipboardPlugin> {
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
