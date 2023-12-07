import type { ICellData, ObjectMatrixPrimitiveType } from '@univerjs/core';
import type { IDisposable } from '@wendellhu/redi';
import { createIdentifier, Inject } from '@wendellhu/redi';
import { type Observable, Subject } from 'rxjs';

import type { DataRequestService } from './data-request.service';
import { IDataRequestService } from './data-request.service';
import type { IDataTree } from './interface';
import { convertDataSource, convertDataTree } from './utils';

export interface IDataInfo {
    cellValue: ObjectMatrixPrimitiveType<ICellData>;
}

export interface IDataPreviewService {
    /**
     * Select new preview data source
     */
    previewDataInfo$: Observable<void>;

    /**
     * Select real data source
     */
    dataInfo$: Observable<void>;

    /**
     * Whether to preview
     */
    state$: Observable<boolean>;

    /**
     * Get whether to preview
     */
    getState(): boolean | null;

    /**
     * Get preview data source information
     */
    getPreviewDataInfo(): IDataInfo | null;

    /**
     * Set preview data source information
     * @param dataId
     */
    setPreviewDataInfo(dataId: string): void;

    /**
     * Get real data source information
     */
    getDataInfo(): IDataInfo | null;

    /**
     * Set real data source information
     * @param dataId
     */
    setDataInfo(dataId: string): void;

    /**
     * Set whether to preview
     * @param state
     */
    setState(state: boolean): void;

    /**
     * Get all data tree
     */
    getDataTree(): Promise<IDataTree | null>;

    /**
     * Get preview data
     * @param dataId
     */
    getPreviewDataForm(dataId: string): Promise<ObjectMatrixPrimitiveType<ICellData> | null>;

    /**
     * Get real data
     * @param dataId
     */
    getDataForm(dataId: string): Promise<ObjectMatrixPrimitiveType<ICellData> | null>;
}

export const IDataPreviewService = createIdentifier<IDataPreviewService>('data-connector.data-preview-service');

export class DataPreviewService implements IDataPreviewService, IDisposable {
    private readonly _previewDataInfo$ = new Subject<void>();

    private readonly _dataInfo$ = new Subject<void>();

    private readonly _state$ = new Subject<boolean>();

    readonly previewDataInfo$ = this._previewDataInfo$.asObservable();

    readonly dataInfo$ = this._dataInfo$.asObservable();

    readonly state$ = this._state$.asObservable();

    private _state: boolean | null;

    private _previewDataInfo: IDataInfo | null;

    private _dataInfo: IDataInfo | null;

    private _dataTree: IDataTree | null;

    constructor(@Inject(IDataRequestService) private readonly _dataRequestService: DataRequestService) {}

    dispose(): void {
        this._previewDataInfo$.complete();
        this._dataInfo$.complete();
        this._state$.complete();
        this._state = null;
        this._previewDataInfo = null;
        this._dataInfo = null;
        this._dataTree = null;
    }

    getState() {
        return this._state;
    }

    getPreviewDataInfo() {
        return this._previewDataInfo;
    }

    getDataInfo() {
        return this._dataInfo;
    }

    async setPreviewDataInfo(dataId: string) {
        const cellValue = await this.getPreviewDataForm(dataId);

        if (!cellValue) return;

        const param: IDataInfo = {
            cellValue,
        };

        this._previewDataInfo = param;
        this._previewDataInfo$.next();
    }

    async setDataInfo(dataId: string) {
        const cellValue = await this.getDataForm(dataId);

        if (!cellValue) return;

        const param: IDataInfo = {
            cellValue,
        };

        this._dataInfo = param;
        this._dataInfo$.next();
    }

    setState(state: boolean) {
        this._state = state;
        this._state$.next(state);
    }

    async getDataTree() {
        if (!this._dataTree) {
            const requestDataTree = await this._dataRequestService.getRequestDataTree();

            if (!requestDataTree) return null;

            return (this._dataTree = convertDataTree(requestDataTree));
        }

        return this._dataTree;
    }

    async getPreviewDataForm(dataId: string) {
        const requestDataForm = await this._dataRequestService.getRequestPreviewDataForm(dataId);

        if (!requestDataForm) return null;

        return convertDataSource(requestDataForm);
    }

    async getDataForm(dataId: string) {
        const requestDataForm = await this._dataRequestService.getRequestDataForm(dataId);

        if (!requestDataForm) return null;

        return convertDataSource(requestDataForm);
    }
}
