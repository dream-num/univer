import { Workbook, Worksheet } from '../Sheets/Domain';
import { ActionBase, IActionData } from './ActionBase';
import { ActionObservers } from './ActionObservers';

/**
 * Format of action data param
 */
export interface ISheetActionData extends IActionData {
    sheetId: string;
    rangeRef?: string;
}

/**
 * Basics class for action
 *
 * TODO: SlideAction/DocAction
 * @beta
 */
export abstract class SheetAction<
    D extends ISheetActionData,
    O extends ISheetActionData = D,
    R = void
> extends ActionBase<D, O, R> {
    protected _workbook: Workbook;

    protected constructor(
        actionData: D,
        workbook: Workbook,
        observers: ActionObservers
    ) {
        super(actionData, observers);
        this._workbook = workbook;
    }

    getWorkSheet(): Worksheet {
        const { _workbook, _doActionData } = this;
        const { sheetId } = _doActionData;
        return _workbook.getSheetBySheetId(sheetId) as Worksheet;
    }

    getWorkBook(): Workbook {
        return this._workbook;
    }
}
