import { ObjectMatrixPrimitiveType } from '../../Shared';
import { Workbook } from '../Domain';
import { ActionBase, IActionData } from '../../Command/ActionBase';
import { SetBorder } from '../Apply';
import { IStyleData } from '../../Interfaces';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';

/**
 * @internal
 * Border style format
 */
export interface BorderStyleData extends IActionData {
    styles: ObjectMatrixPrimitiveType<IStyleData>;
}

/**
 * set border style
 *
 * @internal
 */
export class SetBorderAction extends ActionBase<BorderStyleData, BorderStyleData> {
    constructor(
        actionData: BorderStyleData,
        workbook: Workbook,
        observers: ActionObservers
    ) {
        super(actionData, workbook, observers);
        this._doActionData = {
            ...actionData,
            convertor: [],
        };
        this._oldActionData = {
            ...actionData,
            styles: this.do(),
            convertor: [],
        };
        this.validate();
    }

    do(): ObjectMatrixPrimitiveType<IStyleData> {
        const workSheet = this.getWorkSheet();
        const matrix = workSheet.getCellMatrix();
        const context = workSheet.getContext();
        const workBook = context.getWorkBook();
        const styles = workBook.getStyles();

        const result = SetBorder(matrix, styles, this._doActionData.styles);

        this._observers.notifyObservers({
            type: ActionType.REDO,
            data: this._doActionData,
            action: this,
        });

        return result;
    }

    redo(): void {
        this.do();
    }

    undo(): void {
        const wokSheet = this.getWorkSheet();
        const matrix = wokSheet.getCellMatrix();
        const context = wokSheet.getContext();
        const workBook = context.getWorkBook();
        const styles = workBook.getStyles();

        SetBorder(matrix, styles, this._oldActionData.styles);

        this._observers.notifyObservers({
            type: ActionType.UNDO,
            data: this._oldActionData,
            action: this,
        });
    }

    validate(): boolean {
        return false;
    }
}
