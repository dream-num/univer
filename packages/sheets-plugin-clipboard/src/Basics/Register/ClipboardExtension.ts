import { BaseClipboardExtension, BaseClipboardExtensionFactory, IClipboardData } from '@univer/common-plugin-register';
import { ClipboardPlugin } from '../../ClipboardPlugin';

export class ClipboardExtension extends BaseClipboardExtension {
    execute() {}
}

export class ClipboardExtensionFactory extends BaseClipboardExtensionFactory<ClipboardPlugin> {
    get zIndex(): number {
        return 1;
    }

    create(data: IClipboardData): BaseClipboardExtension {
        return new ClipboardExtension(data);
    }

    check(data: IClipboardData): false | BaseClipboardExtension {
        console.log('截获data', data);

        return false;
    }
}
