import { handelTableToJson, handlePlainToJson } from '@univer/base-component';
import { BaseClipboardExtension, BaseClipboardExtensionFactory, IClipboardData } from '@univer/common-plugin-register';
import { ClipboardPlugin } from '../../ClipboardPlugin';

export class ClipboardExtension extends BaseClipboardExtension<ClipboardPlugin> {
    execute() {
        const content = this._data.html || this._data.plain;

        let data;
        if (content) {
            if (content.indexOf('<table') > -1 && content.indexOf('<td') > -1) {
                data = handelTableToJson(content);
            } else {
                data = handlePlainToJson(content);
            }
        }

        this._plugin.getUniverPaste().pasteTo(data);
    }
}

export class ClipboardExtensionFactory extends BaseClipboardExtensionFactory<ClipboardPlugin> {
    get zIndex(): number {
        return 1;
    }

    create(data: IClipboardData): BaseClipboardExtension {
        return new ClipboardExtension(data, this._plugin);
    }

    check(data: IClipboardData): false | BaseClipboardExtension {
        const content = data.html || data.plain;
        if (content && content.indexOf('<table') > -1 && content.indexOf('<td') > -1) {
            return this.create(data);
        }

        return false;
    }
}
