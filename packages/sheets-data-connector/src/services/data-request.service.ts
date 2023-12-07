import { LocaleService } from '@univerjs/core';
import { MessageType } from '@univerjs/design';
import { HTTPService } from '@univerjs/network';
import { IMessageService } from '@univerjs/ui';
import type { IDisposable } from '@wendellhu/redi';
import { createIdentifier, Inject } from '@wendellhu/redi';

import type { IBackendResponseDataForm, IBackendResponseDataTree } from './interface';
import { replaceViewID } from './utils';

export interface IRequestUrl {
    /**
     * get all data tree
     *
     * GET
     */
    dataTree: string;

    /**
     * get preview data by dataId
     *
     * POST
     */
    previewDataForm: string;

    /**
     * get data by dataId
     *
     * POST
     */
    dataForm: string;
}

export interface IDataRequestService {
    /**
     * get data tree from backend
     */
    getRequestDataTree(): Promise<IBackendResponseDataTree | null>;

    /**
     * get data preview from backend
     */
    getRequestPreviewDataForm(dataId: string): Promise<IBackendResponseDataForm | null>;

    /**
     * get data form from backend
     */
    getRequestDataForm(dataId: string): Promise<IBackendResponseDataForm | null>;
}

export const IDataRequestService = createIdentifier<IDataRequestService>('data-connector.data-request-service');

export class DataRequestService implements IDataRequestService, IDisposable {
    constructor(
        private _url: IRequestUrl | null,
        @IMessageService private readonly _messageService: IMessageService,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @Inject(HTTPService) private readonly _http: HTTPService
    ) {}

    dispose(): void {}

    async getRequestDataTree(): Promise<IBackendResponseDataTree | null> {
        const dataTreeUrl = this._url?.dataTree;
        if (!dataTreeUrl) {
            return this._showUrlError();
        }

        try {
            const response = await this._http.get<IBackendResponseDataTree>(dataTreeUrl);
            const data = response.body;

            if (data.error && data.error.code === 'OK') {
                return data;
            }

            return this._showNetworkError();
        } catch (error) {
            return this._showNetworkError();
        }
    }

    async getRequestPreviewDataForm(dataId: string): Promise<IBackendResponseDataForm | null> {
        let previewDataForm = this._url?.previewDataForm;
        if (!previewDataForm) {
            return this._showUrlError();
        }

        this._messageService.show({
            type: MessageType.Warning,
            content: this._localeService.t('dataConnector.message.preview'),
        });

        previewDataForm = replaceViewID(previewDataForm, dataId);

        try {
            const response = await this._http.post<IBackendResponseDataForm>(previewDataForm);
            const data = response.body;

            if (data.error && data.error.code === 'OK') {
                return data;
            }

            return this._showNetworkError();
        } catch (error) {
            return this._showNetworkError();
        }
    }

    async getRequestDataForm(dataId: string): Promise<IBackendResponseDataForm | null> {
        let dataForm = this._url?.dataForm;
        if (!dataForm) {
            return this._showUrlError();
        }

        this._messageService.show({
            type: MessageType.Warning,
            content: this._localeService.t('dataConnector.message.progress'),
        });

        dataForm = replaceViewID(dataForm, dataId);

        try {
            const response = await this._http.post<IBackendResponseDataForm>(dataForm);
            const data = response.body;

            if (data.error && data.error.code === 'OK') {
                return data;
            }

            return this._showNetworkError();
        } catch (error) {
            return this._showNetworkError();
        }
    }

    private _showNetworkError() {
        this._messageService.show({
            type: MessageType.Error,
            content: this._localeService.t('dataConnector.message.networkError'),
        });
        return null;
    }

    private _showUrlError() {
        this._messageService.show({
            type: MessageType.Error,
            content: this._localeService.t('dataConnector.message.urlError'),
        });

        return null;
    }
}
