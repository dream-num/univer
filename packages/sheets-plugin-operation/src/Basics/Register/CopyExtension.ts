import { BaseCopyExtension, BaseCopyExtensionFactory, ICopyData } from '@univerjs/base-ui';
import { OperationPlugin } from '../../OperationPlugin';

export class CopyExtension extends BaseCopyExtension<OperationPlugin> {
    execute() {
        const value = this._plugin.getUniverCopy().getCopyContent();
        if (!value) return;
        this._data.name = 'table'
        this._data.value = value;
    }
}

export class CopyExtensionFactory extends BaseCopyExtensionFactory<OperationPlugin> {
    get zIndex(): number {
        return 1;
    }

    create(): BaseCopyExtension {
        return new CopyExtension(this._plugin);
    }

    // To generate a fixed-format table, you must execute
    check(): false | BaseCopyExtension {
        return this.create();
    }
}
