import { Plugin } from '@univerjs/core';
import { ICopyData } from '../../Interfaces/ICopyData';

/**
 * base copy extension
 */
export class BaseCopyExtension<T extends Plugin = Plugin> {
    // protected _json: IKeyValue;
    constructor(protected _data: ICopyData, protected _plugin: T) {}

    /**
     * Execute the core logic after the check is successful
     */
    execute() {}

    getData() {
        return this._data;
    }
}

/**
 * Determine whether to intercept and create BaseCopyExtension
 */
export class BaseCopyExtensionFactory<T extends Plugin = Plugin> {
    constructor(protected _plugin: T) {}

    get zIndex() {
        return 0;
    }

    /**
     * Generate Extension
     * @param data
     * @returns
     */
    create(data: ICopyData): BaseCopyExtension {
        return new BaseCopyExtension(data, this._plugin);
    }

    /**
     * Check if this cell needs to be intercepted currently
     * @param data
     * @returns
     */
    check(data: ICopyData): false | BaseCopyExtension {
        return false;
    }
}
