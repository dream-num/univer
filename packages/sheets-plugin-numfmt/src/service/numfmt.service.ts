import numfmt from '@univerjs/base-numfmt-engine';
import {
    Disposable,
    IUniverInstanceService,
    LifecycleStages,
    Nullable,
    ObjectMatrix,
    OnLifecycle,
    SheetInterceptorService,
} from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

interface NumfmtItem {
    pattern: string;
}

const defaultWorkbookId = 'workbook-01';
const defaultSheetId = 'sheet-0011';
const defaultData = {
    2: {
        2: {
            pattern: 'yyyy-mm-dd hh:mm:ss',
        },
    },
    0: { 1: { pattern: 'yyyy-mm-dd hh:mm:ss' } },
};
/**
 * Collect side effects caused by ref range change
 */
@OnLifecycle(LifecycleStages.Ready, NumfmtService)
export class NumfmtService extends Disposable {
    numfmtModel: Map<string, ObjectMatrix<NumfmtItem>> = new Map();

    constructor(
        @Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService
    ) {
        super();
        this.numfmtModel.set(getModelKey(defaultWorkbookId, defaultSheetId), new ObjectMatrix(defaultData));
        this._initInterceptorCellContent();
    }

    private _initInterceptorCellContent() {
        this._sheetInterceptorService.interceptCellContent({
            getCell: (cell = {}, location, next) => {
                const workbookId = location.workbookId;
                const sheetId = location.worksheetId;
                const key = getModelKey(workbookId, sheetId);
                const model = this.numfmtModel.get(key);
                if (!model) {
                    return next();
                }
                const value = model.getValue(location.row, location.col);
                if (!value) {
                    return next();
                }
                const originCellValue = location.worksheet.getCellRaw(location.row, location.col);
                if (!originCellValue) {
                    return next();
                }
                const numfmtRes = numfmt.format(value.pattern, Number(originCellValue.v));
                if (!numfmtRes) {
                    return next();
                }
                const res = { ...cell, v: numfmtRes };
                return res;
            },
        });
    }

    private _getModel(workbookId: string, worksheetId: string) {
        const key = getModelKey(workbookId, worksheetId);
        return this.numfmtModel.get(key);
    }

    private _deleteModel(workbookId: string, worksheetId: string) {
        const key = getModelKey(workbookId, worksheetId);
        this.numfmtModel.delete(key);
    }

    getValue(workbookId: string, worksheetId: string, row: number, col: number) {
        const model = this._getModel(workbookId, worksheetId);
        if (!model) {
            return null;
        }
        return model.getValue(row, col);
    }

    setValue(workbookId: string, worksheetId: string, row: number, col: number, value: Nullable<NumfmtItem>) {
        let model = this._getModel(workbookId, worksheetId);
        if (!model) {
            const key = getModelKey(workbookId, worksheetId);
            model = new ObjectMatrix();
            this.numfmtModel.set(key, model);
        }
        if (value) {
            model.setValue(row, col, value);
        } else {
            model.deleteValue(row, col);
            if (!model.getSizeOf()) {
                this._deleteModel(workbookId, worksheetId);
            }
        }
    }
}

const getModelKey = (workbookId: string, worksheetId: string) => `${workbookId}_${worksheetId}`;
