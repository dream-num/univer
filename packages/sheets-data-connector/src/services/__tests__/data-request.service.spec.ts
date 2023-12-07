import type { Univer } from '@univerjs/core';
import { HTTPService, IHTTPImplementation, XHRHTTPImplementation } from '@univerjs/network';
import { DesktopMessageService, IMessageService } from '@univerjs/ui';
import type { Injector } from '@wendellhu/redi';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { IDataRequestService } from '../data-request.service';
import type { IBackendResponseDataForm, IBackendResponseDataTree } from '../interface';
import { createCommandTestBed, dataConnectorUrl } from './create-command-test-bed';

// used for test
export const MOCK_DATA_TREE: IBackendResponseDataTree = {
    error: {
        code: 'OK',
        message: 'success',
    },
    display: {
        type: 'tree',
        name: '金融连接器',
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
                                viewID: 'view1',
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
                        viewID: 'view2',
                        name: '2022的数据',
                    },
                ],
            },
        ],
    },
};

export const MOCK_PREVIEW_DATA_FORM: IBackendResponseDataForm = {
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

export const MOCK_DATA_FORM: IBackendResponseDataForm = {
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

describe('Test data request', () => {
    let univer: Univer;
    let get: Injector['get'];
    let dataRequestService: IDataRequestService;
    let mockResponseData: IBackendResponseDataTree | IBackendResponseDataForm | null = null;

    beforeEach(() => {
        const testBed = createCommandTestBed(undefined, [
            [IHTTPImplementation, { useClass: XHRHTTPImplementation }],
            [HTTPService],
            [IMessageService, { useClass: DesktopMessageService }],
        ]);
        univer = testBed.univer;
        get = testBed.get;

        dataRequestService = get(IDataRequestService);
        const httpService = get(HTTPService);

        // Intercept and return different data based on different requests
        httpService.registerHTTPInterceptor({
            priority: 0,
            interceptor: (request, next) => {
                const url = request.getUrlWithParams();

                switch (url) {
                    case dataConnectorUrl.dataTree:
                        mockResponseData = MOCK_DATA_TREE;
                        break;

                    case dataConnectorUrl.previewDataForm:
                        mockResponseData = MOCK_PREVIEW_DATA_FORM;
                        break;

                    case dataConnectorUrl.dataForm:
                        mockResponseData = MOCK_DATA_FORM;
                        break;

                    default:
                        break;
                }
                return next(request);
            },
        });
    });

    afterEach(() => {
        univer.dispose();
    });
    describe('fetch data', () => {
        it('get data tree', async () => {
            await dataRequestService.getRequestDataTree();
            expect(mockResponseData).toEqual(MOCK_DATA_TREE);
        });
        it('get preview data form', async () => {
            await dataRequestService.getRequestPreviewDataForm('view1');
            expect(mockResponseData).toEqual(MOCK_PREVIEW_DATA_FORM);
        });
        it('get data form', async () => {
            await dataRequestService.getRequestDataForm('view1');
            expect(mockResponseData).toEqual(MOCK_DATA_FORM);
        });
    });
});
