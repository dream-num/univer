import {
    BaseInsertExtension,
    BaseInsertExtensionFactory,
    handelExcelToJson,
    handelTableToJson,
    handlePlainToJson,
    handleTableColgroup,
    handleTableRowGroup,
    IInsertData,
} from '@univerjs/base-ui';
import { OperationPlugin } from '../../OperationPlugin';

export class InsertExtension extends BaseInsertExtension<OperationPlugin> {
    execute() {
        let content = this._data.html || this._data.plain;

        let data;
        let colInfo;
        let rowInfo;
        if (content) {
            // TODO move to InsertOfficeExtension 
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

        const actionDataList = this._plugin.getUniverInsert().InsertTo({
            data,
            colInfo,
            rowInfo,
        });

        return actionDataList
    }
}

export class InsertExtensionFactory extends BaseInsertExtensionFactory<OperationPlugin> {
    get zIndex(): number {
        return 1;
    }

    create(data: IInsertData): BaseInsertExtension {
        return new InsertExtension(data, this._plugin);
    }

    check(data: IInsertData): false | BaseInsertExtension {
        const content = data.html || data.plain;
        if (content && content.indexOf('<table') > -1 && content.indexOf('<td') > -1) {
            return this.create(data);
        }

        return false;
    }
}
