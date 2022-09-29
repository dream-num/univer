import { ConvertorBase, EXTENSION_NAMES } from '@univer/core';

export class MatrixConvertor extends ConvertorBase {
    constructor() {
        super();
        this.name = EXTENSION_NAMES.MATRIX_CONVERTOR;
    }

    execute(operation: string, type: string, attribute: string, key?: string, value?: string): object {
        return {};
    }
}
