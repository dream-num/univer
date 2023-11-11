import numfmt from '@univerjs/base-numfmt-engine';
import {
    Disposable,
    LifecycleStages,
    Nullable,
    ObjectMatrix,
    OnLifecycle,
    SheetInterceptorService,
    ThemeService,
    Workbook,
    Worksheet,
} from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import { NumfmtItem } from '../base/types';
import { getPatternType } from '../utils/pattern';

type NumfmtItemWithCache = NumfmtItem & {
    // when change parameters or pattern, the cache is cleared follow mutation execute
    _cache?: {
        result: any;
        parameters: number; // The parameter that was last calculated
    };
};
const defaultWorkbookId = 'workbook-01';
const defaultSheetId = 'sheet-0011';
const defaultData = {
    2: {
        2: {
            pattern: 'yyyy-mm-dd hh:mm:ss',
            type: 'datetime' as const,
        },
    },
    0: { 1: { pattern: 'yyyy-mm-dd hh:mm:ss', type: 'datetime' as const } },
};

@OnLifecycle(LifecycleStages.Ready, NumfmtService)
export class NumfmtService extends Disposable {
    numfmtModel: Map<string, ObjectMatrix<NumfmtItemWithCache>> = new Map();

    constructor(
        @Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService,
        @Inject(ThemeService) private _themeService: ThemeService
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
                const numfmtValue = model.getValue(location.row, location.col);
                if (!numfmtValue) {
                    return next();
                }
                const originCellValue = location.worksheet.getCellRaw(location.row, location.col);
                if (!originCellValue) {
                    return next();
                }
                // TODO: wait for the type attribute to start working
                // if (typeof originCellValue.v !== 'number') {
                //     return next();
                // }

                let numfmtRes: string = '';
                const fmtNumber = Number(originCellValue.v);
                if (numfmtValue._cache && numfmtValue._cache.parameters === originCellValue.v) {
                    return numfmtValue._cache.result;
                }

                numfmtRes = numfmt.format(numfmtValue.pattern, Number(originCellValue.v), { locale: 'zh-CN' });
                if (!numfmtRes) {
                    return next();
                }

                const res = { ...cell, v: numfmtRes };
                if (fmtNumber < 0) {
                    const info = numfmt.getInfo(numfmtValue.pattern);
                    const token = info._partitions[1];
                    if (token.color) {
                        const color = this._themeService.getCurrentTheme()[`${token.color}500`];
                        if (color) {
                            res.s = { cl: { rgb: color } };
                        }
                    }
                }

                numfmtValue._cache = {
                    result: res,
                    parameters: originCellValue.v as number,
                };

                return res;
            },
        });
    }

    /**
     * Process the initial values before entering the edit
     * @private
     * @memberof NumfmtService
     */
    private _initInterceptorEditorStart(
        cell: any,
        location: {
            worksheet: Worksheet;
            workbook: Workbook;
            workbookId: string;
            worksheetId: string;
            row: number;
            col: number;
        },
        next: () => any
    ) {
        const row = location.row;
        const col = location.col;
        const numfmtCell = this.getValue(location.workbookId, location.worksheetId, row, col);
        if (numfmtCell) {
            const type = getPatternType(numfmtCell.pattern);
            switch (type) {
                case 'date':
                case 'time':
                case 'datetime': {
                    return location.worksheet.getCell(row, col);
                }
                case 'scientific':
                case 'percent':
                case 'currency':
                case 'number': {
                    return location.worksheet.getCellRaw(row, col);
                }
                default: {
                    return next && next();
                }
            }
        }
    }

    /**
     * Process the  values after  edit
     * @private
     * @memberof NumfmtService
     */
    private _initInterceptorEditorEnd(
        cell: any,
        location: {
            worksheet: Worksheet;
            workbook: Workbook;
            workbookId: string;
            worksheetId: string;
            row: number;
            col: number;
        },
        next: () => any
    ) {
        if (typeof cell.v === 'number') {
            return next && next();
        }

        const dateInfo = numfmt.parseDate(cell.v);
        if (dateInfo) {
            return dateInfo.v;
        }
        return cell.v;
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
