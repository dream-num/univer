import { BaseCopyExtension, BaseCopyExtensionFactory, ICopyData } from '@univerjs/base-ui';
import { OperationPlugin } from '../../OperationPlugin';

export class CopyImageExtension extends BaseCopyExtension<OperationPlugin> {
    execute() {
        const value = this._handleImage();
        if (!value) return;
        this._data.value = value;
    }

    private _handleImage() {
        const image = [{ left: 0, right: 0, width: 100, height: 100, url: 'image_url' }];
        return JSON.stringify(image);
    }
}

export class CopyImageExtensionFactory extends BaseCopyExtensionFactory<OperationPlugin> {
    get zIndex(): number {
        return 2;
    }

    create(data: ICopyData): BaseCopyExtension {
        return new CopyImageExtension(data, this._plugin);
    }

    check(data: ICopyData): false | BaseCopyExtension {
        const { copy } = this._plugin.getConfig();
        const embed = copy.embed;
        if (embed) {
            data.key = 'property';
            data.tag = 'image';
            return this.create(data);
        }

        return false;
    }
}
