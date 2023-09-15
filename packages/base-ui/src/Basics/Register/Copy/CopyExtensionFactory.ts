import { Plugin } from '@univerjs/core';

import { ICopyData } from '../../Interfaces/ICopyData';

/**
 * base copy extension
 */
export class BaseCopyExtension<T extends Plugin = Plugin> {
    _data: ICopyData;

    // protected _json: IKeyValue;
    constructor(protected _plugin: T) {
        this._data = {
            name: '',
            value: '',
            embed: true,
        };
    }

    /**
     * Execute the core logic after the check is successful
     */
    execute() {}

    getData(): ICopyData {
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
    create(): BaseCopyExtension {
        return new BaseCopyExtension(this._plugin);
    }

    /**
     * Check if this cell needs to be intercepted currently
     * @param data
     * @returns
     */
    check(): false | BaseCopyExtension {
        return false;
    }
}
