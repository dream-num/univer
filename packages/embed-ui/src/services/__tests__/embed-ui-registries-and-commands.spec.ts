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

import type { IAccessor, Injector } from '@univerjs/core';
import type { IEmbedDescriptor } from '@univerjs/embed';
import { toDisposable, UniverInstanceType } from '@univerjs/core';
import {
    CopyEmbedCommand,
    CreateEmbedCommand,
    CreateEmbedHostAnchorMutation,
    EmbedHostAdapterRegistryService,
    EmbedHostAnchorModelService,
    EmbedHostLifecycleService,
    EmbedUnitLeasePolicyService,
    RemoveEmbedCommand,
    RemoveEmbedHostAnchorMutation,
    RemoveEmbedHostAnchorRecordMutation,
    SetEmbedHostAnchorRecordMutation,
} from '@univerjs/embed';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import {
    CREATE_EMBED_HOST_ANCHOR_MUTATION_ID,
    REMOVE_EMBED_HOST_ANCHOR_MUTATION_ID,
    REMOVE_EMBED_HOST_ANCHOR_RECORD_MUTATION_ID,
    SET_EMBED_HOST_ANCHOR_RECORD_MUTATION_ID,
} from '../../common/const';
import {
    EMBED_CANVAS_ROOT_ATTRIBUTE,
    EMBED_CONTENT_ROOT_ATTRIBUTE,
    EMBED_FOOTER_SLOT_ATTRIBUTE,
    EMBED_MENU_SLOT_ATTRIBUTE,
    EMBED_OVERLAY_ROOT_ATTRIBUTE,
    EMBED_POPUP_ROOT_ATTRIBUTE,
    ensureEmbedDefaultRuntimeSlots,
} from '../../common/embed-runtime-slots';
import { UniverEmbedUIPlugin } from '../../plugin';
import { EmbedBlockRegistryService } from '../embed-block-registry.service';
import { EmbedChildProductPluginRegistryService, registerEmbedChildProductPluginContribution } from '../embed-child-product-plugin-registry.service';
import { createEmbedChildRuntimeScope } from '../embed-child-runtime-scope';
import { EmbedChildViewRegistryService } from '../embed-child-view-registry.service';
import { EmbedFloatingMenuRegistryService } from '../embed-floating-menu-registry.service';
import { EmbedFullscreenService } from '../embed-fullscreen.service';
import { EmbedHostContainerRegistryService } from '../embed-host-container-registry.service';
import { EmbedHostMenuOverrideService } from '../embed-host-menu-override.service';
import { EmbedHostRestoreService } from '../embed-host-restore.service';
import { EmbedOverlayRootService } from '../embed-overlay-root.service';
import { EmbedProductMenuRegistryService, flushPendingEmbedProductMenuContributions, registerEmbedProductMenuContribution } from '../embed-product-menu-registry.service';
import { EmbedReadonlyPreviewRegistryService } from '../embed-readonly-preview-registry.service';

