import { LocaleService } from '@univerjs/core';
import { MessageType } from '@univerjs/design';
import { IMessageService } from '@univerjs/ui';
import type { IDisposable } from '@wendellhu/redi';
import { createIdentifier, Inject } from '@wendellhu/redi';

import type { IBackendResponseDataForm, IBackendResponseDataTree } from './interface';
import { replaceViewID } from './utils';

// used for test
export const MOCK_DATA_TREE = {
    error: {
        code: 'OK',
        message: 'success',
    },
    display: {
        type: 'tree',
        name: '金融连接器11111111111111111111111111111111111',
        uuid: '',
        nodes: [
            {
                name: 'A',
                child: [
                    {
                        name: 'B',
                        child: [],
                        views: [
                            {
                                viewID: '0c4334e4-85a9-46f3-b214-b14693e07bea',
                                name: '2023的数据',
                            },
                        ],
                    },
                ],
                views: [],
            },
            {
                name: 'C',
                child: [],
                views: [
                    {
                        viewID: '0c4334e4-85a9-46f3-b214-b14693e07bea',
                        name: '2022的数据',
                    },
                ],
            },
        ],
    },
};

export const MOCK_DATA_SOURCE_1: IBackendResponseDataForm = {
    error: {
        code: 'OK',
        message: 'success',
    },
    nextCursor: '1:10',
    dataformID: '',
    columns: ['姓名', '年份'],
    celldatas: [
        {
            rowNumber: 1,
            cells: {
                '1': {
                    v: {
                        strV: 'abc',
                    },
                    t: 'STRING',
                },
                '2': {
                    v: {
                        numV: 100,
                    },
                    t: 'NUMBER',
                },
            },
        },
        {
            rowNumber: 2,
            cells: {
                '1': {
                    v: {
                        strV: 'cad',
                    },
                    t: 'STRING',
                },
                '2': {
                    v: {
                        numV: 200,
                    },
                    t: 'NUMBER',
                },
            },
        },
    ],
};

export const MOCK_DATA_SOURCE_2: IBackendResponseDataForm = {
    error: {
        code: 'OK',
        message: 'success',
    },
    nextCursor: '1:10',
    dataformID: '',
    columns: ['学历', '年龄', '成绩'],
    celldatas: [
        {
            rowNumber: 1,
            cells: {
                '1': {
                    v: {
                        strV: '大专',
                    },
                    t: 'STRING',
                },
                '2': {
                    v: {
                        numV: 23,
                    },
                    t: 'NUMBER',
                },
                '3': {
                    v: {
                        numV: 99,
                    },
                    t: 'NUMBER',
                },
            },
        },
        {
            rowNumber: 2,
            cells: {
                '1': {
                    v: {
                        strV: '本科',
                    },
                    t: 'STRING',
                },
                '2': {
                    v: {
                        numV: 25,
                    },
                    t: 'NUMBER',
                },
                '3': {
                    v: {
                        numV: 98,
                    },
                    t: 'NUMBER',
                },
            },
        },
    ],
};

export const postRequestOptions: RequestInit = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
};
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
        @Inject(LocaleService) private readonly _localeService: LocaleService
    ) {}

    dispose(): void {}

    async getRequestDataTree(): Promise<IBackendResponseDataTree | null> {
        const dataTreeUrl = this._url?.dataTree;
        if (!dataTreeUrl) {
            return this._showUrlError();
        }

        try {
            const response = await fetch(dataTreeUrl);
            const data = await response.json();

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
            const response = await fetch(previewDataForm, postRequestOptions);
            const data = await response.json();

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
            const response = await fetch(dataForm, postRequestOptions);
            const data = await response.json();

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

    private _requestDataById(dataId: string) {}
}
