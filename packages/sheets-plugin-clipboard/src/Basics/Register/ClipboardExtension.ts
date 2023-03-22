import {
    BaseClipboardExtension,
    BaseClipboardExtensionFactory,
    handelExcelToJson,
    handelTableToJson,
    handlePlainToJson,
    handleTableColgroup,
    handleTableRowGroup,
    IClipboardData,
} from '@univerjs/base-ui';
import { ClipboardPlugin } from '../../ClipboardPlugin';

export class ClipboardExtension extends BaseClipboardExtension<ClipboardPlugin> {
    execute() {
        const content = this._data.html || this._data.plain;

        let data;
        let colInfo;
        let rowInfo;
        if (content) {
            if (content.indexOf('xmlns:x="urn:schemas-microsoft-com:office:excel"') > -1) {
                data = handelExcelToJson(content);
                colInfo = handleTableColgroup(content);
                rowInfo = handleTableRowGroup(content);
            } else if (content.indexOf('<table') > -1 && content.indexOf('<td') > -1) {
                data = handelTableToJson(content);
                colInfo = handleTableColgroup(content);
                rowInfo = handleTableRowGroup(content);
            } else {
                data = handlePlainToJson(content);
            }
        }

        this._plugin.getUniverPaste().pasteTo({
            data,
            colInfo,
            rowInfo,
        });
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
