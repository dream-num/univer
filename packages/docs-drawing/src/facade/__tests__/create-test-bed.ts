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

import type { DocumentDataModel, IDocumentData } from '@univerjs/core';
import { DocumentFlavor, ILogService, IUniverInstanceService, LogLevel, Univer, UniverInstanceType } from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { UniverDocsPlugin } from '@univerjs/docs';
import { UniverDrawingPlugin } from '@univerjs/drawing';
import { IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';
import { UniverDocsDrawingPlugin } from '../../plugin';
import '../index';

const DEFAULT_DOC_DATA: IDocumentData = {
    id: 'test-doc',
    documentStyle: { documentFlavor: DocumentFlavor.TRADITIONAL },
    body: {
        dataStream: 'Hello world\r\n',
        paragraphs: [{ startIndex: 11, paragraphId: 'paragraph-1' }],
        sectionBreaks: [],
        customBlocks: [],
    },
    drawings: {},
    drawingsOrder: [],
};

export function createFacadeTestBed() {
    const univer = new Univer();
    const injector = univer.__getInjector();

    injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
    univer.registerPlugin(UniverDocsPlugin);
    univer.registerPlugin(UniverDrawingPlugin);
    univer.registerPlugin(UniverDocsDrawingPlugin);

    const documentDataModel = univer.createUnit<IDocumentData, DocumentDataModel>(
        UniverInstanceType.UNIVER_DOC,
        DEFAULT_DOC_DATA
    );
    injector.get(IUniverInstanceService).focusUnit(documentDataModel.getUnitId());
    injector.get(ILogService).setLogLevel(LogLevel.SILENT);

    return {
        univer,
        injector,
        documentDataModel,
        document: FUniver.newAPI(injector).getActiveDocument()!,
    };
}
