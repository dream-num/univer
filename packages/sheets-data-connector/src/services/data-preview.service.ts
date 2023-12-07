import type { ICellData, ObjectMatrixPrimitiveType } from '@univerjs/core';
import type { IDisposable } from '@wendellhu/redi';
import { createIdentifier } from '@wendellhu/redi';
import { type Observable, Subject } from 'rxjs';

export interface IDataTree {
    id: string;
    name: string;
    children: IDataTree[];
}

export interface IDataInfo {
    cellValue: ObjectMatrixPrimitiveType<ICellData>;
}

export interface IDataPreviewService {
    /**
     * Select new data source
     */
    dataInfo$: Observable<void>;

    /**
     * Whether to preview
     */
    state$: Observable<boolean>;

    /**
     * Get data source information
     */
    getDataInfo(): IDataInfo | null;

    /**
     * Set data source information
     * @param dataId
     */
    setDataInfo(dataId: string): void;

    /**
     * Set whether to preview
     * @param state
     */
    setState(state: boolean): void;
}

export const IDataPreviewService = createIdentifier<IDataPreviewService>('data-connector.data-preview-service');

export class DataPreviewService implements IDataPreviewService, IDisposable {
    private readonly _dataInfo$ = new Subject<void>();

    private readonly _state$ = new Subject<boolean>();

    readonly dataInfo$ = this._dataInfo$.asObservable();

    readonly state$ = this._state$.asObservable();

    private _dataInfo: IDataInfo | null;

    private _dataTree: IDataTree | null;

    dispose(): void {
        this._dataInfo$.complete();
        this._state$.complete();
        this._dataInfo = null;
    }

    getDataInfo(): IDataInfo | null {
        return this._dataInfo;
    }

    setDataInfo(dataId: string) {
        const data: { [key: string]: ObjectMatrixPrimitiveType<ICellData> } = {
            '1': {
                0: {
                    0: {
                        v: '111',
                    },
                },
            },
            '2': {
                0: {
                    0: {
                        v: '222',
                    },
                },
            },
        };
        const param: IDataInfo = {
            cellValue: data[dataId],
        };

        this._dataInfo = param;
        this._dataInfo$.next();
    }

    setState(state: boolean) {
        this._state$.next(state);
    }

    getDataTree() {
        if (!this._dataTree) {
            this._requestDataTree();
        }

        return this._dataTree;
    }

    private _requestDataTree() {}

    private _requestDataById(dataId: string) {}
}
