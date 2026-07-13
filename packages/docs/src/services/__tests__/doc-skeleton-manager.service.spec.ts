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
    LocaleService,
    UniverInstanceService,
    UniverInstanceType,
} from '@univerjs/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DocSkeletonManagerService } from '../doc-skeleton-manager.service';

function createDocument() {
    return new DocumentDataModel({
        id: 'doc-1',
        body: {
            dataStream: 'Hello\r\n',
            paragraphs: [{ paragraphId: 'p1', startIndex: 5 }],
            sectionBreaks: [{ sectionId: 'section_fixture_126', startIndex: 7 }],
            customRanges: [],
            customDecorations: [],
            customBlocks: [],
            tables: [],
        },
        documentStyle: {
            pageSize: { width: 594, height: 840 },
        },
    });
}

describe('DocSkeletonManagerService', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('builds and publishes a document skeleton for the render context document', () => {
        vi.stubGlobal('document', {
            getElementById: () => null,
            getElementsByTagName: () => [{ appendChild: vi.fn() }],
            createElement: () => ({
                id: '',
                style: { cssText: '' },
                textContent: '',
                getBoundingClientRect: () => ({ width: 40, height: 10 }),
                getContext: () => ({
                    font: '',
                    measureText: (content: string) => ({
                        actualBoundingBoxAscent: 8,
                        actualBoundingBoxDescent: 2,
                        width: content.length * 8,
                    }),
                }),
            }),
        });
        const injector = new Injector();
        injector.add([IContextService, { useClass: ContextService }]);
        injector.add([ILogService, { useClass: DesktopLogService }]);
        injector.add([LocaleService]);
        injector.add([IUniverInstanceService, { useClass: UniverInstanceService }]);
        const document = createDocument();
        const univerInstanceService = injector.get(IUniverInstanceService) as UniverInstanceService;
        univerInstanceService.__addUnit(document);

        const service = injector.createInstance(DocSkeletonManagerService, {
            unit: document,
            unitId: 'doc-1',
            type: UniverInstanceType.UNIVER_DOC,
        } as never);

        expect(service.getViewModel().getDataModel().getUnitId()).toBe('doc-1');
        expect(service.getSkeleton()).toBeTruthy();
    });
});
