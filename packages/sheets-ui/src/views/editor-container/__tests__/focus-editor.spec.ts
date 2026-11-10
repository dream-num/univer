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

import type { IDisposable } from '@univerjs/core';
import { DOCS_NORMAL_EDITOR_UNIT_ID_KEY, toDisposable, Univer, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService, DocSkeletonManagerService } from '@univerjs/docs';
import { DocSelectionRenderService, IEditorService } from '@univerjs/docs-ui';
import { RenderUnit } from '@univerjs/engine-render';
import { ILayoutService } from '@univerjs/ui';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { EmbedInteractionBoundaryService, EmbedRuntimeFocusCoordinator } from '../../../services/sheet-embed-integration.service';
import { focusSheetCellEditorElement, registerSheetCellEditorRuntimePortal } from '../focus-editor';

const disposables: IDisposable[] = [];

class TestDocSkeletonManagerService {
    getSkeleton() { return null; }
}

function createTestBed() {
    const univer = new Univer();
    disposables.push(univer);
    const injector = univer.__getInjector();
    const host = document.createElement('div');
    document.body.appendChild(host);
    injector.add([DocSelectionManagerService]);
    injector.add([EmbedInteractionBoundaryService]);
    injector.add([EmbedRuntimeFocusCoordinator]);
    injector.add([ILayoutService, { useValue: {
        rootContainerElement: host,
        registerContainerElement: () => toDisposable(() => {}),
    } as never }]);
    const unit = univer.createUnit(UniverInstanceType.UNIVER_DOC, {
        id: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
        body: { dataStream: '\r\n', paragraphs: [{ startIndex: 0 }], sectionBreaks: [] },
        documentStyle: {},
    });
    const render = injector.createInstance(RenderUnit, {
        engine: {} as never,
        scene: { getViewports: () => [], getEngine: () => null } as never,
        isMainScene: true,
        unit,
    });
    disposables.push(render);
    render.addRenderDependencies([
        [DocSkeletonManagerService, { useClass: TestDocSkeletonManagerService }],
        [DocSelectionRenderService],
    ]);
    const selection = render.with(DocSelectionRenderService);
    injector.add([IEditorService, { useValue: {
        getEditor: vi.fn(() => ({ docSelectionRenderService: selection })),
    } as never }]);

    return {
        host,
        selection,
        editorService: injector.get(IEditorService),
        interactionBoundaryService: injector.get(EmbedInteractionBoundaryService),
        focusCoordinator: injector.get(EmbedRuntimeFocusCoordinator),
    };
}

describe('sheet cell editor instance isolation', () => {
    afterEach(() => {
        disposables.splice(0).reverse().forEach((disposable) => disposable.dispose());
        document.body.replaceChildren();
    });

    it.each([false, true])('focuses its own editor with duplicate IDs (nested: %s)', (nested) => {
        const left = createTestBed();
        const right = createTestBed();
        if (nested) {
            left.host.prepend(right.host);
        }
        left.selection.focus();

        expect(focusSheetCellEditorElement(right.editorService)).toBe(true);
        expect(document.activeElement).toBe(right.selection.inputElement);
        expect(focusSheetCellEditorElement(right.editorService)).toBe(false);
        expect(focusSheetCellEditorElement(left.editorService)).toBe(true);
        expect(document.activeElement).toBe(left.selection.inputElement);
    });

    it('makes its own input focusable without taking focus from another instance when absent', () => {
        const left = createTestBed();
        const right = createTestBed();
        right.selection.inputElement.removeAttribute('tabindex');
        left.selection.focus();

        focusSheetCellEditorElement(right.editorService);
        expect(document.activeElement).toBe(right.selection.inputElement);

        vi.mocked(left.editorService.getEditor).mockReturnValue(undefined);
        expect(focusSheetCellEditorElement(left.editorService)).toBe(false);
        expect(document.activeElement).toBe(right.selection.inputElement);
    });

    it('registers and releases only its own portal when another instance has the same IDs', () => {
        const left = createTestBed();
        const right = createTestBed();
        const registration = registerSheetCellEditorRuntimePortal({ embedId: 'embed-right', ...right });
        disposables.push(registration);

        expect(right.interactionBoundaryService.contains('embed-right', right.selection.inputElement)).toBe(true);
        expect(right.focusCoordinator.containsElement('embed-right', right.selection.inputElement)).toBe(true);
        expect(right.focusCoordinator.containsElement('embed-right', right.selection.selectionContainer)).toBe(true);
        expect(right.interactionBoundaryService.contains('embed-right', left.selection.inputElement)).toBe(false);
        expect(right.focusCoordinator.containsElement('embed-right', left.selection.inputElement)).toBe(false);

        registration.dispose();
        expect(right.interactionBoundaryService.contains('embed-right', right.selection.inputElement)).toBe(false);
        expect(right.focusCoordinator.containsElement('embed-right', right.selection.inputElement)).toBe(false);
    });

    it('releases a detached portal and registers the remounted instance editor', async () => {
        const left = createTestBed();
        const right = createTestBed();
        const registration = registerSheetCellEditorRuntimePortal({ embedId: 'embed-right', ...right });
        disposables.push(registration);
        right.selection.selectionContainer.remove();
        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(right.focusCoordinator.containsElement('embed-right', right.selection.inputElement)).toBe(false);
        expect(right.focusCoordinator.containsElement('embed-right', left.selection.inputElement)).toBe(false);

        const replacement = createTestBed();
        vi.mocked(right.editorService.getEditor).mockReturnValue({ docSelectionRenderService: replacement.selection } as never);
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(right.focusCoordinator.containsElement('embed-right', replacement.selection.inputElement)).toBe(true);
        expect(right.interactionBoundaryService.contains('embed-right', replacement.selection.inputElement)).toBe(true);

        registration.dispose();
        expect(right.focusCoordinator.containsElement('embed-right', replacement.selection.inputElement)).toBe(false);
    });
});
