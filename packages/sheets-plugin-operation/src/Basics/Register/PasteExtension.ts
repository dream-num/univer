import {
    BasePasteExtension,
    BasePasteExtensionFactory,
    handelExcelToJson,
    handelTableToJson,
    handlePlainToJson,
    handleTableColgroup,
    handleTableRowGroup,
    IPasteData,
} from '@univerjs/base-ui';
import { OperationPlugin } from '../../OperationPlugin';

// copy paste delete cut insert // SheetsPluginOperation
export class ClipboardExtension extends BasePasteExtension<OperationPlugin> {
    execute() {
        let content = this._data.html || this._data.plain;

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

        const actionDataList = this._plugin.getUniverPaste().pasteTo({
            data,
            colInfo,
            rowInfo,
        });

        return actionDataList
    }
}

export class ClipboardExtensionFactory extends BasePasteExtensionFactory<OperationPlugin> {
    get zIndex(): number {
        return 1;
    }

    create(data: IPasteData): BasePasteExtension {
        return new ClipboardExtension(data, this._plugin);
    }

    check(data: IPasteData): false | BasePasteExtension {
        const content = data.html || data.plain;
        if (content && content.indexOf('<table') > -1 && content.indexOf('<td') > -1) {
            return this.create(data);
        }

        return false;
    }
}
