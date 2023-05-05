import { BaseCopyExtension, BaseCopyExtensionFactory, ICopyData } from '@univerjs/base-ui';
import { OperationPlugin } from '../../OperationPlugin';

export class CopyExtension extends BaseCopyExtension<OperationPlugin> {
    execute() {
        const value = this._plugin.getUniverCopy().getCopyContent();
        if (!value) return;
        this._data.value = value;
    }
}

export class CopyExtensionFactory extends BaseCopyExtensionFactory<OperationPlugin> {
    get zIndex(): number {
        return 1;
    }

    create(data: ICopyData): BaseCopyExtension {
        return new CopyExtension(data, this._plugin);
    }

    check(data: ICopyData): false | BaseCopyExtension {
        if (data.key === 'type' && data.tag === 'univer') {
            return this.create(data);
        }

        return false;
    }
}
