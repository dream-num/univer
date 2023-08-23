import { IDragAndDropData } from '../../Interfaces';

/**
 * 转化table html/json为json
 */
export class BaseDragAndDropExtension {
    // protected _json: IKeyValue;
    constructor(protected _data: File[]) {}

    /**
     * Execute the core logic after the check is successful
     */
    execute() {}
}

/**
 * Determine whether to intercept and create BaseDragAndDropExtension
 */
export class BaseDragAndDropExtensionFactory {
    get zIndex() {
        return 0;
    }

    /**
     * Generate Extension
     * @param data
     * @returns
     */
    create(data: File[]): BaseDragAndDropExtension {
        return new BaseDragAndDropExtension(data);
    }

    /**
     * Check if this cell needs to be intercepted currently
     * @param data
     * @returns
     */
    check(data: IDragAndDropData[]): false | BaseDragAndDropExtension {
        return false;
    }
}
