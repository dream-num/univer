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

import type { DocumentDataModel, IDocumentData, Injector } from '@univerjs/core';
import {
    DisposableCollection,
    DocumentBlockRangeType,
    ILogService,
    IUniverInstanceService,
    LogLevel,
    PresetListType,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';
import { BehaviorSubject } from 'rxjs';
import { UniverDocsPlugin } from '../../plugin';
import '../index';

export const DOCUMENT_STYLE: IDocumentData['documentStyle'] = {
    pageSize: {
        width: 594.3,
        height: 840.51,
    },
    marginTop: 72,
    marginBottom: 72,
    marginRight: 90,
    marginLeft: 90,
};

export function createDocumentData(id: string, body: NonNullable<IDocumentData['body']>): IDocumentData {
    return {
        id,
        body: {
            customBlocks: [],
            ...body,
        },
        documentStyle: DOCUMENT_STYLE,
    };
}

function getTestDocumentDataDemo(): IDocumentData {
    return {
        id: 'test',
        body: {
            dataStream: 'Hello,\r\n',
            paragraphs: [{ startIndex: 6, paragraphId: 'para_fixture_19' }],
        },
        documentStyle: DOCUMENT_STYLE,
    };
}

export function createSimpleDocument(id = 'test'): IDocumentData {
    return createDocumentData(id, {
        dataStream: 'Alpha\rBeta\rGamma\r\n',
        paragraphs: [
            { startIndex: 5, paragraphId: 'para_alpha' },
            { startIndex: 10, paragraphId: 'para_beta' },
            { startIndex: 16, paragraphId: 'para_gamma' },
        ],
        sectionBreaks: [{ sectionId: 'section_fixture_110', startIndex: 17 }],
    });
}

export function createDuplicateDocument(id = 'test'): IDocumentData {
    return createDocumentData(id, {
        dataStream: 'Same\rSame\rTail\r\n',
        paragraphs: [
            { startIndex: 4, paragraphId: 'para_same_1' },
            { startIndex: 9, paragraphId: 'para_same_2' },
            { startIndex: 14, paragraphId: 'para_tail' },
        ],
        sectionBreaks: [{ sectionId: 'section_fixture_111', startIndex: 15 }],
    });
}

export function createTaskDocument(id = 'test'): IDocumentData {
    return createDocumentData(id, {
        dataStream: 'Todo\rDone\r\n',
        paragraphs: [
            {
                startIndex: 4,
                paragraphId: 'para_todo',
                bullet: {
                    listId: 'task-list',
                    listType: PresetListType.CHECK_LIST,
                    nestingLevel: 0,
                },
            },
            { startIndex: 9, paragraphId: 'para_done' },
        ],
        sectionBreaks: [{ sectionId: 'section_fixture_112', startIndex: 10 }],
    });
}

export function createBulletDocument(id = 'test'): IDocumentData {
    return createDocumentData(id, {
        dataStream: 'Bullet\rTail\r\n',
        paragraphs: [
            {
                startIndex: 6,
                paragraphId: 'para_bullet',
                bullet: {
                    listId: 'bullet-list',
                    listType: PresetListType.BULLET_LIST,
                    nestingLevel: 0,
                },
            },
            { startIndex: 11, paragraphId: 'para_bullet_tail' },
        ],
        sectionBreaks: [{ sectionId: 'section_fixture_113', startIndex: 12 }],
    });
}

export function createBlockRangeDocument(blockType = DocumentBlockRangeType.QUOTE, id = 'test'): IDocumentData {
    return createDocumentData(id, {
        dataStream: 'Block\rAfter\r\n',
        paragraphs: [{ startIndex: 5, paragraphId: 'para_fixture_20' }, { startIndex: 11, paragraphId: 'para_after_block' }],
        blockRanges: [{
            blockId: `${blockType}-1`,
            blockType,
            startIndex: 0,
            endIndex: 5,
        }],
        sectionBreaks: [{ sectionId: 'section_fixture_114', startIndex: 12 }],
    });
}

export function createTableDocument(id = 'test'): IDocumentData {
    return createDocumentData(id, {
        dataStream: 'TT\raa\r\n',
        paragraphs: [{ startIndex: 2, paragraphId: 'para_fixture_21' }, { startIndex: 5, paragraphId: 'para_after_table' }],
        tables: [{ tableId: 'table-1', startIndex: 0, endIndex: 2 }],
        sectionBreaks: [{ sectionId: 'section_fixture_115', startIndex: 6 }],
    });
}

export function createCustomBlockDocument(id = 'test'): IDocumentData {
    return createDocumentData(id, {
        dataStream: '\b\raa\r\n',
        paragraphs: [{ startIndex: 1, paragraphId: 'para_fixture_22' }, { startIndex: 4, paragraphId: 'para_after_custom_block' }],
        customBlocks: [{ blockId: 'custom-1', blockType: 'custom' as never, startIndex: 0 }],
        sectionBreaks: [{ sectionId: 'section_fixture_116', startIndex: 5 }],
    });
}

function cloneDocumentData(documentData: IDocumentData): IDocumentData {
    return JSON.parse(JSON.stringify(documentData)) as IDocumentData;
}

export interface ITestBed {
    univer: Univer;
    get: Injector['get'];
    doc: DocumentDataModel;
    univerAPI: FUniver;
}

export function createTestBed(documentConfig?: IDocumentData): ITestBed {
    const univer = new Univer();
    const injector = univer.__getInjector();

    injector.get(ILogService).setLogLevel(LogLevel.SILENT);
    injector.add([IRenderManagerService, { useClass: RenderManagerService }]);

    univer.registerPlugin(UniverDocsPlugin);
    const documentConfigWithIds = cloneDocumentData(documentConfig ?? getTestDocumentDataDemo());
    const doc = univer.createUnit<IDocumentData, DocumentDataModel>(
        UniverInstanceType.UNIVER_DOC,
        documentConfigWithIds
    );

    injector.get(IUniverInstanceService).focusUnit(doc.getUnitId());
    injector.get(IRenderManagerService).addRender(doc.getUnitId(), {
        unitId: doc.getUnitId(),
        type: UniverInstanceType.UNIVER_DOC,
        engine: new DisposableCollection() as never,
        scene: new DisposableCollection() as never,
        mainComponent: null,
        components: new Map(),
        isMainScene: true,
        activated$: new BehaviorSubject(true),
        with: <T>() => ({
            getViewModel: () => ({
                reset: () => undefined,
            }),
        }) as T,
        activate: () => undefined,
        deactivate: () => undefined,
        isDisposed: () => false,
    });

    return {
        univer,
        get: injector.get.bind(injector),
        doc,
        univerAPI: FUniver.newAPI(injector),
    };
}
