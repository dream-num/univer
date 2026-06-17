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

import { Injector, JSONX } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { beforeEach, describe, expect, it } from 'vitest';
import { DocIMEInputManagerService } from '../doc-ime-input-manager.service';
import { DocIMEStateChangeInterceptorService } from '../doc-ime-state-change-interceptor.service';

class TestRenderManagerService {
    static readonly renderUnits = new Map<string, { with: (token: unknown) => unknown }>();

    getRenderUnitById(unitId: string) {
        return TestRenderManagerService.renderUnits.get(unitId);
    }
}

describe('DocIMEStateChangeInterceptorService', () => {
    let service: DocIMEStateChangeInterceptorService;
    let injector: Injector;

    function createImeInputManager(unitId: string, withHistory = true) {
        const imeInputManagerService = injector.createInstance(DocIMEInputManagerService, { unitId } as never);

        if (withHistory) {
            const jsonX = JSONX.getInstance();
            imeInputManagerService.setActiveRange({ startOffset: 1, endOffset: 2 } as never);
            imeInputManagerService.pushUndoRedoMutationParams(
                {
                    unitId,
                    actions: jsonX.insertOp(['settings'], { zoomRatio: 1 }),
                    textRanges: [],
                } as never,
                {
                    unitId,
                    actions: jsonX.replaceOp(['id'], unitId, `${unitId}-editing`),
                    textRanges: [],
                } as never
            );
        }

        return imeInputManagerService;
    }

    function registerImeRenderUnit(unitId: string, imeInputManagerService: DocIMEInputManagerService) {
        TestRenderManagerService.renderUnits.set(unitId, {
            with: (token: unknown) => token === DocIMEInputManagerService ? imeInputManagerService : null,
        });
    }

    beforeEach(() => {
        TestRenderManagerService.renderUnits.clear();
        injector = new Injector();
        injector.add([IRenderManagerService, { useClass: TestRenderManagerService as never }]);
        injector.add([DocIMEStateChangeInterceptorService]);
        registerImeRenderUnit('doc-1', createImeInputManager('doc-1'));
        service = injector.get(DocIMEStateChangeInterceptorService);
    });

    it('keeps regular state changes unchanged before IME composition ends', () => {
        const changeStateInfo = {
            unitId: 'doc-1',
            isCompositionEnd: false,
            isSync: false,
            redoState: { actions: [{ p: ['body'], oi: 'typing' }] },
            undoState: { actions: [{ p: ['body'], od: 'typing' }], textRanges: [] },
        } as never;

        expect(service.transformChangeStateInfo(changeStateInfo)).toBe(changeStateInfo);
    });

    it('replaces composition history with the composed IME undo and redo actions', () => {
        const jsonX = JSONX.getInstance();

        expect(service.transformChangeStateInfo({
            unitId: 'doc-1',
            isCompositionEnd: true,
            isSync: false,
            redoState: { actions: [] },
            undoState: { actions: [], textRanges: [] },
        } as never)).toMatchObject({
            redoState: { actions: jsonX.replaceOp(['id'], 'doc-1', 'doc-1-editing') },
            undoState: {
                actions: jsonX.insertOp(['settings'], { zoomRatio: 1 }),
                textRanges: [{ startOffset: 1, endOffset: 2 }],
            },
        });
    });

    it('uses the syncer render unit when composition state comes from syncing', () => {
        const jsonX = JSONX.getInstance();
        registerImeRenderUnit('doc-sync', createImeInputManager('doc-sync'));

        expect(service.transformChangeStateInfo({
            unitId: 'doc-1',
            syncer: 'doc-sync',
            isCompositionEnd: true,
            isSync: true,
            redoState: { actions: [] },
            undoState: { actions: [], textRanges: [] },
        } as never)).toMatchObject({
            redoState: { actions: jsonX.replaceOp(['id'], 'doc-sync', 'doc-sync-editing') },
            undoState: {
                actions: jsonX.insertOp(['settings'], { zoomRatio: 1 }),
                textRanges: [{ startOffset: 1, endOffset: 2 }],
            },
        });
    });

    it('drops composition state when the render unit no longer has an IME manager', () => {
        TestRenderManagerService.renderUnits.delete('doc-1');

        expect(service.transformChangeStateInfo({
            unitId: 'doc-1',
            isCompositionEnd: true,
            isSync: false,
            redoState: { actions: [] },
            undoState: { actions: [], textRanges: [] },
        } as never)).toBeNull();
    });

    it('throws when composition ended without cached IME history', () => {
        registerImeRenderUnit('doc-1', createImeInputManager('doc-1', false));

        expect(() => service.transformChangeStateInfo({
            unitId: 'doc-1',
            isCompositionEnd: true,
            isSync: false,
            redoState: { actions: [] },
            undoState: { actions: [], textRanges: [] },
        } as never)).toThrow('historyParams is null in RichTextEditingMutation');
    });
});
