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

import type { DocumentDataModel, ICustomRange, IDocumentData, IHyperlink } from '@univerjs/core';
import {
    CustomRangeType,
    DocumentFlavor,
    ICommandService,
    IResourceManagerService,
    LocaleType,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
    AddHyperLinkMuatation,
    DeleteHyperLinkMuatation,
    UpdateHyperLinkMuatation,
} from '../../commands/mutations/hyper-link.mutation';
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

function createInternalDocData(
    flavor: DocumentFlavor,
    story: 'body' | 'header' | 'footer',
    properties: IHyperlink
): IDocumentData {
    const data = createDocData();
    data.documentStyle.documentFlavor = flavor;
    const bodies = { body: data.body!, header: data.headers!['header-1'].body!, footer: data.footers!['footer-1'].body! };
    for (const body of Object.values(bodies)) {
        body.customRanges = [];
    }
    bodies[story].customRanges = [{
        startIndex: 0,
        endIndex: 0,
        rangeId: 'internal-link',
        rangeType: CustomRangeType.HYPERLINK,
        properties: { ...properties },
    }];
    return data;
}

describe('DocHyperLinkResourceController', () => {
    let univer: Univer;
    let commandService: ICommandService;
    let resourceManagerService: IResourceManagerService;

    beforeEach(() => {
        univer = new Univer();
        const injector = univer.__getInjector();

        injector.add([DocHyperLinkResourceController]);
        injector.get(DocHyperLinkResourceController);

        commandService = injector.get(ICommandService);
        commandService.registerCommand(AddHyperLinkMuatation);
        commandService.registerCommand(UpdateHyperLinkMuatation);
        commandService.registerCommand(DeleteHyperLinkMuatation);

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

    it('should execute hyperlink resource mutations successfully', async () => {
        await expect(commandService.executeCommand(AddHyperLinkMuatation.id)).resolves.toBe(true);
        await expect(commandService.executeCommand(UpdateHyperLinkMuatation.id)).resolves.toBe(true);
        await expect(commandService.executeCommand(DeleteHyperLinkMuatation.id)).resolves.toBe(true);
    });

    describe('internal reference resource replay', () => {
        it.each([DocumentFlavor.TRADITIONAL, DocumentFlavor.MODERN].flatMap((flavor) =>
            (['body', 'header', 'footer'] as const).flatMap((story) =>
                (['bookmark', 'heading'] as const).flatMap((target) =>
                    [false, true].map((owned) => ({ flavor, story, target, owned }))
                )
            )
        ))('preserves the entire public snapshot through empty URL resource round trips ($flavor/$story/$target/$owned)', ({ flavor, story, target, owned }) => {
            const properties: IHyperlink = {
                textStyleMode: 'text',
                referenceFieldLink: owned,
                ...(target === 'bookmark' ? { bookmarkId: '_RefTarget' } : { headingId: 'heading-target' }),
            };
            const doc = univer.createUnit<IDocumentData, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, createInternalDocData(flavor, story, properties));
            const before = JSON.stringify(doc.getSnapshot());
            const resources = resourceManagerService.getResourcesByType(doc.getUnitId(), UniverInstanceType.UNIVER_DOC);
            expect(JSON.parse(resources.find((resource) => resource.name === DOC_HYPER_LINK_PLUGIN)!.data)).toEqual({
                links: [{ id: 'internal-link', payload: '' }],
            });
            resourceManagerService.loadResources(doc.getUnitId(), resources);
            expect(getRange(doc, 'internal-link', story)?.properties).toEqual(properties);
            expect(JSON.stringify(doc.getSnapshot())).toBe(before);
        });

        it.each([DocumentFlavor.TRADITIONAL, DocumentFlavor.MODERN].flatMap((flavor) =>
            (['body', 'header', 'footer'] as const).map((story) => ({ flavor, story }))
        ))('retains owned reference targets when legacy resources contain a stale external URL ($flavor/$story)', ({ flavor, story }) => {
            const properties: IHyperlink = { bookmarkId: '_RefTarget', textStyleMode: 'text', referenceFieldLink: true };
            const doc = univer.createUnit<IDocumentData, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, createInternalDocData(flavor, story, properties));
            const before = JSON.stringify(doc.getSnapshot());
            resourceManagerService.loadResources(doc.getUnitId(), [{
                name: DOC_HYPER_LINK_PLUGIN,
                data: JSON.stringify({ links: [{ id: 'internal-link', payload: 'https://stale.example/' }] }),
            }]);
            expect(JSON.stringify(doc.getSnapshot())).toBe(before);
        });

        it.each([DocumentFlavor.TRADITIONAL, DocumentFlavor.MODERN])('retains an explicit public URL on an edited reference link (%s)', (flavor) => {
            const properties: IHyperlink = { bookmarkId: '_RefTarget', url: 'https://edited.example/', referenceFieldLink: true };
            const doc = univer.createUnit<IDocumentData, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, createInternalDocData(flavor, 'body', properties));
            resourceManagerService.loadResources(doc.getUnitId(), [{
                name: DOC_HYPER_LINK_PLUGIN,
                data: JSON.stringify({ links: [{ id: 'internal-link', payload: 'https://stale.example/' }] }),
            }]);
            expect(getRange(doc, 'internal-link')?.properties).toEqual(properties);
        });

        it.each([DocumentFlavor.TRADITIONAL, DocumentFlavor.MODERN])('continues loading real legacy external destinations for authored links (%s)', (flavor) => {
            const properties: IHyperlink = { bookmarkId: '_RefTarget', textStyleMode: 'text', referenceFieldLink: false };
            const doc = univer.createUnit<IDocumentData, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, createInternalDocData(flavor, 'body', properties));
            resourceManagerService.loadResources(doc.getUnitId(), [{
                name: DOC_HYPER_LINK_PLUGIN,
                data: JSON.stringify({ links: [{ id: 'internal-link', payload: 'https://legacy.example/' }] }),
            }]);
            expect(getRange(doc, 'internal-link')?.properties).toEqual({ ...properties, url: 'https://legacy.example/' });
        });
    });
});
