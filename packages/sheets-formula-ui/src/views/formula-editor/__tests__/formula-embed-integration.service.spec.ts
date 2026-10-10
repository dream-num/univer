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

import { DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY, Injector, toDisposable } from '@univerjs/core';
import { IEditorService } from '@univerjs/docs-ui';
import { describe, expect, it } from 'vitest';
import {
    FORMULA_EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE,
    FORMULA_EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE,
    IFormulaEmbedInteractionBoundaryService,
    IFormulaEmbedRuntimeFocusCoordinator,
    registerFormulaEditorRuntimePortal,
} from '../formula-embed-integration.service';

describe('formula-embed-integration.service regression scenarios', () => {
    it('registers formula editor portal elements as embedded child editors', () => {
        const editorId = DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY;
        const portalRoot = document.createElement('div');
        const editorElement = document.createElement('div');
        portalRoot.id = `univer-doc-selection-container-${editorId}`;
        editorElement.id = `__editor_${editorId}`;
        portalRoot.appendChild(editorElement);
        document.body.appendChild(portalRoot);

        const registeredFocusElements = new Set<Element>();
        const registeredBoundaryElements = new Set<Element>();
        const focusCoordinator = {
            resolveRuntimeScopeByChildUnitId: () => undefined,
            acquireLease: () => toDisposable(() => {}),
            registerElement: ({ element, role }: { element: HTMLElement; role: string }) => {
                registeredFocusElements.add(element);
                element.setAttribute(FORMULA_EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE, role);
                return toDisposable(() => {
                    registeredFocusElements.delete(element);
                    element.removeAttribute(FORMULA_EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE);
                });
            },
        };
        const interactionBoundaryService = {
            registerOwnedElement: (embedId: string, element: Element) => {
                registeredBoundaryElements.add(element);
                element.setAttribute(FORMULA_EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, embedId);
                return toDisposable(() => {
                    registeredBoundaryElements.delete(element);
                    element.removeAttribute(FORMULA_EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE);
                });
            },
        };
        const injector = new Injector();
        injector.add([IEditorService, { useValue: {
            getEditor: () => ({ docSelectionRenderService: { selectionContainer: portalRoot, inputElement: editorElement } }),
        } as never }]);
        injector.add([IFormulaEmbedInteractionBoundaryService, { useValue: interactionBoundaryService }]);
        injector.add([IFormulaEmbedRuntimeFocusCoordinator, { useValue: focusCoordinator }]);
        const otherPortal = portalRoot.cloneNode(true) as HTMLElement;
        document.body.prepend(otherPortal);
        const disposable = registerFormulaEditorRuntimePortal({
            editorService: injector.get(IEditorService),
            embedId: 'embed-1',
            editorId,
            interactionBoundaryService: injector.get(IFormulaEmbedInteractionBoundaryService),
            focusCoordinator: injector.get(IFormulaEmbedRuntimeFocusCoordinator),
        });

        expect(registeredBoundaryElements.has(otherPortal)).toBe(false);
        expect(registeredFocusElements.has(otherPortal)).toBe(false);
        expect(portalRoot.getAttribute(FORMULA_EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe('embed-1');
        expect(editorElement.getAttribute(FORMULA_EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe('embed-1');
        expect(portalRoot.getAttribute(FORMULA_EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE)).toBe('child-editor');
        expect(editorElement.getAttribute(FORMULA_EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE)).toBe('child-editor');
        expect(registeredBoundaryElements.has(editorElement)).toBe(true);
        expect(registeredFocusElements.has(editorElement)).toBe(true);

        disposable.dispose();

        expect(portalRoot.hasAttribute(FORMULA_EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe(false);
        expect(editorElement.hasAttribute(FORMULA_EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe(false);
        portalRoot.remove();
        otherPortal.remove();
        injector.dispose();
    });
});