describe('embed-ui registries and commands', () => {
    it('manages host adapter contributions and rejects missing create adapters', () => {
        const service = new EmbedHostAdapterRegistryService();
        const descriptor = createDescriptor();
        const contribution = {
            hostType: UniverInstanceType.UNIVER_SHEET,
            entry: 'sheets-sheet-tab' as const,
            createAnchor: vi.fn(() => 'custom-anchor'),
            createAnchorPlan: vi.fn(() => ({ hostAnchorId: 'planned', redoMutations: [], undoMutations: [] })),
            removeAnchorPlan: vi.fn(() => ({ redoMutations: [], undoMutations: [] })),
            removeAnchor: vi.fn(),
            afterCreateAnchor: vi.fn(),
            afterRemoveAnchor: vi.fn(),
            activateAnchor: vi.fn(),
            restoreAnchor: vi.fn(() => ({
                embedId: 'embed-1',
                entry: 'sheets-sheet-tab' as const,
                hostAnchorId: 'anchor-1',
                hostType: UniverInstanceType.UNIVER_SHEET,
                hostUnitId: 'host-1',
                kind: 'sheets-sheet-tab' as const,
            })),
        };

        service.register(contribution);
        expect(() => service.register(contribution)).toThrow('already registered');
        expect(service.get(UniverInstanceType.UNIVER_SHEET, 'sheets-sheet-tab')).toBe(contribution);
        expect(service.list()).toEqual([contribution]);
        expect(service.createAnchor({
            embedId: 'embed-1',
            hostUnitId: 'host-1',
            hostType: UniverInstanceType.UNIVER_SHEET,
            entry: 'sheets-sheet-tab',
        })).toBe('custom-anchor');
        expect(service.createAnchorPlan({
            embedId: 'embed-1',
            hostUnitId: 'host-1',
            hostType: UniverInstanceType.UNIVER_SHEET,
            entry: 'sheets-sheet-tab',
            descriptor,
        }).hostAnchorId).toBe('planned');
        expect(service.removeAnchorPlan({
            embedId: 'embed-1',
            hostUnitId: 'host-1',
            hostType: UniverInstanceType.UNIVER_SHEET,
            entry: 'sheets-sheet-tab',
            hostAnchorId: 'anchor-1',
            descriptor,
        }).redoMutations).toEqual([]);
        service.removeAnchor({
            embedId: 'embed-1',
            hostUnitId: 'host-1',
            hostType: UniverInstanceType.UNIVER_SHEET,
            entry: 'sheets-sheet-tab',
            hostAnchorId: 'anchor-1',
        });
        service.afterCreateAnchor({
            embedId: 'embed-1',
            hostUnitId: 'host-1',
            hostType: UniverInstanceType.UNIVER_SHEET,
            entry: 'sheets-sheet-tab',
            hostAnchorId: 'anchor-1',
            descriptor,
        });
        service.afterRemoveAnchor({
            embedId: 'embed-1',
            hostUnitId: 'host-1',
            hostType: UniverInstanceType.UNIVER_SHEET,
            entry: 'sheets-sheet-tab',
            hostAnchorId: 'anchor-1',
            descriptor,
        });
        service.activateAnchor({
            embedId: 'embed-1',
            hostUnitId: 'host-1',
            hostType: UniverInstanceType.UNIVER_SHEET,
            entry: 'sheets-sheet-tab',
            hostAnchorId: 'anchor-1',
            descriptor,
        });
        expect(service.restoreAnchor({
            embedId: 'embed-1',
            hostUnitId: 'host-1',
            hostType: UniverInstanceType.UNIVER_SHEET,
            entry: 'sheets-sheet-tab',
            hostAnchorId: 'anchor-1',
            descriptor,
        })).toMatchObject({ hostAnchorId: 'anchor-1' });

        expect(() => service.createAnchorPlan({
            embedId: 'fallback',
            hostUnitId: 'host-1',
            hostType: UniverInstanceType.UNIVER_DOC,
            entry: 'docs-custom-block',
        })).toThrow('EMBED_HOST_ADAPTER_NOT_REGISTERED');
        service.register({
            hostType: UniverInstanceType.UNIVER_DOC,
            entry: 'docs-custom-block',
        } as never);
        expect(() => service.createAnchor({
            embedId: 'fallback',
            hostUnitId: 'host-1',
            hostType: UniverInstanceType.UNIVER_DOC,
            entry: 'docs-custom-block',
        })).toThrow('EMBED_HOST_ADAPTER_CREATE_ANCHOR_NOT_IMPLEMENTED');
        expect(() => service.createAnchorPlan({
            embedId: 'fallback',
            hostUnitId: 'host-1',
            hostType: UniverInstanceType.UNIVER_DOC,
            entry: 'docs-custom-block',
        })).toThrow('EMBED_HOST_ADAPTER_CREATE_ANCHOR_NOT_IMPLEMENTED');
        expect(() => service.restoreAnchor({
            embedId: 'fallback',
            hostUnitId: 'host-1',
            hostType: UniverInstanceType.UNIVER_DOC,
            entry: 'docs-custom-block',
            hostAnchorId: 'fallback-anchor',
            descriptor,
        })).toThrow('EMBED_HOST_ADAPTER_RESTORE_ANCHOR_NOT_IMPLEMENTED');
        expect(service.removeAnchorPlan({
            embedId: 'fallback',
            hostUnitId: 'host-1',
            hostType: UniverInstanceType.UNIVER_DOC,
            entry: 'docs-custom-block',
            hostAnchorId: 'fallback-anchor',
        })).toEqual({
            redoMutations: [{ id: REMOVE_EMBED_HOST_ANCHOR_MUTATION_ID, params: expect.any(Object) }],
            undoMutations: [{ id: CREATE_EMBED_HOST_ANCHOR_MUTATION_ID, params: expect.any(Object) }],
        });
    });

    it('materializes refs before restoring descriptors and host anchor records', async () => {
        const descriptor = createDescriptor({
            hostAnchorId: 'anchor-1',
            hostUnitId: 'host-1',
            childUnitId: undefined,
        });
        const restoredDescriptor = {
            ...descriptor,
            childUnitId: 'runtime-sheet',
            childType: UniverInstanceType.UNIVER_SHEET,
        };
        const model = {
            addDescriptor: vi.fn(),
            getDescriptor: vi.fn(() => restoredDescriptor),
        };
        const adapter = {
            restoreAnchor: vi.fn(() => ({
                embedId: descriptor.embedId,
                entry: descriptor.entry,
                hostAnchorId: descriptor.hostAnchorId,
                hostType: descriptor.hostType,
                hostUnitId: descriptor.hostUnitId,
                kind: 'docs-custom-block' as const,
            })),
        };
        const anchorModel = {
            setAnchor: vi.fn(),
        };
        const materializeService = {
            materializeDescriptor: vi.fn(),
        };
        const service = new EmbedHostRestoreService(
            model as never,
            materializeService as never,
            adapter as never,
            anchorModel as never
        );

        await expect(service.restoreEmbed({ descriptor, hostContext: { restored: true } })).resolves.toBe(restoredDescriptor);
        expect(materializeService.materializeDescriptor).not.toHaveBeenCalled();
        expect(adapter.restoreAnchor).toHaveBeenCalledWith(expect.objectContaining({
            descriptor,
            hostAnchorId: 'anchor-1',
            hostContext: { restored: true },
        }));
        expect(model.addDescriptor).toHaveBeenCalledWith('host-1', descriptor);
        expect(anchorModel.setAnchor).toHaveBeenCalledWith(expect.objectContaining({
            hostAnchorId: 'anchor-1',
        }));
    });

    it('materializes descriptor refs without restoring host anchors', async () => {
        const descriptor = createDescriptor({
            hostAnchorId: 'anchor-1',
            hostUnitId: 'host-1',
            childUnitId: undefined,
        });
        const materializedDescriptor = {
            ...descriptor,
            childUnitId: 'runtime-sheet',
            childType: UniverInstanceType.UNIVER_SHEET,
        };
        const model = {
            addDescriptor: vi.fn(),
            getDescriptor: vi.fn()
                .mockReturnValueOnce(undefined)
                .mockReturnValue(materializedDescriptor),
        };
        const adapter = {
            restoreAnchor: vi.fn(),
        };
        const anchorModel = {
            setAnchor: vi.fn(),
        };
        const materializeService = {
            materializeDescriptor: vi.fn(() => Promise.resolve(materializedDescriptor)),
        };
        const service = new EmbedHostRestoreService(
            model as never,
            materializeService as never,
            adapter as never,
            anchorModel as never
        );

        await expect(service.materializeDescriptor({ descriptor })).resolves.toBe(materializedDescriptor);
        expect(materializeService.materializeDescriptor).toHaveBeenCalledWith({ descriptor });
        expect(model.addDescriptor).not.toHaveBeenCalled();
        expect(adapter.restoreAnchor).not.toHaveBeenCalled();
        expect(anchorModel.setAnchor).not.toHaveBeenCalled();
    });

    it('reuses an already loaded descriptor when materializing tab descriptors', async () => {
        const descriptor = createDescriptor({
            childUnitId: 'runtime-sheet',
        });
        const model = {
            addDescriptor: vi.fn(),
            getDescriptor: vi.fn(() => descriptor),
        };
        const materializeService = {
            materializeDescriptor: vi.fn(() => Promise.resolve(descriptor)),
        };
        const service = new EmbedHostRestoreService(
            model as never,
            materializeService as never,
            { restoreAnchor: vi.fn() } as never,
            { setAnchor: vi.fn() } as never
        );

        await expect(service.materializeDescriptor({ descriptor })).resolves.toBe(descriptor);
        expect(materializeService.materializeDescriptor).toHaveBeenCalledWith({ descriptor });
    });

    it('rejects materialized child units that are not loaded in the current runtime', async () => {
        const descriptor = createDescriptor({
            childUnitId: 'unloaded-runtime-sheet',
        });
        const model = {
            addDescriptor: vi.fn(),
            getDescriptor: vi.fn(() => descriptor),
        };
        const materializeService = {
            materializeDescriptor: vi.fn(() => Promise.reject(new Error('EMBED_MATERIALIZED_CHILD_UNIT_NOT_LOADED'))),
        };
        const service = new EmbedHostRestoreService(
            model as never,
            materializeService as never,
            { restoreAnchor: vi.fn() } as never,
            { setAnchor: vi.fn() } as never
        );

        await expect(service.materializeDescriptor({ descriptor })).rejects.toThrow('EMBED_MATERIALIZED_CHILD_UNIT_NOT_LOADED');
        expect(materializeService.materializeDescriptor).toHaveBeenCalledWith({ descriptor });
    });

    it('tracks host anchors and simple registries', () => {
        const anchorModel = new EmbedHostAnchorModelService();
        const record = {
            hostUnitId: 'host-1',
            hostAnchorId: 'anchor-1',
            embedId: 'embed-1',
            entry: 'docs-custom-block' as const,
            kind: 'docs-custom-block' as const,
            hostType: UniverInstanceType.UNIVER_DOC,
        };
        anchorModel.setAnchor(record);
        expect(anchorModel.getAnchor('host-1', 'anchor-1')).toMatchObject({ lifecycle: 'active' });
        expect(anchorModel.listAnchors('host-1')).toHaveLength(1);
        anchorModel.removeAnchor('host-1', 'missing');
        anchorModel.removeAnchor('host-1', 'anchor-1');
        expect(anchorModel.getAnchor('host-1', 'anchor-1')?.lifecycle).toBe('removed');
        anchorModel.clearUnit('host-1');
        expect(anchorModel.listAnchors('host-1')).toEqual([]);

        const block = new EmbedBlockRegistryService();
        const blockContribution = { childType: UniverInstanceType.UNIVER_DOC };
        const blockDisposable = block.register(blockContribution as never);
        expect(block.get(UniverInstanceType.UNIVER_DOC)).toBe(blockContribution);
        expect(block.list()).toEqual([blockContribution]);
        blockDisposable.dispose();
        expect(block.list()).toEqual([]);

        const childView = new EmbedChildViewRegistryService();
        childView.register({ childType: UniverInstanceType.UNIVER_SHEET } as never);
        expect(() => childView.register({ childType: UniverInstanceType.UNIVER_SHEET } as never)).toThrow('already registered');
        expect(childView.get(UniverInstanceType.UNIVER_SHEET)).toBeDefined();

        const readonlyPreview = new EmbedReadonlyPreviewRegistryService();
        readonlyPreview.register({ childType: UniverInstanceType.UNIVER_SLIDE } as never);
        expect(() => readonlyPreview.register({ childType: UniverInstanceType.UNIVER_SLIDE } as never)).toThrow('already registered');
        expect(readonlyPreview.list()).toHaveLength(1);
    });

    it('checks host container support and overlay roots', () => {
        const containers = new EmbedHostContainerRegistryService();
        const contribution = {
            hostType: UniverInstanceType.UNIVER_DOC,
            entry: 'docs-custom-block',
            layout: 'doc-width-scale',
            supportedLayouts: ['doc-width-scale', 'fixed-ratio'],
        };
        containers.register(contribution as never);
        expect(() => containers.register(contribution as never)).toThrow('already registered');
        expect(containers.supports(UniverInstanceType.UNIVER_DOC, 'docs-custom-block', 'fixed-ratio' as never)).toBe(true);
        expect(containers.supports(UniverInstanceType.UNIVER_DOC, 'docs-custom-block', 'scroll-contained' as never)).toBe(false);
        expect(containers.supports(UniverInstanceType.UNIVER_SHEET, 'docs-custom-block', 'fixed-ratio' as never)).toBe(false);

        const overlays = new EmbedOverlayRootService();
        const root = document.createElement('div');
        const child = document.createElement('span');
        root.appendChild(child);
        const disposable = overlays.register({
            childUnitId: 'child-1',
            embedId: 'embed-1',
            hostAnchorId: 'anchor-1',
            root,
        });

        expect(overlays.get('child-1')).toBe(root);
        expect(overlays.getByEmbedId('embed-1')).toBe(root);
        expect(overlays.getByHostAnchorId('anchor-1')).toBe(root);
        expect(overlays.contains(child, { childUnitId: 'child-1' })).toBe(true);
        expect(overlays.contains(child, { embedId: 'embed-1' })).toBe(true);
        expect(overlays.contains(child, { hostAnchorId: 'anchor-1' })).toBe(true);
        expect(overlays.contains(null, { embedId: 'embed-1' })).toBe(false);
        disposable.dispose();
        expect(overlays.get('child-1')).toBeNull();
    });

    it('activates menu override and fullscreen sessions only for supported descriptors', () => {
        const menuOverride = new EmbedHostMenuOverrideService();
        const tabDescriptor = createDescriptor({
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
        });

        expect(() => menuOverride.activate({ ...tabDescriptor, childUnitId: undefined }, 'tab-active')).toThrow('CHILD_NOT_RESOLVED');
        expect(() => menuOverride.activate(createDescriptor(), 'float-active' as never)).toThrow('UNSUPPORTED_REASON');
        expect(menuOverride.activate(tabDescriptor, 'tab-active', { layoutPolicy: { ribbon: 'child' } as never })).toBeNull();
        const override = menuOverride.activate(tabDescriptor, 'tab-active', { allowPlaceholder: true });
        expect(override).toMatchObject({ embedId: 'embed-1', childUnitId: 'child-1', hideHostFxBar: true });
        menuOverride.clear('other');
        expect(menuOverride.getOverride()).toBe(override);
        menuOverride.clear('embed-1');
        expect(menuOverride.getOverride()).toBeNull();

        expect(() => menuOverride.activate(createDescriptor(), 'float-stage2' as never)).toThrow('UNSUPPORTED_REASON');

        const fullscreen = new EmbedFullscreenService();
        const exited: unknown[] = [];
        fullscreen.exited$.subscribe((session) => exited.push(session));
        expect(() => fullscreen.enter({ ...createDescriptor(), childUnitId: undefined })).toThrow('CHILD_NOT_RESOLVED');
        expect(() => fullscreen.enter(tabDescriptor)).toThrow('TAB_NOT_SUPPORTED');
        expect(() => fullscreen.enter({ ...createDescriptor(), sourceMeta: { floating: true as never, tab: false } })).toThrow('LAYOUT_NOT_RESOLVED');
        const session = fullscreen.enter(createDescriptor());
        expect(fullscreen.getSession()).toEqual(session);
        fullscreen.exit('other');
        expect(fullscreen.getSession()).toEqual(session);
        fullscreen.notifyExited(session);
        expect(exited).toEqual([session]);
        fullscreen.exit('embed-1');
        expect(fullscreen.getSession()).toBeNull();
    });

    it('executes embed commands and host anchor mutations through their services', () => {
        const descriptor = createDescriptor();
        const lifecycle = {
            createEmbed: vi.fn(() => descriptor),
            copyEmbed: vi.fn(() => ({ ...descriptor, embedId: 'copy' })),
            removeEmbed: vi.fn(() => true),
        };
        const adapter = {
            createAnchor: vi.fn(() => 'anchor-1'),
            removeAnchor: vi.fn(),
        };
        const anchorModel = {
            setAnchor: vi.fn(),
            removeAnchor: vi.fn(),
        };
        const accessor = createAccessor([
            [EmbedHostLifecycleService, lifecycle],
            [EmbedHostAdapterRegistryService, adapter],
            [EmbedHostAnchorModelService, anchorModel],
        ]);

        expect(CreateEmbedCommand.handler(accessor, { embedId: 'embed-1' } as never)).toBe(descriptor);
        expect(CopyEmbedCommand.handler(accessor, { sourceEmbedId: 'embed-1' } as never)).toMatchObject({ embedId: 'copy' });
        expect(RemoveEmbedCommand.handler(accessor, { embedId: 'embed-1' } as never)).toBe(true);
        expect(CreateEmbedCommand.handler(accessor, undefined)).toBe(false);
        expect(CopyEmbedCommand.handler(accessor, undefined)).toBe(false);
        expect(RemoveEmbedCommand.handler(accessor, undefined)).toBe(false);

        const mutationParams = {
            embedId: 'embed-1',
            hostUnitId: 'host-1',
            hostType: UniverInstanceType.UNIVER_DOC,
            entry: 'docs-custom-block' as const,
            hostAnchorId: 'anchor-1',
        };
        expect(CreateEmbedHostAnchorMutation.handler(accessor, mutationParams)).toBe(true);
        adapter.createAnchor.mockReturnValueOnce('different-anchor');
        expect(() => CreateEmbedHostAnchorMutation.handler(accessor, mutationParams)).toThrow('RESTORE_MISMATCH');
        expect(CreateEmbedHostAnchorMutation.handler(accessor, undefined)).toBe(false);
        expect(RemoveEmbedHostAnchorMutation.handler(accessor, mutationParams)).toBe(true);
        expect(RemoveEmbedHostAnchorMutation.handler(accessor, undefined)).toBe(false);

        expect(SetEmbedHostAnchorRecordMutation.handler(accessor, {
            record: {
                hostUnitId: 'host-1',
                hostAnchorId: 'anchor-1',
                embedId: 'embed-1',
                entry: 'docs-custom-block',
                kind: 'docs-custom-block',
                hostType: UniverInstanceType.UNIVER_DOC,
            },
        })).toBe(true);
        expect(SetEmbedHostAnchorRecordMutation.handler(accessor, undefined)).toBe(false);
        expect(RemoveEmbedHostAnchorRecordMutation.handler(accessor, { hostUnitId: 'host-1', hostAnchorId: 'anchor-1' })).toBe(true);
        expect(RemoveEmbedHostAnchorRecordMutation.handler(accessor, undefined)).toBe(false);

        expect(CreateEmbedHostAnchorMutation.id).toBe(CREATE_EMBED_HOST_ANCHOR_MUTATION_ID);
        expect(RemoveEmbedHostAnchorMutation.id).toBe(REMOVE_EMBED_HOST_ANCHOR_MUTATION_ID);
        expect(SetEmbedHostAnchorRecordMutation.id).toBe(SET_EMBED_HOST_ANCHOR_RECORD_MUTATION_ID);
        expect(RemoveEmbedHostAnchorRecordMutation.id).toBe(REMOVE_EMBED_HOST_ANCHOR_RECORD_MUTATION_ID);
    });

    it('coordinates host lifecycle mutations and undo redo as one transaction', () => {
        const descriptor = createDescriptor();
        const persistedDescriptor = { ...descriptor };
        // childUnitId is a runtime materialization result and must not be persisted by create/copy mutations.
        delete persistedDescriptor.childUnitId;
        const copiedDescriptor = createDescriptor({ embedId: 'copy', hostAnchorId: 'copy-anchor' });
        const persistedCopiedDescriptor = { ...copiedDescriptor };
        delete persistedCopiedDescriptor.childUnitId;
        const store = new Map<string, IEmbedDescriptor>([[`${descriptor.hostUnitId}:${descriptor.embedId}`, descriptor]]);
        const creationService = {
            prepareCreateEmbed: vi.fn(() => ({ descriptor })),
            prepareCopyEmbed: vi.fn(() => copiedDescriptor),
        };
        const modelService = {
            getDescriptor: vi.fn((hostUnitId: string, embedId: string) => store.get(`${hostUnitId}:${embedId}`)),
        };
        const adapter = {
            createAnchorPlan: vi.fn((context: { requestedAnchorId?: string; embedId: string }) => ({
                hostAnchorId: context.requestedAnchorId ?? `${context.embedId}-anchor`,
                redoMutations: [{ id: `create-anchor:${context.embedId}`, params: context }],
                undoMutations: [{ id: `remove-anchor:${context.embedId}`, params: context }],
            })),
            removeAnchorPlan: vi.fn((context: { embedId: string }) => ({
                redoMutations: [{ id: `remove-anchor:${context.embedId}`, params: context }],
                undoMutations: [{ id: `create-anchor:${context.embedId}`, params: context }],
            })),
            afterCreateAnchor: vi.fn(() => {
                throw new Error('render hook should not fail commit');
            }),
            afterRemoveAnchor: vi.fn(() => {
                throw new Error('render hook should not fail commit');
            }),
        };
        const commandService = {
            syncExecuteCommand: vi.fn((id: string, params: { unitId?: string; descriptor?: IEmbedDescriptor; embedId?: string }) => {
                if (id === 'embed.mutation.set-descriptor') {
                    if (!params?.unitId || !params.descriptor) {
                        return false;
                    }

                    store.set(`${params.unitId}:${params.descriptor.embedId}`, params.descriptor);
                }

                if (id === 'embed.mutation.soft-delete-descriptor') {
                    if (!params?.unitId || !params.embedId) {
                        return false;
                    }

                    const current = store.get(`${params.unitId}:${params.embedId}`);
                    if (current) {
                        store.set(`${params.unitId}:${params.embedId}`, { ...current, lifecycle: 'soft-deleted' });
                    }
                }

                return true;
            }),
        };
        const undoRedoService = { pushUndoRedo: vi.fn() };
        const service = new EmbedHostLifecycleService(
            creationService as never,
            modelService as never,
            {} as never,
            adapter as never,
            commandService as never,
            undoRedoService as never
        );

        expect(service.createEmbed({
            embedId: 'embed-1',
            hostUnitId: 'host-1',
            hostType: UniverInstanceType.UNIVER_DOC,
            requestedHostAnchorId: 'anchor-1',
            entry: 'docs-custom-block',
            source: descriptor.source,
            hostContext: { x: 1 },
        })).toEqual(persistedDescriptor);
        expect(adapter.createAnchorPlan).toHaveBeenCalledTimes(2);
        expect(undoRedoService.pushUndoRedo).toHaveBeenLastCalledWith(expect.objectContaining({
            unitID: 'host-1',
            redoMutations: expect.arrayContaining([
                expect.objectContaining({ id: 'create-anchor:embed-1' }),
                expect.objectContaining({
                    id: 'embed.mutation.set-descriptor',
                    params: expect.objectContaining({ unitId: 'host-1', descriptor: persistedDescriptor }),
                }),
            ]),
            undoMutations: expect.arrayContaining([
                expect.objectContaining({
                    id: 'embed.mutation.soft-delete-descriptor',
                    params: expect.objectContaining({ unitId: 'host-1', embedId: 'embed-1' }),
                }),
                expect.objectContaining({ id: 'remove-anchor:embed-1' }),
            ]),
        }));
        expect(adapter.afterCreateAnchor).toHaveBeenCalled();

        expect(service.copyEmbed({
            hostUnitId: 'host-1',
            sourceEmbedId: 'embed-1',
            nextEmbedId: 'copy',
            requestedHostAnchorId: 'copy-anchor',
        })).toEqual(persistedCopiedDescriptor);
        expect(service.removeEmbed({ hostUnitId: 'host-1', embedId: 'copy' })).toBe(true);
        expect(undoRedoService.pushUndoRedo).toHaveBeenLastCalledWith(expect.objectContaining({
            unitID: 'host-1',
            redoMutations: expect.arrayContaining([
                expect.objectContaining({
                    id: 'embed.mutation.soft-delete-descriptor',
                    params: expect.objectContaining({ unitId: 'host-1', embedId: 'copy' }),
                }),
            ]),
            undoMutations: expect.arrayContaining([
                expect.objectContaining({
                    id: 'embed.mutation.set-descriptor',
                    params: expect.objectContaining({ unitId: 'host-1' }),
                }),
            ]),
        }));
        expect(adapter.afterRemoveAnchor).toHaveBeenCalled();
        expect(service.removeEmbed({ hostUnitId: 'host-1', embedId: 'missing' })).toBe(false);

        commandService.syncExecuteCommand.mockReturnValueOnce(false);
        expect(() => service.createEmbed({
            embedId: 'failed',
            hostUnitId: 'host-1',
            hostType: UniverInstanceType.UNIVER_DOC,
            entry: 'docs-custom-block',
            source: descriptor.source,
        })).toThrow('EMBED_HOST_LIFECYCLE_MUTATION_FAILED:create-anchor:failed');
    });

    it('does not execute host mutations when create preparation fails', () => {
        const descriptor = createDescriptor();
        const creationService = {
            prepareCreateEmbed: vi.fn(() => {
                throw new Error('PROVIDER_UNSUPPORTED');
            }),
        };
        const adapter = {
            createAnchorPlan: vi.fn((context: { requestedAnchorId?: string; embedId: string }) => ({
                hostAnchorId: context.requestedAnchorId ?? `${context.embedId}-anchor`,
                redoMutations: [{ id: `create-anchor:${context.embedId}`, params: context }],
                undoMutations: [{ id: `remove-anchor:${context.embedId}`, params: context }],
            })),
        };
        const commandService = { syncExecuteCommand: vi.fn() };
        const undoRedoService = { pushUndoRedo: vi.fn() };
        const service = new EmbedHostLifecycleService(
            creationService as never,
            {} as never,
            {} as never,
            adapter as never,
            commandService as never,
            undoRedoService as never
        );

        expect(() => service.createEmbed({
            embedId: 'embed-1',
            hostUnitId: 'host-1',
            hostType: UniverInstanceType.UNIVER_DOC,
            entry: 'docs-custom-block',
            source: descriptor.source,
        })).toThrow('PROVIDER_UNSUPPORTED');
        expect(adapter.createAnchorPlan).toHaveBeenCalledTimes(1);
        expect(commandService.syncExecuteCommand).not.toHaveBeenCalled();
        expect(undoRedoService.pushUndoRedo).not.toHaveBeenCalled();
    });

    it('merges product menus, honors custom mounts, and deduplicates helper registration', () => {
        const registry = new EmbedProductMenuRegistryService();
        const firstMountDispose = vi.fn();
        const secondMountDispose = vi.fn();
        const firstMount = vi.fn(() => toDisposable(firstMountDispose));
        const secondMount = vi.fn(() => toDisposable(secondMountDispose));
        const injector = createAccessor([[EmbedProductMenuRegistryService, registry]]) as Pick<Injector, 'get' | 'has'>;

        const pendingInjector = { has: vi.fn(() => false), get: vi.fn() } as unknown as Pick<Injector, 'get' | 'has'>;
        const pendingDisposable = registerEmbedProductMenuContribution(pendingInjector, {
            childType: UniverInstanceType.UNIVER_SHEET,
            id: 'missing',
            menuSchema: {},
        });
        expect(pendingDisposable).toBeDefined();
        pendingDisposable?.dispose();
        pendingInjector.has = vi.fn(() => true);
        pendingInjector.get = vi.fn(() => registry) as never;
        flushPendingEmbedProductMenuContributions(pendingInjector);
        expect(registry.getAll(UniverInstanceType.UNIVER_SHEET)).toHaveLength(0);
        expect(registerEmbedProductMenuContribution(injector, {
            childType: UniverInstanceType.UNIVER_SHEET,
            id: 'sheet-ribbon',
            order: 20,
            menuSchema: { start: { bold: true } },
        })).toBeDefined();
        expect(registerEmbedProductMenuContribution(injector, {
            childType: UniverInstanceType.UNIVER_SHEET,
            id: 'sheet-ribbon',
            menuSchema: { start: { duplicate: true } },
        })).toBeUndefined();
        registry.register({
            childType: UniverInstanceType.UNIVER_SHEET,
            order: 10,
            menuSchema: { start: { italic: true }, insert: ['chart'] },
        });
        registry.register({
            childType: UniverInstanceType.UNIVER_SHEET,
            surface: 'float-toolbar',
            id: 'float-a',
            menuSchema: { float: ['a'] },
            mountMenu: firstMount,
        });
        registry.register({
            childType: UniverInstanceType.UNIVER_SHEET,
            surface: 'float-toolbar',
            id: 'float-b',
            menuSchema: { float: ['b'] },
            mountMenu: secondMount,
        });

        expect(registry.getAll(UniverInstanceType.UNIVER_SHEET, 'ribbon')[0]?.order).toBe(10);
        expect(registry.getMergedMenuSchema(UniverInstanceType.UNIVER_SHEET)).toEqual({
            start: { italic: true, bold: true },
            insert: ['chart'],
        });
        expect(registry.getMergedMenuSchema(UniverInstanceType.UNIVER_DOC)).toBeUndefined();
        expect(registry.mountMenu({
            childType: UniverInstanceType.UNIVER_SHEET,
            surface: 'context-menu',
            container: document.createElement('div'),
            injector,
        })).toBeUndefined();

        const disposable = registry.mountMenu({
            childType: UniverInstanceType.UNIVER_SHEET,
            surface: 'float-toolbar',
            container: document.createElement('div'),
            injector,
            childUnitId: 'sheet-1',
        });
        expect(firstMount).toHaveBeenCalledWith(expect.objectContaining({ menuSchema: { float: ['a'] }, surface: 'float-toolbar' }));
        expect(secondMount).toHaveBeenCalledWith(expect.objectContaining({ menuSchema: { float: ['b'] }, surface: 'float-toolbar' }));
        disposable?.dispose();
        expect(firstMountDispose).toHaveBeenCalled();
        expect(secondMountDispose).toHaveBeenCalled();
    });

    it('flushes pending child product plugin contributions from embed ui plugin startup', () => {
        const registry = new EmbedChildProductPluginRegistryService(createAccessor([]) as never);
        const contribution = {
            id: 'sheets-full',
            childType: UniverInstanceType.UNIVER_SHEET,
            plugins: [],
        };
        const injector = createMutableInjector([
            [EmbedHostAdapterRegistryService, new EmbedHostAdapterRegistryService()],
            [EmbedChildProductPluginRegistryService, registry],
            [EmbedUnitLeasePolicyService, new EmbedUnitLeasePolicyService()],
        ]) as unknown as Injector;
        const configService = {
            getConfig: vi.fn(() => ({})),
            setConfig: vi.fn(),
        };

        registerEmbedChildProductPluginContribution(injector, contribution);

        const plugin = new UniverEmbedUIPlugin({
            defaults: {
                floatingMenus: false,
                hostToolbar: false,
            },
        }, injector, configService as never);

        plugin.onStarting();

        expect(registry.getAll(UniverInstanceType.UNIVER_SHEET)).toEqual([contribution]);
    });

    it('enables exclusive embed unit lease policy from embed ui plugin', () => {
        const registry = new EmbedChildProductPluginRegistryService(createAccessor([]) as never);
        const unitLeasePolicyService = new EmbedUnitLeasePolicyService();
        const injector = createMutableInjector([
            [EmbedHostAdapterRegistryService, new EmbedHostAdapterRegistryService()],
            [EmbedChildProductPluginRegistryService, registry],
            [EmbedUnitLeasePolicyService, unitLeasePolicyService],
        ]) as unknown as Injector;
        const configService = {
            setConfig: vi.fn(),
        };

        const plugin = new UniverEmbedUIPlugin({
            defaults: {
                floatingMenus: false,
                hostToolbar: false,
            },
        }, injector, configService as never);

        plugin.onStarting();

        expect(unitLeasePolicyService.getPolicy()).toBe('exclusive');
    });

    it('registers floating menus with exact and fallback lookup', () => {
        const registry = new EmbedFloatingMenuRegistryService();
        const fallback = { hostType: UniverInstanceType.UNIVER_DOC, entry: 'docs-custom-block' as const };
        const exact = { hostType: UniverInstanceType.UNIVER_DOC, entry: 'docs-custom-block' as const, childType: UniverInstanceType.UNIVER_BASE };

        registry.register(fallback as never);
        const disposable = registry.register(exact as never);

        expect(registry.get(UniverInstanceType.UNIVER_DOC, 'docs-custom-block', UniverInstanceType.UNIVER_BASE)).toBe(exact);
        expect(registry.get(UniverInstanceType.UNIVER_DOC, 'docs-custom-block', UniverInstanceType.UNIVER_SHEET)).toBe(fallback);
        expect(registry.hasExact(UniverInstanceType.UNIVER_DOC, 'docs-custom-block', UniverInstanceType.UNIVER_BASE)).toBe(true);
        expect(registry.list()).toEqual([fallback, exact]);
        expect(() => registry.register(exact as never)).toThrow('already registered');
        disposable.dispose();
        expect(registry.get(UniverInstanceType.UNIVER_DOC, 'docs-custom-block', UniverInstanceType.UNIVER_BASE)).toBe(fallback);
    });

    it('creates runtime scopes from provided and default slots', () => {
        const root = document.createElement('div');
        const content = document.createElement('div');
        const canvas = document.createElement('div');
        const overlay = document.createElement('div');
        const popup = document.createElement('div');
        const menuSlot = document.createElement('div');
        const footerSlot = document.createElement('div');
        content.setAttribute(EMBED_CONTENT_ROOT_ATTRIBUTE, 'true');
        canvas.setAttribute(EMBED_CANVAS_ROOT_ATTRIBUTE, 'true');
        overlay.setAttribute(EMBED_OVERLAY_ROOT_ATTRIBUTE, 'true');
        popup.setAttribute(EMBED_POPUP_ROOT_ATTRIBUTE, 'true');
        menuSlot.setAttribute(EMBED_MENU_SLOT_ATTRIBUTE, 'true');
        footerSlot.setAttribute(EMBED_FOOTER_SLOT_ATTRIBUTE, 'true');
        root.append(content, canvas, overlay, popup, menuSlot, footerSlot);
        const setActive = vi.fn();

        const { runtimeScope, disposable } = createEmbedChildRuntimeScope({
            descriptor: createDescriptor({ entry: 'sheets-sheet-tab' }),
            layout: 'tab-peer' as never,
            injector: createAccessor([]) as never,
            hostElement: document.createElement('div'),
            container: document.createElement('div'),
            hostUnitId: 'host-1',
            embedId: 'embed-1',
            childUnitId: 'child-1',
            childType: UniverInstanceType.UNIVER_SHEET,
            renderScope: {
                hostUnitId: 'host-1',
                hostAnchorId: 'anchor-1',
                embedId: 'embed-1',
                childUnitId: 'child-1',
                childType: UniverInstanceType.UNIVER_SHEET,
                layout: 'tab-peer' as never,
                mode: 'tab',
                rootElement: root,
                active$: new Subject<boolean>(),
            },
        }, setActive);

        expect(runtimeScope.host.layout).toBe('tab-peer');
        expect(runtimeScope.roots).toMatchObject({ root, content, canvas, overlay, popup, menuSlot, footerSlot });
        expect(runtimeScope.instanceService).toBeUndefined();
        runtimeScope.activate();
        runtimeScope.deactivate();
        disposable.dispose();
        expect(setActive).toHaveBeenCalledWith(true);
        expect(setActive).toHaveBeenCalledWith(false);

        const defaultRoot = document.createElement('div');
        const slotsDisposable = ensureEmbedDefaultRuntimeSlots(defaultRoot);
        expect(defaultRoot.querySelector(`[${EMBED_CONTENT_ROOT_ATTRIBUTE}]`)).toBeTruthy();
        slotsDisposable.dispose();
        expect(defaultRoot.children).toHaveLength(0);
    });
});

