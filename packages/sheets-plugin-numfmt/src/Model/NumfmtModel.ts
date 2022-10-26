import { ObjectMatrixPrimitiveType } from '@univer/core';

export class NumfmtModel {
    protected _sheetsNumfmtConfig: Map<string, ObjectMatrixPrimitiveType<string>>;

    constructor() {
        this._sheetsNumfmtConfig = new Map();
    }

    getNumfmtBySheetIdConfig(sheetId: string): ObjectMatrixPrimitiveType<string> {
        let sheetNumfmtMatrix = this._sheetsNumfmtConfig.get(sheetId);
        if (sheetNumfmtMatrix) {
            return sheetNumfmtMatrix;
        }
        sheetNumfmtMatrix = {};
        this._sheetsNumfmtConfig.set(sheetId, sheetNumfmtMatrix);
        return sheetNumfmtMatrix;
    }
}
