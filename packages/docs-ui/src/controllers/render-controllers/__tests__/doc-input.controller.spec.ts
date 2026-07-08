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

/**
 * @vitest-environment jsdom
 */

import { DOCS_NORMAL_EDITOR_UNIT_ID_KEY } from '@univerjs/core';
import { EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, EmbedInteractionBoundaryService, EmbedRuntimeFocusCoordinator } from '../../../services/doc-embed-integration.service';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { DocInputController } from '../doc-input.controller';

describe('DocInputController', () => {
    it('does not insert host document text while an embedded child runtime owns focus', async () => {
        const onInput$ = new Subject<unknown>();
        const executeCommand = vi.fn();
        const focusCoordinator = new EmbedRuntimeFocusCoordinator();
        const lease = focusCoordinator.acquireLease({
            embedId: 'embed-sheet',
            role: 'child-session',
            owner: 'stage2-runtime',
        });

        new DocInputController(
            {
                unitId: 'host-doc',
                unit: {
                    getSelfOrHeaderFooterModel: vi.fn(() => ({
                        getBody: vi.fn(() => ({ dataStream: '\r\n' })),
                    })),
                },
            } as never,
            { onInput$ } as never,
            { getSkeleton: vi.fn(() => ({})) } as never,
            { executeCommand } as never,
            {
                getDefaultStyle: vi.fn(() => ({})),
                getStyleCache: vi.fn(() => ({})),
            } as never,
            undefined,
            focusCoordinator
        );

        onInput$.next({
            event: { defaultPrevented: false, data: '=' },
            content: '=',
            activeRange: {
                segmentId: undefined,
                startOffset: 0,
                endOffset: 0,
            },
        });
        await Promise.resolve();

        expect(executeCommand).not.toHaveBeenCalled();
        lease.dispose();
    });

    it('keeps sheet cell editor input available while an embedded child runtime owns focus', async () => {
        const onInput$ = new Subject<unknown>();
        const executeCommand = vi.fn();
        const focusCoordinator = new EmbedRuntimeFocusCoordinator();
        const lease = focusCoordinator.acquireLease({
            embedId: 'embed-sheet',
            role: 'child-session',
            owner: 'stage2-runtime',
        });

        new DocInputController(
            {
                unitId: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
                unit: {
                    getSelfOrHeaderFooterModel: vi.fn(() => ({
                        getBody: vi.fn(() => ({ dataStream: '\r\n' })),
                    })),
                },
            } as never,
            { onInput$ } as never,
            { getSkeleton: vi.fn(() => ({})) } as never,
            { executeCommand } as never,
            {
                getDefaultStyle: vi.fn(() => ({})),
                getStyleCache: vi.fn(() => ({})),
            } as never,
            undefined,
            focusCoordinator
        );

        onInput$.next({
            event: { defaultPrevented: false, data: '=' },
            content: '=',
            activeRange: {
                segmentId: undefined,
                startOffset: 0,
                endOffset: 0,
            },
        });
        await Promise.resolve();

        expect(executeCommand).toHaveBeenCalledWith('doc.command.insert-text', expect.objectContaining({
            unitId: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
        }));
        lease.dispose();
    });

    it('does not let a host-scoped child session suppress unrelated host document input', async () => {
        const onInput$ = new Subject<unknown>();
        const executeCommand = vi.fn();
        const focusCoordinator = new EmbedRuntimeFocusCoordinator();
        const lease = focusCoordinator.acquireLease({
            embedId: 'embed-sheet',
            role: 'child-session',
            owner: 'stage2-runtime',
            hostUnitId: 'host-doc',
            childUnitId: 'child-sheet',
        });

        new DocInputController(
            {
                unitId: 'other-host-doc',
                unit: {
                    getSelfOrHeaderFooterModel: vi.fn(() => ({
                        getBody: vi.fn(() => ({ dataStream: '\r\n' })),
                    })),
                },
            } as never,
            { onInput$ } as never,
            { getSkeleton: vi.fn(() => ({})) } as never,
            { executeCommand } as never,
            {
                getDefaultStyle: vi.fn(() => ({})),
                getStyleCache: vi.fn(() => ({})),
            } as never,
            undefined,
            focusCoordinator
        );

        onInput$.next({
            event: { defaultPrevented: false, data: 'o' },
            content: 'o',
            activeRange: {
                segmentId: undefined,
                startOffset: 0,
                endOffset: 0,
            },
        });
        await Promise.resolve();

        expect(executeCommand).toHaveBeenCalledWith('doc.command.insert-text', expect.objectContaining({
            unitId: 'other-host-doc',
        }));
        lease.dispose();
    });

    it('keeps embedded child document input available while its host owns the embed session', async () => {
        const onInput$ = new Subject<unknown>();
        const executeCommand = vi.fn();
        const focusCoordinator = new EmbedRuntimeFocusCoordinator();
        const interactionBoundaryService = new EmbedInteractionBoundaryService();
        const childEditor = document.createElement('div');
        childEditor.setAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, 'embed-doc');
        const childInput = document.createElement('input');
        childEditor.appendChild(childInput);
        document.body.appendChild(childEditor);
        const lease = focusCoordinator.acquireLease({
            embedId: 'embed-doc',
            role: 'child-session',
            owner: 'stage2-runtime',
            hostUnitId: 'host-sheet',
            childUnitId: 'child-doc',
        });

        new DocInputController(
            {
                unitId: 'child-doc',
                unit: {
                    getSelfOrHeaderFooterModel: vi.fn(() => ({
                        getBody: vi.fn(() => ({ dataStream: '\r\n' })),
                    })),
                },
            } as never,
            { onInput$ } as never,
            { getSkeleton: vi.fn(() => ({})) } as never,
            { executeCommand } as never,
            {
                getDefaultStyle: vi.fn(() => ({})),
                getStyleCache: vi.fn(() => ({})),
            } as never,
            interactionBoundaryService,
            focusCoordinator
        );

        onInput$.next({
            event: { defaultPrevented: false, data: 'a', target: childInput },
            content: 'a',
            activeRange: {
                segmentId: undefined,
                startOffset: 0,
                endOffset: 0,
            },
        });
        await Promise.resolve();

        expect(executeCommand).toHaveBeenCalledWith('doc.command.insert-text', expect.objectContaining({
            unitId: 'child-doc',
        }));
        lease.dispose();
        childEditor.remove();
    });

    it('keeps tab embedded child document input available through runtime ownership without a stage2 lease', async () => {
        const onInput$ = new Subject<unknown>();
        const executeCommand = vi.fn();
        const focusCoordinator = new EmbedRuntimeFocusCoordinator();
        const interactionBoundaryService = new EmbedInteractionBoundaryService();
        const childEditor = document.createElement('div');
        childEditor.setAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, 'sheets-tab-doc');
        const childInput = document.createElement('input');
        childEditor.appendChild(childInput);
        document.body.appendChild(childEditor);
        const runtimeScope = focusCoordinator.registerRuntimeScope({
            embedId: 'sheets-tab-doc',
            hostUnitId: 'host-sheet',
            childUnitId: 'child-doc',
        });

        new DocInputController(
            {
                unitId: 'child-doc',
                unit: {
                    getSelfOrHeaderFooterModel: vi.fn(() => ({
                        getBody: vi.fn(() => ({ dataStream: '\r\n' })),
                    })),
                },
            } as never,
            { onInput$ } as never,
            { getSkeleton: vi.fn(() => ({})) } as never,
            { executeCommand } as never,
            {
                getDefaultStyle: vi.fn(() => ({})),
                getStyleCache: vi.fn(() => ({})),
            } as never,
            interactionBoundaryService,
            focusCoordinator
        );

        onInput$.next({
            event: { defaultPrevented: false, data: 'x', target: childInput },
            content: 'x',
            activeRange: {
                segmentId: undefined,
                startOffset: 0,
                endOffset: 0,
            },
        });
        await Promise.resolve();

        expect(executeCommand).toHaveBeenCalledWith('doc.command.insert-text', expect.objectContaining({
            unitId: 'child-doc',
        }));
        runtimeScope.dispose();
        childEditor.remove();
    });
});
