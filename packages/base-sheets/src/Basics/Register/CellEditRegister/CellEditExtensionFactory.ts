import { Plugin } from '@univer/core';
import { ICell } from '../../Interfaces';

/**
 * Modify cell value
 */
export class BaseCellEditExtension {
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
export class BaseCellEditExtensionFactory<T extends Plugin = Plugin> {
    constructor(protected _plugin: T) {}

    get zIndex() {
        return 0;
    }

    /**
     * Generate Cell Extension
     * @param value
     * @returns
     */
    create(cell: ICell, value: string): BaseCellEditExtension {
        return new BaseCellEditExtension(cell, value);
    }

    /**
     * Check if this cell needs to be intercepted currently
     * @param row
     * @param column
     * @param value
     * @returns
     */
    check(cell: ICell): false | BaseCellEditExtension {
        return false;
    }
}
