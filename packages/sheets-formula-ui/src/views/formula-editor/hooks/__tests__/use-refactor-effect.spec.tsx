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

// @vitest-environment jsdom

import type { Root } from 'react-dom/client';
import {
    ContextService,
    EDITOR_ACTIVATED,
    IContextService,
    Injector,
    IUniverInstanceService,
    UniverInstanceType,
} from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { IRefSelectionsService, REF_SELECTIONS_ENABLED } from '@univerjs/sheets';
import { ContextMenuService, IContextMenuService, RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { BehaviorSubject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FormulaSelectingType } from '../use-formula-selection';
import { useRefactorEffect } from '../use-refactor-effect';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

interface IHarnessProps {
    isNeed: boolean;
    selecting: boolean | number;
    unitId?: string;
    editorId?: string;
    disableContextMenu?: boolean;
}

function RefactorEffectHarness({
    isNeed,
    selecting,
    unitId = 'workbook-1',
    editorId = 'embedding-formula-editor-1',
    disableContextMenu,
}: IHarnessProps) {
    useRefactorEffect(isNeed, selecting, unitId, editorId, disableContextMenu);
    return null;
}

function createTestEnv(editorId = 'embedding-formula-editor-1') {
    const injector = new Injector();
    const contextService = new ContextService();
    const contextMenuService = new ContextMenuService();
    const disposeSelectionChanging = vi.fn();
    const enableSelectionChanging = vi.fn(() => ({ dispose: disposeSelectionChanging }));
    const setSkipLastEnabled = vi.fn();
    const clearRefSelections = vi.fn();
    const currentSheet$ = new BehaviorSubject({ getUnitId: () => 'workbook-1' });

    const refSelectionsRenderService = {
        enableSelectionChanging,
        setSkipLastEnabled,
    };

    const renderUnit = {
        with: vi.fn(() => refSelectionsRenderService),
    };

    injector.add([IContextService, { useValue: contextService }]);
    injector.add([IContextMenuService, { useValue: contextMenuService }]);
    injector.add([IRefSelectionsService, { useValue: { clear: clearRefSelections } as never }]);
    injector.add([IRenderManagerService, {
        useValue: {
            getRenderUnitById: vi.fn(() => renderUnit),
        } as never,
    }]);
    injector.add([IUniverInstanceService, {
        useValue: {
            getCurrentTypeOfUnit$: vi.fn((type: UniverInstanceType) => (
                type === UniverInstanceType.UNIVER_SHEET ? currentSheet$ : new BehaviorSubject(null)
            )),
            getCurrentUnitOfType: vi.fn((type: UniverInstanceType) => (
                type === UniverInstanceType.UNIVER_DOC ? { getUnitId: () => editorId } : null
            )),
        } as never,
    }]);

    return {
        injector,
        contextService,
        contextMenuService,
        enableSelectionChanging,
        disposeSelectionChanging,
        setSkipLastEnabled,
        clearRefSelections,
    };
}

describe('useRefactorEffect', () => {
    let root: Root | undefined;
    let container: HTMLDivElement | undefined;
    let injector: Injector | undefined;

    afterEach(() => {
        act(() => {
            root?.unmount();
        });
        container?.remove();
        injector?.dispose();
        root = undefined;
        container = undefined;
        injector = undefined;
    });

    it('keeps context menu enabled when focused without active formula reference selection', () => {
        const env = createTestEnv();
        injector = env.injector;
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        act(() => {
            root!.render(
                <RediContext.Provider value={{ injector: env.injector }}>
                    <RefactorEffectHarness isNeed selecting={FormulaSelectingType.NOT_SELECT} />
                </RediContext.Provider>
            );
        });

        expect(env.contextService.getContextValue(EDITOR_ACTIVATED)).toBe(true);
        expect(env.contextService.getContextValue(REF_SELECTIONS_ENABLED)).toBeFalsy();
        expect(env.contextMenuService.disabled).toBe(false);
    });

    it('disables context menu during formula reference selection and re-enables it when selection ends', () => {
        const env = createTestEnv();
        injector = env.injector;
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        act(() => {
            root!.render(
                <RediContext.Provider value={{ injector: env.injector }}>
                    <RefactorEffectHarness isNeed selecting={FormulaSelectingType.NEED_ADD} />
                </RediContext.Provider>
            );
        });

        expect(env.contextService.getContextValue(REF_SELECTIONS_ENABLED)).toBe(true);
        expect(env.contextMenuService.disabled).toBe(true);
        expect(env.enableSelectionChanging).toHaveBeenCalledTimes(1);

        // Clearing "=" transitions selecting back to NOT_SELECT while the editor remains focused.
        act(() => {
            root!.render(
                <RediContext.Provider value={{ injector: env.injector }}>
                    <RefactorEffectHarness isNeed selecting={FormulaSelectingType.NOT_SELECT} />
                </RediContext.Provider>
            );
        });

        expect(env.contextService.getContextValue(REF_SELECTIONS_ENABLED)).toBe(false);
        expect(env.contextMenuService.disabled).toBe(false);
        expect(env.disposeSelectionChanging).toHaveBeenCalledTimes(1);

        // Blurring and refocusing the empty input keeps the context menu enabled.
        act(() => {
            root!.render(
                <RediContext.Provider value={{ injector: env.injector }}>
                    <RefactorEffectHarness isNeed={false} selecting={FormulaSelectingType.NOT_SELECT} />
                </RediContext.Provider>
            );
        });

        expect(env.contextService.getContextValue(EDITOR_ACTIVATED)).toBe(false);
        expect(env.clearRefSelections).toHaveBeenCalledTimes(1);
        expect(env.contextMenuService.disabled).toBe(false);

        act(() => {
            root!.render(
                <RediContext.Provider value={{ injector: env.injector }}>
                    <RefactorEffectHarness isNeed selecting={FormulaSelectingType.NOT_SELECT} />
                </RediContext.Provider>
            );
        });

        expect(env.contextMenuService.disabled).toBe(false);
    });

    it('re-enables context menu on unmount when unmounted during formula reference selection', () => {
        const env = createTestEnv();
        injector = env.injector;
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        act(() => {
            root!.render(
                <RediContext.Provider value={{ injector: env.injector }}>
                    <RefactorEffectHarness isNeed selecting={FormulaSelectingType.CAN_EDIT} />
                </RediContext.Provider>
            );
        });

        expect(env.contextMenuService.disabled).toBe(true);

        act(() => {
            root!.unmount();
        });
        root = undefined;

        expect(env.contextMenuService.disabled).toBe(false);
    });

    it('does not disable context menu when disableContextMenu is false', () => {
        const env = createTestEnv();
        injector = env.injector;
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        act(() => {
            root!.render(
                <RediContext.Provider value={{ injector: env.injector }}>
                    <RefactorEffectHarness isNeed selecting={FormulaSelectingType.NEED_ADD} disableContextMenu={false} />
                </RediContext.Provider>
            );
        });

        expect(env.contextService.getContextValue(REF_SELECTIONS_ENABLED)).toBe(true);
        expect(env.contextMenuService.disabled).toBe(false);
    });
});
