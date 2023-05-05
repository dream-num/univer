import { BasePasteExtension, BasePasteExtensionFactory, IPasteData } from '@univerjs/base-ui';
import { OperationPlugin } from '../../OperationPlugin';

// copy paste delete cut insert // SheetsPluginOperation
export class PasteImageExtension extends BasePasteExtension<OperationPlugin> {
    execute() {
        let content = this._data.html || this._data.plain;

        console.info('image content', content);

        return [];
    }
}

export class PasteImageExtensionFactory extends BasePasteExtensionFactory<OperationPlugin> {
    get zIndex(): number {
        return 3;
    }

    create(data: IPasteData): BasePasteExtension {
        return new PasteImageExtension(data, this._plugin);
    }

    check(data: IPasteData): false | BasePasteExtension {
        const content = data.html || data.plain;

        // TODO 识别univerId,sheetId,rangeData中的范围是否包含image信息，有则直接从本地取
        if (content && content.indexOf('data-image') > -1) {
            return this.create(data);
        }

        return false;
    }
}
