import { Plugin } from '@univer/core';

export interface ICell {
    row: number;
    column: number;
    value: string;
}

/**
 * Modify cell value
 */
export class BaseCellExtension {
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
 * Determine whether to intercept and create BaseCellExtension
 */
export class BaseCellExtensionFactory<T extends Plugin = Plugin> {
    constructor(protected _plugin: T) {}

    get zIndex() {
        return 0;
    }

    /**
     * Generate Cell Extension
     * @param value
     * @returns
     */
    create(cell: ICell, value: string): BaseCellExtension {
        return new BaseCellExtension(cell, value);
    }

    /**
     * Check if this cell needs to be intercepted currently
     * @param row
     * @param column
     * @param value
     * @returns
     */
    check(cell: ICell): false | BaseCellExtension {
        return false;
    }
}
