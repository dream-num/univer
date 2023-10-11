import { IDisposable } from '@wendellhu/redi';

import { remove } from '../common/array';
import { Nullable } from '../common/type-utils';
import { Disposable, toDisposable } from '../Shared/lifecycle';
import { ICellData } from '../Types/Interfaces/ICellData';

/**
 * Worksheet should provide `SheetViewModel` a `ISheetModelInterface` for it to
 * get or update raw values.
 */
export interface ISheetModelInterface {
    getCellContent(row: number, col: number): Nullable<ICellData>;
}

export interface ICellContentInterceptor {
    getCellContent(row: number, col: number): Nullable<ICellData>;
}

export interface IRowFilteredInterceptor {}

export interface IRowVisibleInterceptor {}

export interface IColVisibleInterceptor {}

export interface ISheetViewModel {
    registerCellContentInterceptor(interceptor: ICellContentInterceptor): IDisposable;
    registerRowFilteredInterceptor(interceptor: IRowFilteredInterceptor): IDisposable;
    registerRowVisibleInterceptor(interceptor: IRowVisibleInterceptor): IDisposable;
    registerColVisibleInterceptor(interceptor: IColVisibleInterceptor): IDisposable;

    getCellContent(row: number, col: number): Nullable<ICellData>;
}

/**
 * SheetViewModel
 */
export class SheetViewModel extends Disposable implements ISheetViewModel {
    private readonly _cellContentInterceptors: ICellContentInterceptor[] = [];
    private readonly _rowFilteredInterceptors: IRowFilteredInterceptor[] = [];
    private readonly _rowVisibleInterceptors: IRowVisibleInterceptor[] = [];
    private readonly _colVisibleInterceptors: IColVisibleInterceptor[] = [];

    constructor(private readonly _modelInterface: ISheetModelInterface) {
        super();
    }

    override dispose(): void {
        super.dispose();

        this._cellContentInterceptors.length = 0;
        this._rowFilteredInterceptors.length = 0;
        this._rowVisibleInterceptors.length = 0;
        this._colVisibleInterceptors.length = 0;
    }

    getCellContent(row: number, col: number): Nullable<ICellData> {
        // TODO@wzhudev: we may need to merge cell values and styles can cache results
        // For examples styles cannot be a single string but a style object!
        for (const interceptor of this._cellContentInterceptors) {
            const result = interceptor.getCellContent(row, col);
            if (typeof result !== 'undefined') {
                return result;
            }
        }

        // First it could call each interceptor to get the cell content
        // If there is no interceptor nor interceptors return undefined, then
        // it will call the model interface to get the cell content.
        // NOTE: will performance be an issue?
        return this._modelInterface.getCellContent(row, col);
    }

    registerCellContentInterceptor(interceptor: ICellContentInterceptor): IDisposable {
        if (this._cellContentInterceptors.includes(interceptor)) {
            throw new Error('[SheetViewModel]: Interceptor already registered.');
        }

        this._cellContentInterceptors.push(interceptor);
        return toDisposable(() => remove(this._cellContentInterceptors, interceptor));
    }

    registerRowFilteredInterceptor(interceptor: IRowFilteredInterceptor): IDisposable {
        if (this._rowFilteredInterceptors.includes(interceptor)) {
            throw new Error('[SheetViewModel]: Interceptor already registered.');
        }

        this._rowFilteredInterceptors.push(interceptor);
        return toDisposable(() => remove(this._rowFilteredInterceptors, interceptor));
    }

    registerRowVisibleInterceptor(interceptor: IRowVisibleInterceptor): IDisposable {
        if (this._rowVisibleInterceptors.includes(interceptor)) {
            throw new Error('[SheetViewModel]: Interceptor already registered.');
        }

        this._rowVisibleInterceptors.push(interceptor);
        return toDisposable(() => remove(this._rowVisibleInterceptors, interceptor));
    }

    registerColVisibleInterceptor(interceptor: IColVisibleInterceptor): IDisposable {
        if (this._colVisibleInterceptors.includes(interceptor)) {
            throw new Error('[SheetViewModel]: Interceptor already registered.');
        }

        this._colVisibleInterceptors.push(interceptor);
        return toDisposable(() => remove(this._colVisibleInterceptors, interceptor));
    }
}