function createAccessor(entries: Array<[unknown, unknown]>): IAccessor {
    const map = new Map(entries);
    return {
        has: (token: unknown) => map.has(token),
        get: ((token: unknown) => {
            if (!map.has(token)) {
                throw new Error(`unexpected token: ${String(token)}`);
            }

            return map.get(token);
        }) as never,
    } as IAccessor;
}

function createMutableInjector(entries: Array<[unknown, unknown]>): Pick<Injector, 'add' | 'get' | 'has'> {
    const map = new Map(entries);
    return {
        add: (dependency: unknown) => {
            const token = Array.isArray(dependency) ? dependency[0] : dependency;
            if (!map.has(token)) {
                map.set(token, createMutableDependencyValue(token));
            }
        },
        has: (token: unknown) => map.has(token),
        get: ((token: unknown) => {
            if (!map.has(token)) {
                throw new Error(`unexpected token: ${String(token)}`);
            }

            return map.get(token);
        }) as never,
    };
}

function createMutableDependencyValue(token: unknown): unknown {
    if (typeof token === 'function') {
        try {
            return new (token as new () => unknown)();
        } catch {
            return {};
        }
    }

    return {};
}

function createDescriptor(overrides: Partial<IEmbedDescriptor> = {}): IEmbedDescriptor {
    return {
        embedId: overrides.embedId ?? 'embed-1',
        hostUnitId: overrides.hostUnitId ?? 'host-1',
        hostType: overrides.hostType ?? UniverInstanceType.UNIVER_DOC,
        hostAnchorId: overrides.hostAnchorId ?? 'anchor-1',
        entry: overrides.entry ?? 'docs-custom-block',
        source: overrides.source ?? {
            unitType: UniverInstanceType.UNIVER_SHEET,
            ref: {
                file: { kind: 'self' },
                unit: { selector: 'child-1', type: 'sheet' },
            },
        },
        childUnitId: 'childUnitId' in overrides ? overrides.childUnitId : 'child-1',
        childType: overrides.childType ?? UniverInstanceType.UNIVER_SHEET,
        mode: overrides.mode ?? 'interactive',
        sourceMeta: overrides.sourceMeta ?? {
            floating: {
                enabled: true,
                layout: 'doc-width-scale',
                fullscreen: true,
            },
            tab: false,
        },
        lifecycle: overrides.lifecycle ?? 'active',
        createdAt: overrides.createdAt,
        updatedAt: overrides.updatedAt,
    };
}
