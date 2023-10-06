import { Disposable } from '../../Shared/lifecycle';

/**
 * Worksheet should provide `SheetViewModel` a `ISheetModelInterface` for it to
 * get or update raw values.
 */
export interface ISheetModelInterface {}

/**
 * SheetViewModel
 */
export class SheetViewModel extends Disposable {
    constructor(private readonly _modelInterface: ISheetModelInterface) {
        super();
    }
}

// 这个文件可能会很长很长...
