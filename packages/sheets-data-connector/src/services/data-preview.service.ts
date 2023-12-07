import type { ICellData, ObjectMatrixPrimitiveType } from '@univerjs/core';
import type { IDisposable } from '@wendellhu/redi';
import { createIdentifier } from '@wendellhu/redi';
import { type Observable, Subject } from 'rxjs';

export interface IDataInfo {
    cellValue: ObjectMatrixPrimitiveType<ICellData>;
}

export interface IDataPreviewService {
    /**
     * Data source information
     */
    dataInfo$: Observable<IDataInfo>;

    /**
     * Whether to preview
     */
    state$: Observable<boolean>;

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
    private readonly _dataInfo$ = new Subject<IDataInfo>();

    private readonly _state$ = new Subject<boolean>();

    readonly dataInfo$ = this._dataInfo$.asObservable();

    readonly state$ = this._state$.asObservable();

    dispose(): void {
        this._dataInfo$.complete();
        this._state$.complete();
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
        this._dataInfo$.next(param);
    }

    setState(state: boolean) {
        this._state$.next(state);
    }
}
