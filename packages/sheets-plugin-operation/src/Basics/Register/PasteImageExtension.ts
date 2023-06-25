import { BasePasteExtension, BasePasteExtensionFactory, IPasteData } from '@univerjs/base-ui';
import { OperationPlugin } from '../../OperationPlugin';

// copy paste delete cut insert // TODO 这个模块应该放到图片插件 @jerry
export class PasteImageExtension extends BasePasteExtension<OperationPlugin> {
    execute() {
        let content = this._data.html || this._data.plain;
        console.info('cc--', content);
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

        // TODO embed="true",直接解析table标签上的配置data-image="[{config}]" @jerry
        // TODO embed="false",识别table标签上的univerId,sheetId,rangeData中的范围是否包含image信息，有则直接从本地取,没有就略过 @jerry
        if (content && content.indexOf('data-image') > -1) {
            return this.create(data);
        }

        return false;
    }
}
