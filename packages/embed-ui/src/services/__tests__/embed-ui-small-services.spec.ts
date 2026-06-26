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
import { EmbedFocusOwnerService } from '@univerjs/embed';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { getEmbedHostChromePolicy } from '../../common/embed-host-chrome-policy';
import {
    getEmbedTabPeerHostHeaderMode,
    getEmbedTabPeerWorkbenchRole,
    isEmbedTabPeerEntry,
} from '../../common/tab-peer-workbench';
import { EmbedHostAnchorCleanupController } from '../../controllers/embed-host-anchor-cleanup.controller';
import { EmbedHostRibbonOverrideController } from '../../controllers/embed-host-ribbon-override.controller';
import { EmbedBlockRegistryService } from '../embed-block-registry.service';
import { EmbedFloatingActiveService } from '../embed-floating-active.service';
import { EmbedHostAnchorModelService } from '../embed-host-anchor-model.service';
import { EmbedHostMenuOverrideService } from '../embed-host-menu-override.service';
import { EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE } from '../embed-interaction-boundary.service';
import { EmbedRuntimeFocusCoordinator } from '../embed-runtime-focus-coordinator.service';
import { EmbedUndoBridgeService } from '../embed-undo-bridge.service';

describe('embed-ui small services and controllers', () => {
    it('computes host chrome and tab peer policies', () => {
        expect(getEmbedHostChromePolicy({})).toEqual({
            hideHostHeaderChrome: false,
            hideHostFormulaBar: false,
            hideSheetFooterControls: false,
            hideSlideInsertToolbar: false,
            hideGlobalBaseWorkbench: false,
            restoreEmbedBaseWorkbench: false,
        });
        expect(getEmbedHostChromePolicy({
            entry: 'sheets-sheet-tab',
            childType: UniverInstanceType.UNIVER_SHEET,
            hasMountedSlideWorkbench: true,
            hasMountedBaseWorkbench: true,
        })).toMatchObject({
            hideHostHeaderChrome: true,
            hideHostFormulaBar: true,
            hideSheetFooterControls: true,
            hideSlideInsertToolbar: true,
            hideGlobalBaseWorkbench: true,
            restoreEmbedBaseWorkbench: true,
        });
        expect(getEmbedHostChromePolicy({
            entry: 'bases-table-list-block',
            childType: UniverInstanceType.UNIVER_BASE,
        })).toMatchObject({
            hideGlobalBaseWorkbench: false,
            restoreEmbedBaseWorkbench: true,
        });
        expect(isEmbedTabPeerEntry('sheets-sheet-tab')).toBe(true);
        expect(isEmbedTabPeerEntry('docs-custom-block')).toBe(false);
        expect(getEmbedTabPeerWorkbenchRole('slides-page-list-block')).toBe('slides-main-workbench');
        expect(getEmbedTabPeerHostHeaderMode('slides-page-list-block')).toBe('extend-host-header');
        expect(getEmbedTabPeerHostHeaderMode('docs-custom-block')).toBeUndefined();
    });

    it('tracks floating active stage transitions', () => {
        const service = new EmbedFloatingActiveService();
        const values: unknown[] = [];
        service.active$.subscribe((value) => values.push(value));
        const activation = { hostUnitId: 'host-1', embedId: 'embed-1', childUnitId: 'child-1' };

        expect(service.getStage('embed-1')).toBe('inactive');
        service.activate(activation);
        expect(service.getStage('embed-1')).toBe('stage1');
        service.promote('embed-1');
        expect(service.getStage('embed-1')).toBe('stage2');
        service.activate(activation);
        expect(service.getStage('embed-1')).toBe('stage2');
        service.setStage('other', 'stage1');
        expect(service.getStage('embed-1')).toBe('stage2');
        service.clear('other');
        expect(service.getActive()).toBeTruthy();
        service.clear('embed-1');
        expect(service.getActive()).toBeNull();
        expect(values.length).toBeGreaterThan(1);
    });

    it('routes child undo redo to host stack when focus owner matches', () => {
        const focusOwnerService = new EmbedFocusOwnerService();
        const undoRedoService = { pushUndoRedo: vi.fn() };
        const service = new EmbedUndoBridgeService(focusOwnerService, undoRedoService as never);

        expect(service.pushUndoRedoForChild({ unitID: 'child-1' } as never)).toEqual({
            stackUnitId: 'child-1',
            routedToHost: false,
        });
        focusOwnerService.setFocusOwner({
            hostUnitId: 'host-1',
            embedId: 'embed-1',
            childUnitId: 'child-1',
            childType: UniverInstanceType.UNIVER_SHEET,
            reason: 'pointer',
        });
        expect(service.resolveStackUnitId('child-1')).toBe('host-1');
        expect(service.pushUndoRedoForChild({ unitID: 'child-1' } as never)).toEqual({
            stackUnitId: 'host-1',
            routedToHost: true,
        });
        expect(undoRedoService.pushUndoRedo).toHaveBeenLastCalledWith({ unitID: 'host-1' });
    });

    it('tracks child interaction focus leases by embed id', () => {
        const service = new EmbedRuntimeFocusCoordinator();
        const lease = service.acquireLease({ embedId: 'embed-1', role: 'child-editor', owner: 'cell-editor' });

        expect(service.hasChildInteractionLease('embed-1')).toBe(true);
        expect(service.hasBlockingChildFocusLease('embed-1')).toBe(true);
        expect(service.hasAnyBlockingChildFocusLease()).toBe(true);
        expect(service.hasChildInteractionLease('embed-2')).toBe(false);

        lease.dispose();

        expect(service.hasChildInteractionLease('embed-1')).toBe(false);
        expect(service.hasBlockingChildFocusLease('embed-1')).toBe(false);
        expect(service.hasAnyBlockingChildFocusLease()).toBe(false);
    });

    it('treats a stage2 child session as blocking host focus while preserving child ownership', () => {
        const service = new EmbedRuntimeFocusCoordinator();
        const lease = service.acquireLease({
            embedId: 'embed-1',
            role: 'child-session',
            owner: 'stage2-runtime',
            hostUnitId: 'host-doc',
            childUnitId: 'child-sheet',
        });

        expect(service.hasChildInteractionLease('embed-1')).toBe(true);
        expect(service.hasHostPreservingChildFocusLease('embed-1')).toBe(true);
        expect(service.hasAnyHostPreservingChildFocusLease()).toBe(true);
        expect(service.hasHostPreservingChildFocusLeaseForHost('host-doc')).toBe(true);
        expect(service.hasHostPreservingChildFocusLeaseForHost('child-sheet')).toBe(false);
        expect(service.isChildUnitInActiveSession('child-sheet')).toBe(true);
        expect(service.isChildUnitInActiveSession('host-doc')).toBe(false);
        expect(service.hasBlockingChildFocusLease('embed-1')).toBe(true);
        expect(service.hasAnyBlockingChildFocusLease()).toBe(true);

        lease.dispose();

        expect(service.hasChildInteractionLease('embed-1')).toBe(false);
        expect(service.hasHostPreservingChildFocusLease('embed-1')).toBe(false);
        expect(service.hasAnyHostPreservingChildFocusLease()).toBe(false);
        expect(service.hasHostPreservingChildFocusLeaseForHost('host-doc')).toBe(false);
        expect(service.isChildUnitInActiveSession('child-sheet')).toBe(false);
        expect(service.hasBlockingChildFocusLease('embed-1')).toBe(false);
    });

    it('treats associated editor unit ids as part of the child interaction session', () => {
        const service = new EmbedRuntimeFocusCoordinator();
        const editorRoot = document.createElement('div');
        editorRoot.setAttribute('data-embed-interaction-boundary-owner', 'embed-1');
        document.body.appendChild(editorRoot);
        const lease = service.acquireLease({
            embedId: 'embed-1',
            role: 'child-editor',
            owner: 'sheet-cell-editor',
            hostUnitId: 'host-doc',
            childUnitId: 'child-sheet',
            associatedChildUnitIds: ['__INTERNAL_EDITOR__DOCS_NORMAL'],
        });

        expect(service.isChildUnitInActiveSession('child-sheet')).toBe(true);
        expect(service.isChildUnitInActiveSession('__INTERNAL_EDITOR__DOCS_NORMAL')).toBe(true);
        expect(service.isChildUnitRuntimeEvent('__INTERNAL_EDITOR__DOCS_NORMAL', editorRoot)).toBe(true);
        expect(service.hasHostPreservingChildFocusLeaseForHost('host-doc')).toBe(true);
        expect(service.hasHostPreservingChildFocusLeaseForHost('__INTERNAL_EDITOR__DOCS_NORMAL')).toBe(false);

        lease.dispose();

        expect(service.isChildUnitInActiveSession('__INTERNAL_EDITOR__DOCS_NORMAL')).toBe(false);
        editorRoot.remove();
    });

    it('centralizes host suppression while allowing the active child runtime to keep handling events', () => {
        const service = new EmbedRuntimeFocusCoordinator();
        const childRoot = document.createElement('div');
        childRoot.setAttribute('data-embed-interaction-boundary-owner', 'embed-1');
        const childCanvas = document.createElement('canvas');
        childRoot.appendChild(childCanvas);
        document.body.appendChild(childRoot);
        const scopeDisposable = service.registerRuntimeScope({
            embedId: 'embed-1',
            hostUnitId: 'host-doc',
            childUnitId: 'child-sheet',
        });
        const lease = service.acquireLease({
            embedId: 'embed-1',
            role: 'child-session',
            owner: 'stage2-runtime',
            hostUnitId: 'host-doc',
            childUnitId: 'child-sheet',
        });

        expect(service.shouldSuppressHostInteraction('host-doc')).toBe(true);
        expect(service.shouldSuppressHostInteraction('host-doc', childCanvas)).toBe(true);
        expect(service.shouldSuppressHostInteraction('child-sheet', childCanvas)).toBe(false);
        expect(service.shouldSuppressHostInteraction('other-doc', childCanvas)).toBe(false);

        lease.dispose();
        scopeDisposable.dispose();
        childRoot.remove();
    });

    it('uses registered runtime geometry when the raw event target has no embed owner', () => {
        const service = new EmbedRuntimeFocusCoordinator();
        const childRoot = document.createElement('div');
        const externalTarget = document.createElement('canvas');
        document.body.append(childRoot, externalTarget);
        vi.spyOn(childRoot, 'getBoundingClientRect').mockReturnValue({
            x: 20,
            y: 30,
            left: 20,
            top: 30,
            right: 220,
            bottom: 130,
            width: 200,
            height: 100,
            toJSON: () => ({}),
        } as DOMRect);
        const scopeDisposable = service.registerRuntimeScope({
            embedId: 'embed-1',
            hostUnitId: 'host-doc',
            childUnitId: 'child-sheet',
        });
        const elementDisposable = service.registerElement({
            embedId: 'embed-1',
            role: 'runtime',
            element: childRoot,
        });
        const lease = service.acquireLease({
            embedId: 'embed-1',
            role: 'child-session',
            owner: 'stage2-runtime',
            hostUnitId: 'host-doc',
            childUnitId: 'child-sheet',
        });
        const event = new MouseEvent('pointerdown', { clientX: 80, clientY: 60 });

        expect(service.isChildUnitRuntimeEvent('child-sheet', externalTarget, event)).toBe(true);
        expect(service.shouldSuppressHostInteraction('host-doc', externalTarget, event)).toBe(true);
        expect(service.shouldSuppressHostInteraction('child-sheet', externalTarget, event)).toBe(false);

        lease.dispose();
        elementDisposable.dispose();
        scopeDisposable.dispose();
        childRoot.remove();
        externalTarget.remove();
    });

    it('maps owned runtime DOM events back to their child unit without requiring an active lease', () => {
        const service = new EmbedRuntimeFocusCoordinator();
        const childRoot = document.createElement('div');
        childRoot.setAttribute('data-embed-interaction-boundary-owner', 'embed-doc');
        const childInput = document.createElement('input');
        childRoot.appendChild(childInput);
        document.body.appendChild(childRoot);

        const disposable = service.registerRuntimeScope({
            embedId: 'embed-doc',
            hostUnitId: 'host-sheet',
            childUnitId: 'child-doc',
        });

        expect(service.isChildUnitRuntimeEvent('child-doc', childInput)).toBe(true);
        expect(service.isChildUnitRuntimeEvent('host-sheet', childInput)).toBe(false);
        expect(service.isChildUnitRuntimeEvent('other-doc', childInput)).toBe(false);
        expect(service.isChildUnitInActiveSession('child-doc')).toBe(false);

        disposable.dispose();

        expect(service.isChildUnitRuntimeEvent('child-doc', childInput)).toBe(false);
        childRoot.remove();
    });

    it('resolves the runtime scope registered for a child unit id', () => {
        const service = new EmbedRuntimeFocusCoordinator();
        const disposable = service.registerRuntimeScope({
            embedId: 'embed-sheet',
            hostUnitId: 'host-doc',
            childUnitId: 'child-sheet',
            childType: UniverInstanceType.UNIVER_SHEET,
        });

        expect(service.resolveRuntimeScopeByChildUnitId('child-sheet')).toEqual({
            embedId: 'embed-sheet',
            hostUnitId: 'host-doc',
            childUnitId: 'child-sheet',
            childType: UniverInstanceType.UNIVER_SHEET,
        });
        expect(service.resolveRuntimeScopeByChildUnitId('host-doc')).toBeUndefined();

        disposable.dispose();

        expect(service.resolveRuntimeScopeByChildUnitId('child-sheet')).toBeUndefined();
    });

    it('resolves the currently active child session runtime scope', () => {
        const service = new EmbedRuntimeFocusCoordinator();
        const runtimeScope = service.registerRuntimeScope({
            embedId: 'embed-sheet',
            hostUnitId: 'host-doc',
            childUnitId: 'child-sheet',
            childType: UniverInstanceType.UNIVER_SHEET,
        });
        const runtimeLease = service.acquireLease({
            embedId: 'embed-other',
            role: 'runtime',
            childUnitId: 'child-other',
        });
        const sessionLease = service.acquireLease({
            embedId: 'embed-sheet',
            role: 'child-session',
            owner: 'stage2-runtime',
            hostUnitId: 'host-doc',
            childUnitId: 'child-sheet',
            childType: UniverInstanceType.UNIVER_SHEET,
        });

        expect(service.resolveActiveChildSessionRuntimeScope()).toEqual({
            embedId: 'embed-sheet',
            hostUnitId: 'host-doc',
            childUnitId: 'child-sheet',
            childType: UniverInstanceType.UNIVER_SHEET,
        });

        sessionLease.dispose();

        expect(service.resolveActiveChildSessionRuntimeScope()).toBeUndefined();

        runtimeLease.dispose();
        runtimeScope.dispose();
    });

    it('registers child interaction elements by embed id', () => {
        const service = new EmbedRuntimeFocusCoordinator();
        const editorRoot = document.createElement('div');
        const editorChild = document.createElement('button');
        editorRoot.appendChild(editorChild);
        document.body.appendChild(editorRoot);

        const disposable = service.registerElement({
            embedId: 'embed-1',
            role: 'child-editor',
            element: editorRoot,
        });

        expect(service.containsElement('embed-1', editorChild)).toBe(true);
        expect(service.containsElement('embed-2', editorChild)).toBe(false);

        disposable.dispose();

        expect(service.containsElement('embed-1', editorChild)).toBe(false);
        editorRoot.remove();
    });

    it('treats focus inside registered child elements as a child interaction lease', () => {
        const service = new EmbedRuntimeFocusCoordinator();
        const editorInput = document.createElement('input');
        document.body.appendChild(editorInput);
        const disposable = service.registerElement({
            embedId: 'embed-1',
            role: 'child-editor',
            element: editorInput,
        });

        editorInput.focus();

        expect(service.hasChildInteractionLease('embed-1')).toBe(true);

        disposable.dispose();
        editorInput.remove();
    });

    it('treats focus inside embed-owned portal elements as a child interaction lease', () => {
        const service = new EmbedRuntimeFocusCoordinator();
        const editorContainer = document.createElement('div');
        editorContainer.setAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, 'embed-1');
        const editorInput = document.createElement('input');
        editorContainer.appendChild(editorInput);
        document.body.appendChild(editorContainer);

        editorInput.focus();

        expect(service.containsElement('embed-1', editorInput)).toBe(true);
        expect(service.hasChildInteractionLease('embed-1')).toBe(true);
        expect(service.hasAnyBlockingChildFocusLease()).toBe(false);
        expect(service.hasChildInteractionLease('embed-2')).toBe(false);

        editorContainer.remove();
    });

    it('treats an active embed-owned child popup as a global blocking focus lease', () => {
        const service = new EmbedRuntimeFocusCoordinator();
        const popupContainer = document.createElement('div');
        popupContainer.setAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, 'embed-1');
        popupContainer.setAttribute('data-embed-runtime-focus-role', 'child-popup');
        const popupInput = document.createElement('input');
        popupInput.setAttribute('data-embed-runtime-focus-role', 'child-popup');
        popupContainer.appendChild(popupInput);
        document.body.appendChild(popupContainer);

        popupInput.focus();

        expect(service.hasAnyChildInteractionLease()).toBe(true);
        expect(service.hasAnyBlockingChildFocusLease()).toBe(true);

        popupContainer.remove();
    });

    it('treats an active embed-owned child editor as a global blocking focus lease', () => {
        const service = new EmbedRuntimeFocusCoordinator();
        const editorContainer = document.createElement('div');
        editorContainer.setAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, 'embed-1');
        editorContainer.setAttribute('data-embed-runtime-focus-role', 'child-editor');
        const editorInput = document.createElement('input');
        editorInput.setAttribute('data-embed-runtime-focus-role', 'child-editor');
        editorContainer.appendChild(editorInput);
        document.body.appendChild(editorContainer);

        editorInput.focus();

        expect(service.hasAnyChildInteractionLease()).toBe(true);
        expect(service.hasAnyBlockingChildFocusLease()).toBe(true);
        expect(service.hasAnyHostPreservingChildFocusLease()).toBe(true);

        editorContainer.remove();
    });

    it('cleans host anchor records when host units dispose', () => {
        const disposedSubjects = new Map<UniverInstanceType, Subject<{ getUnitId: () => string }>>();
        const instanceService = {
            getTypeOfUnitDisposed$: vi.fn((type: UniverInstanceType) => {
                const subject = new Subject<{ getUnitId: () => string }>();
                disposedSubjects.set(type, subject);
                return subject;
            }),
        };
        const anchorModel = new EmbedHostAnchorModelService();
        anchorModel.setAnchor({
            hostUnitId: 'host-1',
            hostAnchorId: 'anchor-1',
            embedId: 'embed-1',
            hostType: UniverInstanceType.UNIVER_DOC,
            entry: 'docs-custom-block',
            kind: 'docs-custom-block',
        });
        const controller = new EmbedHostAnchorCleanupController(instanceService as never, anchorModel);

        disposedSubjects.get(UniverInstanceType.UNIVER_DOC)?.next({ getUnitId: () => 'host-1' });

        expect(anchorModel.listAnchors('host-1')).toEqual([]);
        controller.dispose();
    });

    it('activates and clears ribbon overrides from menu override state', () => {
        const menuOverrideService = new EmbedHostMenuOverrideService();
        const blockRegistry = new EmbedBlockRegistryService();
        const ribbonDisposable = { dispose: vi.fn() };
        const ribbonOverrideService = {
            activate: vi.fn(),
            clear: vi.fn(),
        };
        blockRegistry.register({
            childType: UniverInstanceType.UNIVER_SHEET,
            productName: 'Sheets',
            createRibbonOverride: vi.fn(() => ({
                ribbonService: 'ribbon-service' as never,
                placeholderTitle: 'Sheets',
                hideToolbar: true,
                disposable: ribbonDisposable,
            })),
        });
        const controller = new EmbedHostRibbonOverrideController(
            menuOverrideService,
            blockRegistry,
            ribbonOverrideService as never,
            {} as never
        );
        const descriptor = {
            embedId: 'embed-1',
            hostUnitId: 'host-1',
            hostType: UniverInstanceType.UNIVER_DOC,
            hostAnchorId: 'anchor-1',
            entry: 'docs-custom-block',
            childUnitId: 'child-1',
            childType: UniverInstanceType.UNIVER_SHEET,
            source: {
                kind: 'ref',
                ref: { file: { kind: 'self' }, unit: { selector: 'child-1', type: 'sheet' } },
            },
            mode: 'interactive',
            sourceMeta: {
                floating: false,
                tab: {
                    enabled: true,
                    container: 'sheet-tab',
                    replaceHostMenu: true,
                    hideHostFxBar: true,
                    lockHostRibbon: true,
                },
            },
            lifecycle: 'active',
        };

        menuOverrideService.activate(descriptor as never, 'tab-active', { allowPlaceholder: true });
        expect(ribbonOverrideService.activate).toHaveBeenCalledWith({
            id: 'embed-1',
            ribbonService: 'ribbon-service',
            placeholderTitle: 'Sheets',
            hideToolbar: true,
        });
        menuOverrideService.clear('embed-1');
        expect(ribbonOverrideService.clear).toHaveBeenCalledWith('embed-1');
        expect(ribbonDisposable.dispose).toHaveBeenCalled();
        controller.dispose();

        const emptyController = new EmbedHostRibbonOverrideController(
            new EmbedHostMenuOverrideService(),
            new EmbedBlockRegistryService(),
            ribbonOverrideService as never,
            {} as never
        );
        emptyController.dispose();
    });
});
