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

import type { IDisposable } from '@univerjs/core';
import { DisposableCollection, DOCS_NORMAL_EDITOR_UNIT_ID_KEY, toDisposable } from '@univerjs/core';
import type { ISheetEmbedInteractionBoundaryService, ISheetEmbedRuntimeFocusCoordinator } from '../../services/sheet-embed-integration.service';

const SHEET_CELL_EDITOR_ELEMENT_ID = `__editor_${DOCS_NORMAL_EDITOR_UNIT_ID_KEY}`;
const SHEET_CELL_EDITOR_SELECTION_CONTAINER_ID = `univer-doc-selection-container-${DOCS_NORMAL_EDITOR_UNIT_ID_KEY}`;

export function focusSheetCellEditorElement(ownerDocument: Document = document): boolean {
    const element = ownerDocument.getElementById(SHEET_CELL_EDITOR_ELEMENT_ID) as HTMLElement | null;

    if (element == null || ownerDocument.activeElement === element) {
        return false;
    }

    if (!element.hasAttribute('tabindex')) {
        element.tabIndex = -1;
    }

    element.focus({ preventScroll: true });

    return ownerDocument.activeElement === element;
}

export function registerSheetCellEditorRuntimePortal(options: {
    embedId: string;
    ownerDocument?: Document;
    interactionBoundaryService?: ISheetEmbedInteractionBoundaryService;
    focusCoordinator?: ISheetEmbedRuntimeFocusCoordinator;
}): IDisposable {
    const ownerDocument = options.ownerDocument ?? (typeof document === 'undefined' ? undefined : document);
    if (!ownerDocument) {
        return toDisposable(() => {});
    }

    const collection = new DisposableCollection();
    const view = ownerDocument.defaultView;
    let disposed = false;
    let registeredPortalRoot: HTMLElement | null = null;
    let portalRegistration: IDisposable | undefined;
    const frameHandles: number[] = [];
    let observer: MutationObserver | undefined;
    const tryRegister = () => {
        if (disposed) {
            return;
        }

        const portalRoot = resolveSheetCellEditorPortalRoot(ownerDocument);
        if (portalRoot === registeredPortalRoot) {
            return;
        }

        portalRegistration?.dispose();
        portalRegistration = undefined;
        registeredPortalRoot = null;
        if (!portalRoot) {
            return;
        }

        const rootRegistration = new DisposableCollection();
        registeredPortalRoot = portalRoot;
        if (options.interactionBoundaryService) {
            rootRegistration.add(options.interactionBoundaryService.registerOwnedElement(options.embedId, portalRoot));
        }

        if (options.focusCoordinator) {
            rootRegistration.add(options.focusCoordinator.registerElement({
                embedId: options.embedId,
                role: 'child-editor',
                element: portalRoot,
            }));

            const editorElement = ownerDocument.getElementById(SHEET_CELL_EDITOR_ELEMENT_ID) as HTMLElement | null;
            if (editorElement && editorElement !== portalRoot) {
                rootRegistration.add(options.focusCoordinator.registerElement({
                    embedId: options.embedId,
                    role: 'child-editor',
                    element: editorElement,
                }));
            }
        }
        portalRegistration = rootRegistration;
    };
    const scheduleRetry = (remaining: number) => {
        if (remaining <= 0 || !view?.requestAnimationFrame) {
            return;
        }

        const handle = view.requestAnimationFrame(() => {
            const index = frameHandles.indexOf(handle);
            if (index >= 0) {
                frameHandles.splice(index, 1);
            }
            tryRegister();
            if (!registeredPortalRoot) {
                scheduleRetry(remaining - 1);
            }
        });
        frameHandles.push(handle);
    };

    tryRegister();
    if (!registeredPortalRoot) {
        scheduleRetry(2);
    }
    if (view?.MutationObserver && ownerDocument.body) {
        observer = new view.MutationObserver(() => tryRegister());
        observer.observe(ownerDocument.body, { childList: true, subtree: true });
    }

    collection.add(toDisposable(() => {
        disposed = true;
        frameHandles.forEach((handle) => view?.cancelAnimationFrame?.(handle));
        frameHandles.length = 0;
        observer?.disconnect();
        observer = undefined;
        portalRegistration?.dispose();
        portalRegistration = undefined;
        registeredPortalRoot = null;
    }));

    return collection;
}

export function resolveSheetCellEditorPortalRoot(ownerDocument: Document = document): HTMLElement | null {
    return (ownerDocument.getElementById(SHEET_CELL_EDITOR_SELECTION_CONTAINER_ID) as HTMLElement | null)
        ?? (ownerDocument.getElementById(SHEET_CELL_EDITOR_ELEMENT_ID) as HTMLElement | null);
}
