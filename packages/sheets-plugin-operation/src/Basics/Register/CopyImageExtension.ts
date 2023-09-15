import { BaseCopyExtension, BaseCopyExtensionFactory } from '@univerjs/base-ui';

import { OperationPlugin } from '../../OperationPlugin';

// TODO 这个模块应该放到图片插件 @jerry
export class CopyImageExtension extends BaseCopyExtension<OperationPlugin> {
    execute() {
        const value = this._handleImage();
        if (!value) return;
        this._data.name = 'image';
        this._data.value = value;
    }

    private _handleImage() {
        // TODO 根据当前选区范围，从图片差距中取出配置 @jerry
        const image = [{ left: 0, right: 0, width: 100, height: 100, url: 'image_url' }];
        return JSON.stringify(image);
    }
}

export class CopyImageExtensionFactory extends BaseCopyExtensionFactory<OperationPlugin> {
    get zIndex(): number {
        return 2;
    }

    create(): BaseCopyExtension {
        return new CopyImageExtension(this._plugin);
    }

    check(): false | BaseCopyExtension {
        return this.create();
    }
}
