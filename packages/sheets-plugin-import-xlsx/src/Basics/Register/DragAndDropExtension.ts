import { BaseDragAndDropExtension, BaseDragAndDropExtensionFactory, IDragAndDropData } from '@univerjs/base-ui';
import { ImportXlsxPlugin } from '../../ImportXlsxPlugin';

export class DragAndDropExtension extends BaseDragAndDropExtension<ImportXlsxPlugin> {
    execute() {
        this._plugin.getImportXlsxController().handleFiles(this._data);
    }
}

export class DragAndDropExtensionFactory extends BaseDragAndDropExtensionFactory<ImportXlsxPlugin> {
    get zIndex(): number {
        return 1;
    }

    create(data: File[]): BaseDragAndDropExtension {
        return new DragAndDropExtension(data, this._plugin);
    }

    check(data: IDragAndDropData[]): false | BaseDragAndDropExtension {
        const matchData: File[] = [];

        data.forEach((item) => {
            if (item.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
                matchData.push(item.file);
            }
        });

        if (matchData.length > 0) {
            return this.create(matchData);
        }

        return false;
    }
}
