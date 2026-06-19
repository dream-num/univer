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

import { UniverInstanceType } from '@univerjs/core';
import { EmbedFocusOwnerService } from '@univerjs/embed';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { getEmbedHostChromePolicy } from '../common/embed-host-chrome-policy';
import { getEmbedTabPeerHostHeaderMode, getEmbedTabPeerWorkbenchRole, isEmbedTabPeerEntry } from '../common/tab-peer-workbench';
import { EmbedHostAnchorCleanupController } from '../controllers/embed-host-anchor-cleanup.controller';
import { EmbedHostRibbonOverrideController } from '../controllers/embed-host-ribbon-override.controller';
import { EmbedBlockRegistryService } from './embed-block-registry.service';
import { EmbedFloatingActiveService } from './embed-floating-active.service';
import { EmbedHostAnchorModelService } from './embed-host-anchor-model.service';
import { EmbedHostMenuOverrideService } from './embed-host-menu-override.service';
import { EmbedUndoBridgeService } from './embed-undo-bridge.service';

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
