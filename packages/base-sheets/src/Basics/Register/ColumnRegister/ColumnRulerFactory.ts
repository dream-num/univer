import { ObjectArray, Plugin } from '@univerjs/core';
import { IColumnRulerData } from '../../Interfaces/IRulerManager';

/**
 * Modify cell value
 */
export class BaseColumnRuler<T extends Plugin = Plugin> {
    constructor(protected _sheetId: string, protected _columnIndex: number, protected _numColumns: number, protected _plugin: T) {
        //
    }

    /**
     * Execute the core logic after the check is successful
     */
    getUpdatedHidden(): ObjectArray<IColumnRulerData> {
        return new ObjectArray();
    }
}

/**
 * Determine whether to intercept and create BaseColumnRuler
 */
export class BaseColumnRulerFactory<T extends Plugin = Plugin> {
    constructor(protected _plugin: T) {}

    get zIndex() {
        return 0;
    }

    /**
     * Generate Cell Extension
     * @param value
     * @returns
     */
    create(sheetId: string, columnIndex: number, numColumns: number): BaseColumnRuler<T> {
        return new BaseColumnRuler(sheetId, columnIndex, numColumns, this._plugin);
    }

    /**
     * Check if this cell needs to be intercepted currently
     * @param row
     * @param column
     * @param value
     * @returns
     */
    check(sheetId: string, columnIndex: number, numColumns: number): BaseColumnRuler {
        return this.create(sheetId, columnIndex, numColumns);
    }
}
