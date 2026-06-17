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
    EDITOR_ACTIVATED,
    ICommandService,
    IConfigService,
    IContextService,
    ILogService,
    Injector,
    IUndoRedoService,
    IUniverInstanceService,
    LocalUndoRedoService,
    ThemeService,
    UniverInstanceService,
} from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { EditorService, IEditorService } from '../editor-manager.service';

function createService() {
    vi.stubGlobal('window', new EventTarget());
    const injector = new Injector();
    injector.add([ILogService, { useClass: DesktopLogService }]);
    injector.add([IConfigService, { useClass: ConfigService }]);
    injector.add([IContextService, { useClass: ContextService }]);
    injector.add([ICommandService, { useClass: CommandService }]);
    injector.add([IUniverInstanceService, { useClass: UniverInstanceService }]);
    injector.add([IUndoRedoService, { useClass: LocalUndoRedoService }]);
    injector.add([ThemeService]);
    injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
    injector.add([DocSelectionManagerService]);
    injector.add([IEditorService, { useClass: EditorService }]);
    const univerInstanceService = injector.get(IUniverInstanceService) as UniverInstanceService;
    univerInstanceService.__addUnit(new DocumentDataModel({ id: 'editor-1' }));
    return {
        service: injector.get(IEditorService),
        contextService: injector.get(IContextService),
        univerInstanceService,
    };
}

describe('EditorService', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('focuses the requested editor, emits caret position, and clears editor contexts on blur', () => {
        const { service, contextService, univerInstanceService } = createService();
        const focusRanges: unknown[] = [];
        const blurs: unknown[] = [];
        let editorFocused = 0;
        let editorBlurred = 0;
        service.focus$.subscribe((range) => focusRanges.push(range));
        service.blur$.subscribe((value) => blurs.push(value));
        service.getAllEditor().set('editor-1', {
            getValue: () => 'abc',
            focus: () => editorFocused++,
            blur: () => editorBlurred++,
            isSheetEditor: () => false,
        } as never);

        service.focus('editor-1');
        expect(service.getFocusId()).toBe('editor-1');
        expect(univerInstanceService.getCurrentUniverDocInstance()?.getUnitId()).toBe('editor-1');
        expect(editorFocused).toBe(1);
        expect(focusRanges).toEqual([{ startOffset: 3, endOffset: 3 }]);

        service.blur();
        expect(service.getFocusId()).toBeNull();
        expect(editorBlurred).toBe(1);
        expect(blurs).toEqual([null]);
        expect(contextService.getContextValue(EDITOR_ACTIVATED)).toBe(false);
    });
});
