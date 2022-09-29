import { ConvertorBase, EXTENSION_NAMES } from '@univer/core';

export class ArrayConvertor extends ConvertorBase {
    constructor() {
        super();
        this.name = EXTENSION_NAMES.ARRAY_CONVERTOR;
    }

    execute(operation: string, type: string, attribute: string, key?: string, value?: string): object {
        return {};
    }
}
