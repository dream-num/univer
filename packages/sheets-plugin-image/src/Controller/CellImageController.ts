import { SheetContainerUIController } from '@univerjs/ui-plugin-sheets';
import { Inject } from '@wendellhu/redi';

export class CellImageController {
    constructor(@Inject(SheetContainerUIController) private readonly _sheetContainerUIController: SheetContainerUIController) {
        // TODO ...
    }
}
