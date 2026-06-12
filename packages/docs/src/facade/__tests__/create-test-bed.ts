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
import type { FUniver } from '@univerjs/core/facade';
import { DisposableCollection, ILogService, IUniverInstanceService, LogLevel, Univer, UniverInstanceType } from '@univerjs/core';
import { FUniver as FUniverCtor } from '@univerjs/core/facade';
import { IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';
import { BehaviorSubject } from 'rxjs';
import { UniverDocsPlugin } from '../../plugin';
import '../index';

function getTestDocumentDataDemo(): IDocumentData {
    return {
        id: 'test',
        body: {
            dataStream: 'Hello,\r\n',
            paragraphs: [{ startIndex: 6, paragraphId: 'para_fixture_19' }],
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
        univerAPI: FUniverCtor.newAPI(injector),
    };
}
