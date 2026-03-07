/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { DocumentDataModel, ICustomRange, IDocumentData } from '@univerjs/core';
import {
    CustomRangeType,
    IResourceManagerService,
    LocaleType,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DOC_HYPER_LINK_PLUGIN, DocHyperLinkResourceController } from '../resource.controller';

function createDocData(): IDocumentData {
    return {
        id: 'doc-1',
        locale: LocaleType.EN_US,
        title: 'Doc',
        body: {
            dataStream: 'Body\r\n',
            customRanges: [
                {
                    startIndex: 0,
                    endIndex: 4,
                    rangeId: 'body-link',
                    rangeType: CustomRangeType.HYPERLINK,
                    properties: {
                        url: 'https://body.old',
                    },
                },
                {
                    startIndex: 0,
                    endIndex: 4,
                    rangeId: 'ignored-range',
                    rangeType: CustomRangeType.COMMENT,
                },
            ],
        },
        headers: {
            'header-1': {
                headerId: 'header-1',
                body: {
                    dataStream: 'Header\r\n',
                    customRanges: [{
                        startIndex: 0,
                        endIndex: 6,
                        rangeId: 'header-link',
                        rangeType: CustomRangeType.HYPERLINK,
                        properties: {
                            url: 'https://header.old',
                        },
                    }],
                },
            },
        },
        footers: {
            'footer-1': {
                footerId: 'footer-1',
                body: {
                    dataStream: 'Footer\r\n',
                    customRanges: [{
                        startIndex: 0,
                        endIndex: 6,
                        rangeId: 'footer-link',
                        rangeType: CustomRangeType.HYPERLINK,
                    }],
                },
            },
        },
        documentStyle: {
            pageSize: {
                width: 594.3,
                height: 840.51,
            },
            marginTop: 72,
            marginBottom: 72,
            marginRight: 90,
            marginLeft: 90,
        },
    };
}

function getRange(model: DocumentDataModel, rangeId: string, segment: 'body' | 'header' | 'footer' = 'body'): ICustomRange | undefined {
    const doc = segment === 'header'
        ? model.headerModelMap.get('header-1')
        : segment === 'footer'
            ? model.footerModelMap.get('footer-1')
            : model;

    return doc?.getBody()?.customRanges?.find((range) => range.rangeId === rangeId);
}

describe('DocHyperLinkResourceController', () => {
    let univer: Univer;
    let resourceManagerService: IResourceManagerService;

    beforeEach(() => {
        univer = new Univer();
        const injector = univer.__getInjector();

        injector.add([DocHyperLinkResourceController]);
        injector.get(DocHyperLinkResourceController);

        resourceManagerService = injector.get(IResourceManagerService);
    });

    afterEach(() => {
        univer.dispose();
    });

    it('should serialize hyperlink resources from headers, footers and body only', () => {
        univer.createUnit<IDocumentData, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, createDocData());

        const resource = resourceManagerService.getResourcesByType('doc-1', UniverInstanceType.UNIVER_DOC)
            .find((item) => item.name === DOC_HYPER_LINK_PLUGIN);

        expect(resource).toBeDefined();
        expect(JSON.parse(resource!.data)).toEqual({
            links: [
                { id: 'header-link', payload: 'https://header.old' },
                { id: 'footer-link', payload: '' },
                { id: 'body-link', payload: 'https://body.old' },
            ],
        });
    });

    it('should load hyperlink resources back into header, footer and body ranges', () => {
        const doc = univer.createUnit<IDocumentData, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, createDocData());

        resourceManagerService.loadResources(doc.getUnitId(), [{
            name: DOC_HYPER_LINK_PLUGIN,
            data: JSON.stringify({
                links: [
                    { id: 'header-link', payload: 'https://header.new' },
                    { id: 'footer-link', payload: 'https://footer.new' },
                    { id: 'body-link', payload: 'https://body.new' },
                    { id: 'missing-link', payload: 'https://missing.new' },
                ],
            }),
        }]);

        expect(getRange(doc, 'header-link', 'header')?.properties).toEqual({ url: 'https://header.new' });
        expect(getRange(doc, 'footer-link', 'footer')?.properties).toEqual({ url: 'https://footer.new' });
        expect(getRange(doc, 'body-link')?.properties).toEqual({ url: 'https://body.new' });
        expect(getRange(doc, 'ignored-range')?.properties).toBeUndefined();
    });

    it('should return an empty resource payload when the document does not exist', () => {
        const resource = resourceManagerService.getResourcesByType('missing-doc', UniverInstanceType.UNIVER_DOC)
            .find((item) => item.name === DOC_HYPER_LINK_PLUGIN);

        expect(resource).toBeDefined();
        expect(resource?.data).toBe(JSON.stringify({ links: [] }));
    });
});
