import { IActionData, Plugin } from '@univerjs/core';
import { IPasteData } from '../../Interfaces/IPasteData';

/**
 * 转化table html/json为json
 */
export class BaseClipboardExtension<T extends Plugin = Plugin> {
    // protected _json: IKeyValue;
    constructor(protected _data: IPasteData, protected _plugin: T) {}

    /**
     * Execute the core logic after the check is successful
     */
    execute(): IActionData[] {return [{actionName:''}]}
}

/**
 * Determine whether to intercept and create BaseClipboardExtension
 */
export class BaseClipboardExtensionFactory<T extends Plugin = Plugin> {
    constructor(protected _plugin: T) {}

    get zIndex() {
        return 0;
    }

    /**
     * Generate Extension
     * @param data
     * @returns
     */
    create(data: IPasteData): BaseClipboardExtension {
        return new BaseClipboardExtension(data, this._plugin);
    }

    /**
     * Check if this cell needs to be intercepted currently
     * @param data
     * @returns
     */
    check(data: IPasteData): false | BaseClipboardExtension {
        return false;
    }
}
