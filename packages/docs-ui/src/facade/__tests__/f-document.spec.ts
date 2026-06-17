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

import type { IDocumentData, UnitModel } from '@univerjs/core';
import {
    DisposableCollection,
    DOC_RANGE_TYPE,
    ILogService,
    IUniverInstanceService,
    LogLevel,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { UniverDocsPlugin } from '@univerjs/docs';
import { IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';
import { BehaviorSubject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '@univerjs/docs/facade';
import '@univerjs/docs-ui/facade';

describe('docs-ui document facade', () => {
    let univer: Univer;
    let univerAPI: FUniver;
    let removeAllRanges: ReturnType<typeof vi.fn>;
    let addDocRanges: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        univer = new Univer();
        const injector = univer.__getInjector();
        injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
        injector.get(ILogService).setLogLevel(LogLevel.SILENT);
        univer.registerPlugin(UniverDocsPlugin);

        const doc = univer.createUnit<IDocumentData, UnitModel<IDocumentData>>(UniverInstanceType.UNIVER_DOC, {
            id: 'doc-1',
            body: {
                dataStream: 'Hello Univer\r\n',
                paragraphs: [{ startIndex: 12, paragraphId: 'paragraph-1' }],
            },
        });

        removeAllRanges = vi.fn();
        addDocRanges = vi.fn();
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
                removeAllRanges,
                addDocRanges,
            }) as T,
            activate: () => undefined,
            deactivate: () => undefined,
            isDisposed: () => false,
        });

        univerAPI = FUniver.newAPI(injector);
    });

    afterEach(() => {
        univer.dispose();
    });

    it('replaces the rendered text selection with the requested document offsets', () => {
        univerAPI.getActiveDocument()!.setSelection(2, 7);

        expect(removeAllRanges).toHaveBeenCalledOnce();
        expect(addDocRanges).toHaveBeenCalledWith([
            {
                startOffset: 2,
                endOffset: 7,
                rangeType: DOC_RANGE_TYPE.TEXT,
            },
        ], true);
    });
});
