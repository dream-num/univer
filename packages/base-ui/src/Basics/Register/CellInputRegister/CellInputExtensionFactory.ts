import { ICell } from '../../Interfaces/Cell';

/**
 * Modify cell value
 */
export class BaseCellInputExtension {
    constructor(protected _cell: ICell, protected _value: string) {}

    getCell(): ICell {
        return this._cell;
    }

    /**
     * Modify the value
     */
    setValue(value: string) {}

    /**
     * Execute the core logic after the check is successful
     */
    execute() {}
}

/**
 * Determine whether to intercept and create BaseCellEditExtension
 */
export class BaseCellInputExtensionFactory {
    get zIndex() {
        return 0;
    }

    /**
     * Generate FormulaBar Extension
     * @param value
     * @returns
     */
    create(cell: ICell, value: string): BaseCellInputExtension {
        return new BaseCellInputExtension(cell, value);
    }

    /**
     * Check if this cell needs to be intercepted currently
     * @param row
     * @param column
     * @param value
     * @returns
     */
    check(cell: ICell): false | BaseCellInputExtension {
        return false;
    }
}
