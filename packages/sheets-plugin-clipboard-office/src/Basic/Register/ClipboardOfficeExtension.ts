import { BaseClipboardExtension, BaseClipboardExtensionFactory, IClipboardData } from '@univer/common-plugin-register';
import { ClipboardOfficePlugin } from '../../ClipboardOfficePlugin';

export class ClipboardOfficeExtension extends BaseClipboardExtension {
    execute() {}
}

export class ClipboardOfficeExtensionFactory extends BaseClipboardExtensionFactory<ClipboardOfficePlugin> {
    get zIndex(): number {
        return 1;
    }

    create(data: IClipboardData): BaseClipboardExtension {
        return new ClipboardOfficeExtension(data);
    }

    check(data: IClipboardData): false | BaseClipboardExtension {
        console.log('截获 office data', data);

        return false;
    }
}
