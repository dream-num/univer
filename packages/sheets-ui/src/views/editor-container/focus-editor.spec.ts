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

import { EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE, EmbedInteractionBoundaryService, EmbedRuntimeFocusCoordinator } from '../../services/sheet-embed-integration.service';
import { afterEach, describe, expect, it } from 'vitest';
import { focusSheetCellEditorElement, registerSheetCellEditorRuntimePortal, resolveSheetCellEditorPortalRoot } from './focus-editor';

describe('focusSheetCellEditorElement', () => {
    afterEach(() => {
        document.body.replaceChildren();
    });

    it('focuses the sheet cell editor DOM node', () => {
        const hostEditor = document.createElement('div');
        hostEditor.id = '__editor_docs-embed-host';
        hostEditor.tabIndex = -1;
        const cellEditor = document.createElement('div');
        cellEditor.id = '__editor___INTERNAL_EDITOR__DOCS_NORMAL';
        cellEditor.tabIndex = -1;
        document.body.append(hostEditor, cellEditor);
        hostEditor.focus();

        expect(focusSheetCellEditorElement(document)).toBe(true);

        expect(document.activeElement).toBe(cellEditor);
    });

    it('makes the sheet cell editor focusable when it has no tabindex', () => {
        const hostEditor = document.createElement('div');
        hostEditor.id = '__editor_docs-embed-host';
        hostEditor.tabIndex = -1;
        const cellEditor = document.createElement('div');
        cellEditor.id = '__editor___INTERNAL_EDITOR__DOCS_NORMAL';
        document.body.append(hostEditor, cellEditor);
        hostEditor.focus();

        expect(focusSheetCellEditorElement(document)).toBe(true);

        expect(cellEditor.tabIndex).toBe(-1);
        expect(document.activeElement).toBe(cellEditor);
    });

    it('registers the sheet cell editor portal as an owned child editor while embedded', () => {
        const selectionContainer = document.createElement('div');
        selectionContainer.id = 'univer-doc-selection-container-__INTERNAL_EDITOR__DOCS_NORMAL';
        const cellEditor = document.createElement('div');
        cellEditor.id = '__editor___INTERNAL_EDITOR__DOCS_NORMAL';
        selectionContainer.appendChild(cellEditor);
        document.body.appendChild(selectionContainer);
        const interactionBoundaryService = new EmbedInteractionBoundaryService();
        const focusCoordinator = new EmbedRuntimeFocusCoordinator();

        const disposable = registerSheetCellEditorRuntimePortal({
            embedId: 'embed-1',
            interactionBoundaryService,
            focusCoordinator,
        });

        expect(resolveSheetCellEditorPortalRoot(document)).toBe(selectionContainer);
        expect(selectionContainer.getAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe('embed-1');
        expect(cellEditor.getAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe('embed-1');
        expect(selectionContainer.getAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE)).toBe('child-editor');
        expect(cellEditor.getAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE)).toBe('child-editor');
        expect(interactionBoundaryService.contains('embed-1', cellEditor)).toBe(true);
        expect(focusCoordinator.containsElement('embed-1', cellEditor)).toBe(true);

        disposable.dispose();

        expect(selectionContainer.hasAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe(false);
        expect(cellEditor.hasAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe(false);
        expect(selectionContainer.hasAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE)).toBe(false);
        expect(cellEditor.hasAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE)).toBe(false);
    });

    it('keeps ownership when the sheet cell editor portal is remounted while embedded', async () => {
        const selectionContainer = document.createElement('div');
        selectionContainer.id = 'univer-doc-selection-container-__INTERNAL_EDITOR__DOCS_NORMAL';
        const cellEditor = document.createElement('div');
        cellEditor.id = '__editor___INTERNAL_EDITOR__DOCS_NORMAL';
        selectionContainer.appendChild(cellEditor);
        document.body.appendChild(selectionContainer);
        const interactionBoundaryService = new EmbedInteractionBoundaryService();
        const focusCoordinator = new EmbedRuntimeFocusCoordinator();

        const disposable = registerSheetCellEditorRuntimePortal({
            embedId: 'embed-1',
            interactionBoundaryService,
            focusCoordinator,
        });

        selectionContainer.remove();
        const nextSelectionContainer = document.createElement('div');
        nextSelectionContainer.id = 'univer-doc-selection-container-__INTERNAL_EDITOR__DOCS_NORMAL';
        const nextCellEditor = document.createElement('div');
        nextCellEditor.id = '__editor___INTERNAL_EDITOR__DOCS_NORMAL';
        nextSelectionContainer.appendChild(nextCellEditor);
        document.body.appendChild(nextSelectionContainer);
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(nextSelectionContainer.getAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe('embed-1');
        expect(nextCellEditor.getAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe('embed-1');
        expect(nextSelectionContainer.getAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE)).toBe('child-editor');
        expect(nextCellEditor.getAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE)).toBe('child-editor');
        expect(interactionBoundaryService.contains('embed-1', nextCellEditor)).toBe(true);
        expect(focusCoordinator.containsElement('embed-1', nextCellEditor)).toBe(true);

        disposable.dispose();

        expect(nextSelectionContainer.hasAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe(false);
        expect(nextCellEditor.hasAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe(false);
    });
});
