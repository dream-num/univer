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

import { UniverInstanceType } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import {
    EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE,
    EmbedInteractionBoundaryService,
    isEventTargetInSameEmbedInteractionBoundary,
} from '../embed-interaction-boundary.service';
import { EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE } from '../embed-runtime-focus-coordinator.service';
import { resolveActiveEmbedRuntimeDomScope, resolveEmbedRuntimeDomScope } from '../embed-runtime-scope-dom';

describe('EmbedInteractionBoundaryService', () => {
    it('detects whether an event target belongs to the same embed interaction boundary', () => {
        const block = document.createElement('div');
        const editorHost = document.createElement('div');
        const popup = document.createElement('button');
        const foreignPopup = document.createElement('button');
        block.setAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, 'embed-1');
        foreignPopup.setAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, 'embed-2');
        block.append(editorHost, popup);
        document.body.append(block, foreignPopup);

        expect(isEventTargetInSameEmbedInteractionBoundary(editorHost, popup)).toBe(true);
        expect(isEventTargetInSameEmbedInteractionBoundary(editorHost, foreignPopup)).toBe(false);
        expect(isEventTargetInSameEmbedInteractionBoundary(editorHost, document.body)).toBe(false);

        block.remove();
        foreignPopup.remove();
    });

    it('resolves host and child unit ids from the embed float dom container', () => {
        const container = document.createElement('div');
        const runtimeRoot = document.createElement('div');
        const editorPortal = document.createElement('div');
        container.setAttribute('data-embed-float-dom', 'true');
        container.setAttribute('data-embed-id', 'embed-1');
        container.setAttribute('data-embed-host-unit-id', 'host-doc');
        container.setAttribute('data-embed-child-unit-id', 'child-sheet');
        container.setAttribute('data-embed-child-type', String(UniverInstanceType.UNIVER_SHEET));
        runtimeRoot.setAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, 'embed-1');
        editorPortal.setAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, 'embed-1');
        container.appendChild(runtimeRoot);
        document.body.append(container, editorPortal);

        expect(resolveEmbedRuntimeDomScope(runtimeRoot)).toEqual({
            embedId: 'embed-1',
            hostUnitId: 'host-doc',
            childUnitId: 'child-sheet',
            childType: UniverInstanceType.UNIVER_SHEET,
        });
        expect(resolveEmbedRuntimeDomScope(editorPortal)).toEqual({
            embedId: 'embed-1',
            hostUnitId: 'host-doc',
            childUnitId: 'child-sheet',
            childType: UniverInstanceType.UNIVER_SHEET,
        });

        container.remove();
        editorPortal.remove();
    });

    it('resolves the active stage2 embed runtime scope from the document', () => {
        const inactiveContainer = document.createElement('div');
        const activeContainer = document.createElement('div');
        inactiveContainer.setAttribute('data-embed-float-dom', 'true');
        inactiveContainer.setAttribute('data-embed-float-stage', 'inactive');
        inactiveContainer.setAttribute('data-embed-id', 'embed-inactive');
        activeContainer.setAttribute('data-embed-float-dom', 'true');
        activeContainer.setAttribute('data-embed-float-stage', 'stage2');
        activeContainer.setAttribute('data-embed-id', 'embed-active');
        activeContainer.setAttribute('data-embed-host-unit-id', 'host-doc');
        activeContainer.setAttribute('data-embed-child-unit-id', 'child-sheet');
        activeContainer.setAttribute('data-embed-child-type', String(UniverInstanceType.UNIVER_SHEET));
        document.body.append(inactiveContainer, activeContainer);

        expect(resolveActiveEmbedRuntimeDomScope(document)).toEqual({
            embedId: 'embed-active',
            hostUnitId: 'host-doc',
            childUnitId: 'child-sheet',
            childType: UniverInstanceType.UNIVER_SHEET,
        });

        inactiveContainer.remove();
        activeContainer.remove();
    });

    it('treats registered roots as part of the embed interaction boundary', () => {
        const service = new EmbedInteractionBoundaryService();
        const root = document.createElement('div');
        const child = document.createElement('button');
        root.appendChild(child);
        document.body.appendChild(root);

        const disposable = service.registerRoot('embed-1', root);

        expect(service.contains('embed-1', child)).toBe(true);
        expect(service.contains('embed-2', child)).toBe(false);
        expect(root.getAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe('embed-1');

        disposable.dispose();

        expect(service.contains('embed-1', child)).toBe(false);
        expect(root.hasAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe(false);
        root.remove();
    });

    it('can detect any embed-owned boundary when the host does not know the embed id', () => {
        const service = new EmbedInteractionBoundaryService();
        const root = document.createElement('div');
        const child = document.createElement('button');
        root.appendChild(child);
        document.body.appendChild(root);

        const disposable = service.registerRoot('embed-1', root);

        expect(service.contains(undefined, child)).toBe(true);
        expect(service.contains(undefined, document.body)).toBe(false);

        disposable.dispose();
        root.remove();
    });

    it('honors owner attributes in the event composed path', () => {
        const service = new EmbedInteractionBoundaryService();
        const root = document.createElement('div');
        const child = document.createElement('button');
        root.setAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, 'embed-1');
        root.appendChild(child);

        const event = {
            composedPath: () => [child, root, document.body, document],
        } as unknown as Event;

        expect(service.contains('embed-1', document.body, event)).toBe(true);
        expect(service.contains('embed-2', document.body, event)).toBe(false);
    });

    it('marks body portals created immediately after interaction inside a registered root', async () => {
        const service = new EmbedInteractionBoundaryService();
        const root = document.createElement('div');
        document.body.appendChild(root);
        const disposable = service.registerRoot('embed-1', root);

        expect(service.hasRecentInteraction(document)).toBe(false);
        expect(service.hasRecentInteractionFor('embed-1', document)).toBe(false);
        root.dispatchEvent(new Event('pointerdown', { bubbles: true }));
        expect(service.hasRecentInteraction(document)).toBe(true);
        expect(service.hasRecentInteractionFor('embed-1', document)).toBe(true);
        expect(service.hasRecentInteractionFor('embed-2', document)).toBe(false);
        const portal = document.createElement('div');
        document.body.appendChild(portal);
        await Promise.resolve();

        expect(portal.getAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe('embed-1');
        expect(service.contains('embed-1', portal)).toBe(true);

        disposable.dispose();
        portal.remove();
        root.remove();
    });

    it('marks popup descendants rendered inside an embed root as child popup focus role', async () => {
        const service = new EmbedInteractionBoundaryService();
        const root = document.createElement('div');
        const popup = document.createElement('section');
        const option = document.createElement('button');
        popup.className = 'univer-popup';
        popup.appendChild(option);
        root.appendChild(popup);
        document.body.appendChild(root);

        const disposable = service.registerRoot('embed-1', root);

        expect(root.getAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe('embed-1');
        expect(popup.getAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe('embed-1');
        expect(option.getAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe('embed-1');
        expect(popup.getAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE)).toBe('child-popup');
        expect(option.getAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE)).toBe('child-popup');

        disposable.dispose();
        root.remove();
    });

    it('marks popup descendants added later inside an embed root as child popup focus role', async () => {
        const service = new EmbedInteractionBoundaryService();
        const root = document.createElement('div');
        document.body.appendChild(root);
        const disposable = service.registerRoot('embed-1', root);
        const popup = document.createElement('section');
        const option = document.createElement('button');
        popup.className = 'univer-popup';
        popup.appendChild(option);

        root.appendChild(popup);
        await Promise.resolve();

        expect(popup.getAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe('embed-1');
        expect(option.getAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe('embed-1');
        expect(popup.getAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE)).toBe('child-popup');
        expect(option.getAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE)).toBe('child-popup');

        disposable.dispose();
        root.remove();
    });

    it('marks editor portals mounted under the app shell after embed interaction', async () => {
        const service = new EmbedInteractionBoundaryService();
        const root = document.createElement('div');
        const app = document.createElement('div');
        app.id = 'app';
        document.body.append(root, app);
        const disposable = service.registerRoot('embed-1', root);

        root.dispatchEvent(new Event('pointerdown', { bubbles: true }));
        const editorContainer = document.createElement('div');
        editorContainer.id = 'univer-doc-selection-container-__INTERNAL_EDITOR__DOCS_NORMAL';
        const editor = document.createElement('div');
        editor.id = '__editor___INTERNAL_EDITOR__DOCS_NORMAL';
        editor.setAttribute('data-u-comp', 'editor');
        editorContainer.appendChild(editor);
        app.appendChild(editorContainer);
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(editorContainer.getAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe('embed-1');
        expect(editorContainer.getAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE)).toBe('child-editor');
        expect(editor.getAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE)).toBe('child-editor');
        expect(service.contains('embed-1', editor)).toBe(true);
        expect(service.contains('embed-2', editor)).toBe(false);

        disposable.dispose();
        app.remove();
        root.remove();
    });

    it('does not claim existing internal editor portals during a root interaction', async () => {
        const service = new EmbedInteractionBoundaryService();
        const root = document.createElement('div');
        const app = document.createElement('div');
        const editorContainer = document.createElement('div');
        const editor = document.createElement('div');
        app.id = 'app';
        editorContainer.id = 'univer-doc-selection-container-__INTERNAL_EDITOR__DOCS_NORMAL';
        editor.id = '__editor___INTERNAL_EDITOR__DOCS_NORMAL';
        editorContainer.appendChild(editor);
        app.appendChild(editorContainer);
        document.body.append(root, app);
        const disposable = service.registerRoot('embed-1', root);

        root.dispatchEvent(new Event('pointerdown', { bubbles: true }));
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(editorContainer.hasAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe(false);
        expect(editor.hasAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe(false);
        expect(service.contains('embed-1', editor)).toBe(false);

        disposable.dispose();
        app.remove();
        root.remove();
    });

    it('claims existing internal editor portals when an embed portal scope is activated', async () => {
        const service = new EmbedInteractionBoundaryService();
        const root = document.createElement('div');
        const app = document.createElement('div');
        const editorContainer = document.createElement('div');
        const editor = document.createElement('div');
        app.id = 'app';
        editorContainer.id = 'univer-doc-selection-container-__INTERNAL_EDITOR__DOCS_NORMAL';
        editor.id = '__editor___INTERNAL_EDITOR__DOCS_NORMAL';
        editorContainer.appendChild(editor);
        app.appendChild(editorContainer);
        document.body.append(root, app);
        const rootDisposable = service.registerRoot('embed-1', root);
        const scopeDisposable = service.activatePortalScope('embed-1', document);

        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(editorContainer.getAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe('embed-1');
        expect(editor.getAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe('embed-1');
        expect(editorContainer.getAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE)).toBe('child-editor');
        expect(editor.getAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE)).toBe('child-editor');
        expect(service.contains('embed-1', editor)).toBe(true);

        scopeDisposable.dispose();
        rootDisposable.dispose();
        app.remove();
        root.remove();
    });

    it('does not claim existing app-shell editor roots that expose only the editor component marker', async () => {
        const service = new EmbedInteractionBoundaryService();
        const root = document.createElement('div');
        const app = document.createElement('div');
        const editorRoot = document.createElement('div');
        const canvas = document.createElement('canvas');
        app.id = 'app';
        editorRoot.setAttribute('data-u-comp', 'editor');
        editorRoot.appendChild(canvas);
        app.appendChild(editorRoot);
        document.body.append(root, app);
        const rootDisposable = service.registerRoot('embed-1', root);
        const scopeDisposable = service.activatePortalScope('embed-1', document);

        await new Promise((resolve) => setTimeout(resolve, 0));

        const owner = editorRoot.getAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE);
        const containsEmbed = service.contains('embed-1', canvas);
        const containsOtherEmbed = service.contains('embed-2', canvas);

        scopeDisposable.dispose();
        rootDisposable.dispose();
        app.remove();
        root.remove();

        expect(owner).toBeNull();
        expect(containsEmbed).toBe(false);
        expect(containsOtherEmbed).toBe(false);
    });

    it('does not reassign shared internal editor portals to the latest activated embed', async () => {
        const service = new EmbedInteractionBoundaryService();
        const firstRoot = document.createElement('div');
        const secondRoot = document.createElement('div');
        const app = document.createElement('div');
        const editorContainer = document.createElement('div');
        const editor = document.createElement('div');
        app.id = 'app';
        editorContainer.id = 'univer-doc-selection-container-__INTERNAL_EDITOR__DOCS_NORMAL';
        editor.id = '__editor___INTERNAL_EDITOR__DOCS_NORMAL';
        editorContainer.appendChild(editor);
        app.appendChild(editorContainer);
        document.body.append(firstRoot, secondRoot, app);
        const firstDisposable = service.registerRoot('embed-1', firstRoot);
        const secondDisposable = service.registerRoot('embed-2', secondRoot);

        const editorDisposable = service.registerOwnedElement('embed-1', editorContainer);
        firstRoot.dispatchEvent(new Event('pointerdown', { bubbles: true }));
        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(editorContainer.getAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe('embed-1');

        secondRoot.dispatchEvent(new Event('pointerdown', { bubbles: true }));
        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(editorContainer.getAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe('embed-1');
        expect(service.contains('embed-1', editor)).toBe(true);
        expect(service.contains('embed-2', editor)).toBe(false);

        editorDisposable.dispose();
        firstDisposable.dispose();
        secondDisposable.dispose();
        app.remove();
        firstRoot.remove();
        secondRoot.remove();
    });

    it('does not blur a registered shared internal editor by reassigning it to another embed', async () => {
        const service = new EmbedInteractionBoundaryService();
        const firstRoot = document.createElement('div');
        const secondRoot = document.createElement('div');
        const app = document.createElement('div');
        const editorContainer = document.createElement('div');
        const editor = document.createElement('div');
        app.id = 'app';
        editorContainer.id = 'univer-doc-selection-container-__INTERNAL_EDITOR__DOCS_NORMAL';
        editor.id = '__editor___INTERNAL_EDITOR__DOCS_NORMAL';
        editor.tabIndex = -1;
        editorContainer.appendChild(editor);
        app.appendChild(editorContainer);
        document.body.append(firstRoot, secondRoot, app);
        const firstDisposable = service.registerRoot('embed-1', firstRoot);
        const secondDisposable = service.registerRoot('embed-2', secondRoot);
        const editorDisposable = service.registerOwnedElement('embed-1', editorContainer);

        firstRoot.dispatchEvent(new Event('pointerdown', { bubbles: true }));
        await new Promise((resolve) => setTimeout(resolve, 0));
        editor.focus();

        expect(document.activeElement).toBe(editor);
        expect(editorContainer.getAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe('embed-1');

        secondRoot.dispatchEvent(new Event('pointerdown', { bubbles: true }));
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(editorContainer.getAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe('embed-1');
        expect(document.activeElement).toBe(editor);

        editorDisposable.dispose();
        firstDisposable.dispose();
        secondDisposable.dispose();
        app.remove();
        firstRoot.remove();
        secondRoot.remove();
    });

    it('does not claim existing host doc editor portals when an embed is activated', async () => {
        const service = new EmbedInteractionBoundaryService();
        const root = document.createElement('div');
        const app = document.createElement('div');
        const hostEditorContainer = document.createElement('div');
        const hostEditor = document.createElement('div');
        app.id = 'app';
        hostEditorContainer.id = 'univer-doc-selection-container-docs-embed-host';
        hostEditor.id = '__editor_docs-embed-host';
        hostEditor.setAttribute('data-u-comp', 'editor');
        hostEditorContainer.appendChild(hostEditor);
        app.appendChild(hostEditorContainer);
        document.body.append(root, app);
        const disposable = service.registerRoot('embed-1', root);

        root.dispatchEvent(new Event('pointerdown', { bubbles: true }));
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(hostEditorContainer.hasAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe(false);
        expect(hostEditor.hasAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe(false);
        expect(service.contains('embed-1', hostEditor)).toBe(false);

        disposable.dispose();
        app.remove();
        root.remove();
    });

    it('expires recent interaction state after the portal claim ttl', () => {
        vi.useFakeTimers();
        const service = new EmbedInteractionBoundaryService();
        const root = document.createElement('div');
        document.body.appendChild(root);
        const disposable = service.registerRoot('embed-1', root);

        root.dispatchEvent(new Event('pointerdown', { bubbles: true }));
        expect(service.hasRecentInteraction(document)).toBe(true);

        vi.advanceTimersByTime(1001);
        expect(service.hasRecentInteraction(document)).toBe(false);

        disposable.dispose();
        root.remove();
        vi.useRealTimers();
    });

    it('claims Univer popup portals while an embed portal scope is active', async () => {
        const service = new EmbedInteractionBoundaryService();
        const root = document.createElement('div');
        const app = document.createElement('div');
        app.id = 'app';
        document.body.append(root, app);
        const rootDisposable = service.registerRoot('embed-1', root);
        const scopeDisposable = (service as unknown as {
            activatePortalScope: (embedId: string, ownerDocument: Document) => { dispose: () => void };
        }).activatePortalScope('embed-1', document);

        const popup = document.createElement('section');
        popup.className = 'univer-popup';
        const option = document.createElement('button');
        option.textContent = 'Leo';
        popup.appendChild(option);
        app.appendChild(popup);
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(popup.getAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe('embed-1');
        expect(popup.getAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE)).toBe('child-popup');
        expect(option.getAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE)).toBe('child-popup');
        expect(option.getAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe('embed-1');
        expect(service.contains('embed-1', option)).toBe(true);
        expect(service.contains('embed-2', option)).toBe(false);

        scopeDisposable.dispose();
        rootDisposable.dispose();
        app.remove();
        root.remove();
    });

    it('claims RectPopup portals by component marker while an embed portal scope is active', async () => {
        const service = new EmbedInteractionBoundaryService();
        const root = document.createElement('div');
        const app = document.createElement('div');
        app.id = 'app';
        document.body.append(root, app);
        const rootDisposable = service.registerRoot('embed-1', root);
        const scopeDisposable = service.activatePortalScope('embed-1', document);

        const popup = document.createElement('section');
        popup.setAttribute('data-u-comp', 'rect-popup');
        const option = document.createElement('button');
        option.textContent = 'May';
        popup.appendChild(option);
        app.appendChild(popup);
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(popup.getAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe('embed-1');
        expect(popup.getAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE)).toBe('child-popup');
        expect(option.getAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE)).toBe('child-popup');
        expect(option.getAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe('embed-1');
        expect(service.contains('embed-1', option)).toBe(true);

        scopeDisposable.dispose();
        rootDisposable.dispose();
        app.remove();
        root.remove();
    });

    it('releases transient body portal ownership when an embed portal scope is disposed', async () => {
        const service = new EmbedInteractionBoundaryService();
        const root = document.createElement('div');
        const app = document.createElement('div');
        app.id = 'app';
        document.body.append(root, app);
        const rootDisposable = service.registerRoot('embed-1', root);
        const scopeDisposable = service.activatePortalScope('embed-1', document);

        const editorContainer = document.createElement('div');
        const editor = document.createElement('div');
        editorContainer.id = 'univer-doc-selection-container-__INTERNAL_EDITOR__DOCS_NORMAL';
        editor.id = '__editor___INTERNAL_EDITOR__DOCS_NORMAL';
        editor.tabIndex = -1;
        editorContainer.appendChild(editor);
        app.appendChild(editorContainer);
        await new Promise((resolve) => setTimeout(resolve, 0));
        editor.focus();
        editor.blur = vi.fn();

        expect(editorContainer.getAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe('embed-1');
        expect(editor.getAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE)).toBe('child-editor');
        expect(editor.getAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe('embed-1');
        expect(document.activeElement).toBe(editor);

        scopeDisposable.dispose();

        expect(editorContainer.hasAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe(false);
        expect(editor.hasAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE)).toBe(false);
        expect(document.activeElement).not.toBe(editor);
        expect(service.contains('embed-1', editor)).toBe(false);
        expect(root.getAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe('embed-1');

        rootDisposable.dispose();
        app.remove();
        root.remove();
    });

    it('reassigns existing Univer popup portals to the latest active embed portal scope', async () => {
        const service = new EmbedInteractionBoundaryService();
        const firstRoot = document.createElement('div');
        const secondRoot = document.createElement('div');
        const app = document.createElement('div');
        const popup = document.createElement('section');
        const option = document.createElement('button');
        app.id = 'app';
        popup.className = 'univer-popup';
        option.textContent = 'Leo';
        popup.appendChild(option);
        app.appendChild(popup);
        document.body.append(firstRoot, secondRoot, app);
        const firstRootDisposable = service.registerRoot('embed-1', firstRoot);
        const secondRootDisposable = service.registerRoot('embed-2', secondRoot);
        const firstScopeDisposable = (service as unknown as {
            activatePortalScope: (embedId: string, ownerDocument: Document) => { dispose: () => void };
        }).activatePortalScope('embed-1', document);
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(popup.getAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe('embed-1');

        const secondScopeDisposable = (service as unknown as {
            activatePortalScope: (embedId: string, ownerDocument: Document) => { dispose: () => void };
        }).activatePortalScope('embed-2', document);
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(popup.getAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe('embed-2');
        expect(service.contains('embed-2', option)).toBe(true);
        expect(service.contains('embed-1', option)).toBe(false);

        firstScopeDisposable.dispose();
        secondScopeDisposable.dispose();
        firstRootDisposable.dispose();
        secondRootDisposable.dispose();
        app.remove();
        firstRoot.remove();
        secondRoot.remove();
    });

    it('restores the previous active portal scope after the latest one is disposed', async () => {
        const service = new EmbedInteractionBoundaryService();
        const firstRoot = document.createElement('div');
        const secondRoot = document.createElement('div');
        const app = document.createElement('div');
        app.id = 'app';
        document.body.append(firstRoot, secondRoot, app);
        const firstRootDisposable = service.registerRoot('embed-1', firstRoot);
        const secondRootDisposable = service.registerRoot('embed-2', secondRoot);
        const firstScopeDisposable = service.activatePortalScope('embed-1', document);
        const secondScopeDisposable = service.activatePortalScope('embed-2', document);

        secondScopeDisposable.dispose();

        const popup = document.createElement('section');
        const option = document.createElement('button');
        popup.className = 'univer-popup';
        popup.appendChild(option);
        app.appendChild(popup);
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(popup.getAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe('embed-1');
        expect(option.getAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe('embed-1');
        expect(service.contains('embed-1', option)).toBe(true);
        expect(service.contains('embed-2', option)).toBe(false);

        firstScopeDisposable.dispose();
        firstRootDisposable.dispose();
        secondRootDisposable.dispose();
        app.remove();
        firstRoot.remove();
        secondRoot.remove();
    });

    it('reassigns existing popup portals to the previous active portal scope when the latest one is disposed', async () => {
        const service = new EmbedInteractionBoundaryService();
        const firstRoot = document.createElement('div');
        const secondRoot = document.createElement('div');
        const app = document.createElement('div');
        const popup = document.createElement('section');
        const option = document.createElement('button');
        app.id = 'app';
        popup.className = 'univer-popup';
        popup.appendChild(option);
        app.appendChild(popup);
        document.body.append(firstRoot, secondRoot, app);
        const firstRootDisposable = service.registerRoot('embed-1', firstRoot);
        const secondRootDisposable = service.registerRoot('embed-2', secondRoot);
        const firstScopeDisposable = service.activatePortalScope('embed-1', document);
        const secondScopeDisposable = service.activatePortalScope('embed-2', document);
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(popup.getAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe('embed-2');

        secondScopeDisposable.dispose();
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(popup.getAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe('embed-1');
        expect(option.getAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe('embed-1');
        expect(service.contains('embed-1', option)).toBe(true);
        expect(service.contains('embed-2', option)).toBe(false);

        firstScopeDisposable.dispose();
        firstRootDisposable.dispose();
        secondRootDisposable.dispose();
        app.remove();
        firstRoot.remove();
        secondRoot.remove();
    });

    it('keeps portal ownership when one of multiple scopes for the same embed is disposed', async () => {
        const service = new EmbedInteractionBoundaryService();
        const root = document.createElement('div');
        const app = document.createElement('div');
        const popup = document.createElement('section');
        const option = document.createElement('button');
        app.id = 'app';
        popup.className = 'univer-popup';
        popup.appendChild(option);
        app.appendChild(popup);
        document.body.append(root, app);
        const rootDisposable = service.registerRoot('embed-1', root);
        const firstScopeDisposable = service.activatePortalScope('embed-1', document);
        const secondScopeDisposable = service.activatePortalScope('embed-1', document);
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(popup.getAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe('embed-1');

        firstScopeDisposable.dispose();
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(popup.getAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe('embed-1');
        expect(option.getAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe('embed-1');
        expect(service.contains('embed-1', option)).toBe(true);

        secondScopeDisposable.dispose();
        rootDisposable.dispose();
        app.remove();
        root.remove();
    });

    it('does not claim hidden offscreen Univer menu caches while an embed portal scope is active', async () => {
        const service = new EmbedInteractionBoundaryService();
        const root = document.createElement('div');
        const app = document.createElement('div');
        const cachedMenu = document.createElement('section');
        const option = document.createElement('button');
        app.id = 'app';
        cachedMenu.className = 'univer-popup';
        cachedMenu.style.position = 'fixed';
        cachedMenu.style.left = '-9999px';
        cachedMenu.style.top = '-9999px';
        option.textContent = 'Delete';
        cachedMenu.appendChild(option);
        app.appendChild(cachedMenu);
        document.body.append(root, app);
        vi.spyOn(cachedMenu, 'getBoundingClientRect').mockReturnValue({
            x: -9999,
            y: -9999,
            left: -9999,
            top: -9999,
            right: -9783,
            bottom: -9679,
            width: 216,
            height: 320,
            toJSON: () => ({}),
        } as DOMRect);
        vi.spyOn(option, 'getBoundingClientRect').mockReturnValue({
            x: -9988,
            y: -9988,
            left: -9988,
            top: -9988,
            right: -9772,
            bottom: -9956,
            width: 216,
            height: 32,
            toJSON: () => ({}),
        } as DOMRect);
        const rootDisposable = service.registerRoot('embed-1', root);
        const scopeDisposable = service.activatePortalScope('embed-1', document);
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(cachedMenu.hasAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe(false);
        expect(option.hasAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe(false);
        expect(service.contains('embed-1', option)).toBe(false);

        scopeDisposable.dispose();
        rootDisposable.dispose();
        app.remove();
        root.remove();
    });

    it('does not claim hidden offscreen Univer menu caches after a root interaction', async () => {
        const service = new EmbedInteractionBoundaryService();
        const root = document.createElement('div');
        const portalWrapper = document.createElement('div');
        const cachedMenu = document.createElement('section');
        const option = document.createElement('button');
        cachedMenu.className = 'univer-popup';
        option.textContent = 'Delete';
        cachedMenu.appendChild(option);
        portalWrapper.appendChild(cachedMenu);
        document.body.append(root, portalWrapper);
        vi.spyOn(cachedMenu, 'getBoundingClientRect').mockReturnValue({
            x: -9999,
            y: -9999,
            left: -9999,
            top: -9999,
            right: -9783,
            bottom: -9679,
            width: 216,
            height: 320,
            toJSON: () => ({}),
        } as DOMRect);
        const rootDisposable = service.registerRoot('embed-1', root);
        root.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(cachedMenu.hasAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe(false);
        expect(option.hasAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe(false);
        expect(service.contains('embed-1', option)).toBe(false);

        rootDisposable.dispose();
        portalWrapper.remove();
        root.remove();
    });

    it('does not claim empty zero-size offscreen Univer popup caches after a root interaction', async () => {
        const service = new EmbedInteractionBoundaryService();
        const root = document.createElement('div');
        const portalWrapper = document.createElement('div');
        const cachedPopup = document.createElement('section');
        cachedPopup.className = 'univer-popup';
        portalWrapper.appendChild(cachedPopup);
        document.body.append(root, portalWrapper);
        vi.spyOn(cachedPopup, 'getBoundingClientRect').mockReturnValue({
            x: -9997,
            y: -9997,
            left: -9997,
            top: -9997,
            right: -9997,
            bottom: -9997,
            width: 0,
            height: 0,
            toJSON: () => ({}),
        } as DOMRect);
        const rootDisposable = service.registerRoot('embed-1', root);
        root.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(cachedPopup.hasAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe(false);
        expect(service.contains('embed-1', cachedPopup)).toBe(false);

        rootDisposable.dispose();
        portalWrapper.remove();
        root.remove();
    });

    it('does not claim ordinary body-level app chrome while an embed portal scope is active', async () => {
        const service = new EmbedInteractionBoundaryService();
        const root = document.createElement('div');
        const appChrome = document.createElement('div');
        appChrome.className = 'univer-relative univer-select-none univer-h-9';
        document.body.append(root, appChrome);
        const rootDisposable = service.registerRoot('embed-1', root);
        expect(appChrome.hasAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe(false);
        expect((service as unknown as {
            _isBodyPortalCandidate: (element: HTMLElement, ownerDocument: Document, options: { includeAppShellEditorPortal?: boolean; allowOwnedPortalReassignment?: boolean; allowDirectBodyPortal?: boolean }) => boolean;
        })._isBodyPortalCandidate(appChrome, document, {
            includeAppShellEditorPortal: true,
            allowOwnedPortalReassignment: true,
            allowDirectBodyPortal: false,
        })).toBe(false);
        const scopeDisposable = service.activatePortalScope('embed-1', document);
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(appChrome.hasAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe(false);
        expect(service.contains('embed-1', appChrome)).toBe(false);

        scopeDisposable.dispose();
        rootDisposable.dispose();
        appChrome.remove();
        root.remove();
    });

    it('dispatches Escape to owned floating surfaces when closing an embed scope', () => {
        const service = new EmbedInteractionBoundaryService();
        const root = document.createElement('div');
        const popup = document.createElement('div');
        const option = document.createElement('button');
        const foreignPopup = document.createElement('div');
        popup.className = 'univer-popover';
        foreignPopup.className = 'univer-popover';
        popup.appendChild(option);
        document.body.append(root, popup, foreignPopup);
        const rootDisposable = service.registerRoot('embed-1', root);
        popup.setAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, 'embed-1');
        option.setAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, 'embed-1');
        foreignPopup.setAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, 'embed-2');
        const popupEscape = vi.fn();
        const optionEscape = vi.fn();
        const foreignEscape = vi.fn();
        popup.addEventListener('keydown', (event) => {
            if ((event as KeyboardEvent).key === 'Escape') {
                popupEscape();
            }
        });
        option.addEventListener('keydown', (event) => {
            if ((event as KeyboardEvent).key === 'Escape') {
                optionEscape();
            }
        });
        foreignPopup.addEventListener('keydown', (event) => {
            if ((event as KeyboardEvent).key === 'Escape') {
                foreignEscape();
            }
        });
        option.focus();

        service.closeOwnedFloatingSurfaces('embed-1', document);

        expect(optionEscape).toHaveBeenCalledTimes(1);
        expect(popupEscape).toHaveBeenCalledTimes(1);
        expect(foreignEscape).not.toHaveBeenCalled();

        rootDisposable.dispose();
        popup.remove();
        foreignPopup.remove();
        root.remove();
    });

    it('does not dispatch Escape to root-only app chrome when closing floating surfaces', () => {
        const service = new EmbedInteractionBoundaryService();
        const root = document.createElement('div');
        const headerbar = document.createElement('div');
        const tab = document.createElement('button');
        headerbar.setAttribute('data-u-comp', 'headerbar');
        headerbar.appendChild(tab);
        document.body.append(root, headerbar);
        const rootDisposable = service.registerRoot('embed-1', root);
        const headerDisposable = service.registerRoot('embed-1', headerbar);
        const escape = vi.fn();
        headerbar.addEventListener('keydown', (event) => {
            if ((event as KeyboardEvent).key === 'Escape') {
                escape();
            }
        });

        service.closeOwnedFloatingSurfaces('embed-1', document);

        expect(escape).not.toHaveBeenCalled();

        headerDisposable.dispose();
        rootDisposable.dispose();
        headerbar.remove();
        root.remove();
    });

    it('does not dispatch Escape to persistent embed floating menus when closing transient surfaces', () => {
        const service = new EmbedInteractionBoundaryService();
        const root = document.createElement('div');
        const menu = document.createElement('div');
        menu.className = 'univer-slide-embed-floating-menu';
        menu.setAttribute('data-embed-floating-menu', 'true');
        menu.setAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, 'embed-1');
        document.body.append(root, menu);
        const rootDisposable = service.registerRoot('embed-1', root);
        const escape = vi.fn();
        menu.addEventListener('keydown', (event) => {
            if ((event as KeyboardEvent).key === 'Escape') {
                escape();
            }
        });

        service.closeOwnedFloatingSurfaces('embed-1', document);

        expect(escape).not.toHaveBeenCalled();

        rootDisposable.dispose();
        menu.remove();
        root.remove();
    });
});
