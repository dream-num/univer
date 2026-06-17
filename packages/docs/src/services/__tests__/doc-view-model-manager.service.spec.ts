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

import {
    ContextService,
    DesktopLogService,
    DocumentDataModel,
    IContextService,
    ILogService,
    Injector,
    IUniverInstanceService,
    UniverInstanceService,
} from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { DocViewModelManagerService } from '../doc-view-model-manager.service';

describe('DocViewModelManagerService', () => {
    it('creates view models for existing documents and removes them when the document unit is disposed', () => {
        const injector = new Injector();
        injector.add([ILogService, { useClass: DesktopLogService }]);
        injector.add([IContextService, { useClass: ContextService }]);
        injector.add([IUniverInstanceService, { useClass: UniverInstanceService }]);
        const univerInstanceService = injector.get(IUniverInstanceService) as UniverInstanceService;
        univerInstanceService.__addUnit(new DocumentDataModel({
            id: 'doc-1',
            body: {
                dataStream: '\r\n',
                paragraphs: [{ startIndex: 1, paragraphId: 'paragraph-1' }],
                sectionBreaks: [],
                tables: [],
                customRanges: [],
                customDecorations: [],
                customBlocks: [],
            },
        }));

        const service = injector.createInstance(DocViewModelManagerService, { unitId: 'doc-1' } as never);
        expect(service.getViewModel('doc-1')?.getDataModel().getUnitId()).toBe('doc-1');

        univerInstanceService.disposeUnit('doc-1');
        expect(service.getAllModel().has('doc-1')).toBe(false);
    });
});
