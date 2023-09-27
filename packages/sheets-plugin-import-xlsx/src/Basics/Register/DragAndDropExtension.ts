import { BaseDragAndDropExtension, BaseDragAndDropExtensionFactory, IDragAndDropData } from '@univerjs/base-ui';
import { Inject, Injector } from '@wendellhu/redi';

import { ImportXlsxController } from '../../Controller/ImportXlsxController';

export class DragAndDropExtension extends BaseDragAndDropExtension {
    constructor(
        data: File[],
        @Inject(ImportXlsxController) private readonly _importXlsxController: ImportXlsxController
    ) {
        super(data);
    }

    override execute() {
        // this._importXlsxController.handleFiles(this._data);
    }
}

export class DragAndDropExtensionFactory extends BaseDragAndDropExtensionFactory {
    constructor(@Inject(Injector) private readonly _sheetInjector: Injector) {
        super();
    }

    override get zIndex(): number {
        return 1;
    }

    override create(data: File[]): BaseDragAndDropExtension {
        return this._sheetInjector.createInstance(DragAndDropExtension, data);
    }

    override check(data: IDragAndDropData[]): false | BaseDragAndDropExtension {
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
