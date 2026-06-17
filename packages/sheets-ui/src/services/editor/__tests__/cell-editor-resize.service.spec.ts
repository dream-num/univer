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
import { EditorService, IEditorService } from '@univerjs/docs-ui';
import { IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';
import { SheetInterceptorService, SheetSkeletonService } from '@univerjs/sheets';
import { DesktopLayoutService, ILayoutService } from '@univerjs/ui';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { EditorBridgeService, IEditorBridgeService } from '../../editor-bridge.service';
import { CellEditorManagerService, ICellEditorManagerService } from '../cell-editor-manager.service';
import { SheetCellEditorResizeService } from '../cell-editor-resize.service';

describe('SheetCellEditorResizeService', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('does not resize anything when no cell editor is active', () => {
        vi.stubGlobal('window', new EventTarget());
        vi.stubGlobal('document', { activeElement: { dataset: {} } });
        const injector = new Injector();
        let callbackCalled = false;
        injector.add([ILogService, { useClass: DesktopLogService }]);
        injector.add([IContextService, { useClass: ContextService }]);
        injector.add([IUniverInstanceService, { useClass: UniverInstanceService }]);
        injector.add([ICommandService, { useClass: CommandService }]);
        injector.add([IUndoRedoService, { useClass: LocalUndoRedoService }]);
        injector.add([ThemeService]);
        injector.add([ILayoutService, { useClass: DesktopLayoutService }]);
        injector.add([DocSelectionManagerService]);
        injector.add([SheetInterceptorService]);
        injector.add([SheetSkeletonService]);
        injector.add([IEditorService, { useClass: EditorService }]);
        injector.add([ICellEditorManagerService, { useClass: CellEditorManagerService }]);
        injector.add([IEditorBridgeService, { useClass: EditorBridgeService }]);
        injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
        injector.add([IConfigService, { useClass: ConfigService }]);
        injector.add([SheetCellEditorResizeService]);

        injector.get(SheetCellEditorResizeService).fitTextSize(() => {
            callbackCalled = true;
        });

        expect(callbackCalled).toBe(false);
    });
});
