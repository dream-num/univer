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
    CommandService,
    ConfigService,
    ContextService,
    DesktopLogService,
    DocumentDataModel,
    ICommandService,
    IConfigService,
    IContextService,
    ILogService,
    Injector,
    IUndoRedoService,
    IUniverInstanceService,
    LocalUndoRedoService,
    UniverInstanceService,
} from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { DocStateChangeManagerService } from '../doc-state-change-manager.service';
import { DocStateEmitService } from '../doc-state-emit.service';

function createService() {
    const injector = new Injector();
    injector.add([ILogService, { useClass: DesktopLogService }]);
    injector.add([IConfigService, { useClass: ConfigService }]);
    injector.add([IContextService, { useClass: ContextService }]);
    injector.add([ICommandService, { useClass: CommandService }]);
    injector.add([IUniverInstanceService, { useClass: UniverInstanceService }]);
    injector.add([IUndoRedoService, { useClass: LocalUndoRedoService }]);
    injector.add([DocStateEmitService]);
    injector.add([DocStateChangeManagerService]);
    return {
        service: injector.get(DocStateChangeManagerService),
        emitter: injector.get(DocStateEmitService),
        undoRedoService: injector.get(IUndoRedoService),
        univerInstanceService: injector.get(IUniverInstanceService) as UniverInstanceService,
    };
}

describe('DocStateChangeManagerService', () => {
    it('turns emitted document edits into history items and collaboration change events', () => {
        const { service, emitter, undoRedoService, univerInstanceService } = createService();
        const changes: unknown[] = [];
        const sub = service.docStateChange$.subscribe((value) => changes.push(value));
        univerInstanceService.__addUnit(new DocumentDataModel({ id: 'doc-1' }));
        univerInstanceService.focusUnit('doc-1');
        const change = {
            commandId: 'doc.rich-text-editing',
            unitId: 'doc-1',
            trigger: 'keyboard',
            redoState: { actions: null as never, textRanges: [{ startOffset: 1, endOffset: 1, collapsed: true }] },
            undoState: { actions: null as never, textRanges: [{ startOffset: 0, endOffset: 0, collapsed: true }] },
        };

        emitter.emitStateChangeInfo(change);

        expect(undoRedoService.pitchTopUndoElement()).toMatchObject({
            unitID: 'doc-1',
            undoMutations: [{ id: 'doc.rich-text-editing' }],
            redoMutations: [{ id: 'doc.rich-text-editing' }],
        });
        expect(changes.at(-1)).toMatchObject({
            commandId: 'doc.rich-text-editing',
            unitId: 'doc-1',
            trigger: 'keyboard',
        });

        sub.unsubscribe();
    });
});
