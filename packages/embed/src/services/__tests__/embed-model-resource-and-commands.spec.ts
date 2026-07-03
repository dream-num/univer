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

import type { IAccessor } from '@univerjs/core';
import type { IEmbedDescriptor } from '../../types/embed';
import type { IEmbedHostAdapterContribution, IEmbedHostAnchorContext, IEmbedHostAnchorMutationPlan, IEmbedHostAnchorRemoveMutationPlan } from '../../types/host-adapter';
import type { IEmbedHostAnchorRecord } from '../../types/host-anchor';
import type { IResourceRef, ResourceRefInput } from '../../types/resource-ref';
import { ICommandService, IUndoRedoService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import {
    CopyEmbedCommand,
    CreateEmbedCommand,
    RemoveEmbedCommand,
} from '../../commands/commands/embed.command';
import {
    SetEmbedDescriptorMutation,
    SoftDeleteEmbedDescriptorMutation,
} from '../../commands/mutations/embed-descriptor.mutation';
import {
    RemoveEmbedHostAnchorRecordMutation,
    SetEmbedHostAnchorRecordMutation,
} from '../../commands/mutations/embed-host-anchor-record.mutation';
import { assertResourceRef, getResourceRefKey, normalizeResourceRef } from '../../common/resource-ref';
import { formatResourceRef, parseResourceRef } from '../../common/resource-ref-uri';
import { fromResourceRefUnitType, toResourceRefUnitType } from '../../common/unit-type';
import { EmbedChildRetentionService } from '../embed-child-retention.service';
import { EmbedCreationService } from '../embed-creation.service';
import { EmbedFocusOwnerService } from '../embed-focus-owner.service';
import { EmbedHostAdapterRegistryService } from '../embed-host-adapter-registry.service';
import { EmbedHostAnchorModelService } from '../embed-host-anchor-model.service';
import { EmbedHostLifecycleService } from '../embed-host-lifecycle.service';
import { EmbedModelService } from '../embed-model.service';
import { EmbedResourceRefProviderRegistryService } from '../embed-resource-ref-provider-registry.service';

describe('resource refs', () => {
    it('normalizes stable keys and validates invalid references', () => {
        const ref: IResourceRef = {
            file: { kind: 'uri', uri: 'univer://book-1' },
            unit: { selector: 'sheet-1', type: 'sheet' },
            part: { kind: 'range', sheetName: 'Sheet1', sheetId: 'sid-1', ref: 'A1:B2', range: 'A1:B2' },
            extensions: {
                z: ['2', '1'],
                a: 'first',
            },
        };

        expect(normalizeResourceRef(ref)).toEqual({
            file: { kind: 'uri', uri: 'univer://book-1' },
            unit: { selector: 'sheet-1', type: 'sheet' },
            part: { kind: 'range', sheetName: 'Sheet1', sheetId: 'sid-1', ref: 'A1:B2', range: 'A1:B2' },
            extensions: {
                a: 'first',
                z: ['2', '1'],
            },
        });
        expect(getResourceRefKey(ref)).toBe(getResourceRefKey({
            ...ref,
            extensions: { a: 'first', z: ['2', '1'] },
        }));
        expect(normalizeResourceRef({
            file: { kind: 'self' },
            unit: { selector: 'doc-1', type: 'doc' },
            part: { kind: 'sheet', sheetName: 'Sheet1', sheetId: 'sid-1' },
        })).toEqual({
            file: { kind: 'self' },
            unit: { selector: 'doc-1', type: 'doc' },
            part: { kind: 'sheet', sheetName: 'Sheet1', sheetId: 'sid-1' },
        });
        expect(normalizeResourceRef({
            file: { kind: 'relative', path: './book.univer' },
            unit: { selector: 'base-1', type: 'base' },
        })).toEqual({
            file: { kind: 'relative', path: './book.univer' },
            unit: { selector: 'base-1', type: 'base' },
        });

        expect(() => assertResourceRef(null as never)).toThrow('RESOURCE_REF_INVALID');
        expect(() => assertResourceRef({ file: null, unit: { selector: 'sheet-1', type: 'sheet' } } as never)).toThrow('RESOURCE_REF_INVALID_FILE');
        expect(() => assertResourceRef({ file: { kind: 'remote' }, unit: { selector: 'sheet-1', type: 'sheet' } } as never)).toThrow('RESOURCE_REF_INVALID_FILE_KIND');
        expect(() => assertResourceRef({ file: { kind: 'relative', path: '' }, unit: { selector: 'sheet-1', type: 'sheet' } } as never)).toThrow('RESOURCE_REF_INVALID_RELATIVE_PATH');
        expect(() => assertResourceRef({ file: { kind: 'uri', uri: '' }, unit: { selector: 'sheet-1', type: 'sheet' } } as never)).toThrow('RESOURCE_REF_INVALID_URI');
        expect(() => assertResourceRef({ file: { kind: 'self' }, unit: { selector: '', type: 'sheet' } } as never)).toThrow('RESOURCE_REF_INVALID_UNIT');
        expect(() => assertResourceRef({ file: { kind: 'self' }, unit: { selector: 'sheet-1', type: 'unknown' } } as never)).toThrow('RESOURCE_REF_INVALID_UNIT_TYPE');
        expect(() => assertResourceRef({ file: { kind: 'self' }, unit: { selector: 'sheet-1', type: 'sheet' }, part: { kind: 'unknown' } } as never)).toThrow('RESOURCE_REF_INVALID_PART_KIND');
        expect(() => assertResourceRef({ file: { kind: 'self' }, unit: { selector: 'sheet-1', type: 'sheet' }, part: { kind: 'sheet', sheetName: '' } } as never)).toThrow('RESOURCE_REF_INVALID_SHEET_PART');
        expect(() => assertResourceRef({ file: { kind: 'self' }, unit: { selector: 'sheet-1', type: 'sheet' }, part: { kind: 'range', ref: 'A1', sheetName: '', range: 'A1' } } as never)).toThrow('RESOURCE_REF_INVALID_RANGE_PART');
        expect(() => assertResourceRef({ file: { kind: 'self' }, unit: { selector: 'sheet-1', type: 'sheet' }, extensions: [] } as never)).toThrow('RESOURCE_REF_INVALID_EXTENSIONS');
        expect(() => assertResourceRef({ file: { kind: 'self' }, unit: { selector: 'sheet-1', type: 'sheet' }, extensions: { '': 'bad' } } as never)).toThrow('RESOURCE_REF_INVALID_EXTENSION_KEY');
        expect(() => assertResourceRef({ file: { kind: 'self' }, unit: { selector: 'sheet-1', type: 'sheet' }, extensions: { bad: [1] } } as never)).toThrow('RESOURCE_REF_INVALID_EXTENSION_VALUE');

        expect(toResourceRefUnitType(UniverInstanceType.UNIVER_SHEET)).toBe('sheet');
        expect(toResourceRefUnitType(UniverInstanceType.UNIVER_DOC)).toBe('doc');
        expect(toResourceRefUnitType(UniverInstanceType.UNIVER_SLIDE)).toBe('slide');
        expect(toResourceRefUnitType(UniverInstanceType.UNIVER_BASE)).toBe('base');
        expect(fromResourceRefUnitType('sheet')).toBe(UniverInstanceType.UNIVER_SHEET);
        expect(fromResourceRefUnitType('doc')).toBe(UniverInstanceType.UNIVER_DOC);
        expect(fromResourceRefUnitType('slide')).toBe(UniverInstanceType.UNIVER_SLIDE);
        expect(fromResourceRefUnitType('base')).toBe(UniverInstanceType.UNIVER_BASE);
        expect(() => toResourceRefUnitType(UniverInstanceType.UNRECOGNIZED)).toThrow('UNSUPPORTED_UNIT_TYPE');
        expect(() => fromResourceRefUnitType('unknown' as never)).toThrow('UNSUPPORTED_UNIT_TYPE');

        expect(parseResourceRef('#unit=sheet-1&type=sheet')).toEqual({
            file: { kind: 'self' },
            unit: { selector: 'sheet-1', type: 'sheet' },
        });
        expect(formatResourceRef({
            file: { kind: 'self' },
            unit: { selector: 'sheet-1', type: 'sheet' },
        })).toBe('#unit=sheet-1&type=sheet');
        expect(() => parseResourceRef('#unit=sheet-1')).toThrow('MISSING_TYPE');
    });
});

describe('EmbedModelService', () => {
    it('stores normalized descriptors, clones resources, and tracks lifecycle', () => {
        const model = new EmbedModelService();
        const descriptor = createDescriptor({ hostContext: { volatile: true } } as Partial<IEmbedDescriptor>);

        model.addDescriptor('host-1', descriptor);

        expect(model.getDescriptor('host-1', 'embed-1')).toMatchObject({
            hostUnitId: 'host-1',
            childType: UniverInstanceType.UNIVER_SHEET,
            lifecycle: 'active',
            source: {
                ref: '#unit=child-sheet&type=sheet',
            },
        });
        expect(model.getDescriptor('host-1', 'embed-1')).not.toHaveProperty('hostContext');
        expect(model.getActiveDescriptors('host-1')).toHaveLength(1);
        expect(model.getActiveDescriptorsByChildUnit('child-sheet')).toHaveLength(0);
        expect(model.countReferencesByResourceRef('host-1', getDescriptorRef(descriptor))).toBe(1);
        expect(model.countActiveReferencesByResourceRef('host-1', getDescriptorRef(descriptor))).toBe(1);

        const serialized = model.serializeUnit('host-1');
        serialized.embeds['embed-1'].lifecycle = 'soft-deleted';
        expect(model.getDescriptor('host-1', 'embed-1')?.lifecycle).toBe('active');

        model.softDeleteDescriptor('host-1', 'embed-1');
        expect(model.getActiveDescriptors('host-1')).toEqual([]);
        expect(model.countActiveReferencesByResourceRef('host-1', getDescriptorRef(descriptor))).toBe(0);
        model.restoreDescriptor('host-1', 'embed-1');
        expect(model.getDescriptor('host-1', 'embed-1')?.lifecycle).toBe('active');

        expect(model.toJson('host-1')).toContain('embed-1');
        model.unloadUnit('host-1');
        expect(model.getDescriptors('host-1')).toEqual([]);
    });

    it('stores canonical self resource refs', () => {
        const model = new EmbedModelService();
        const descriptor = createDescriptor({
            source: {
                unitType: UniverInstanceType.UNIVER_SHEET,
                creationConfig: { id: 'child-sheet', name: 'Embedded Sheet' },
                ref: '#unit=child-sheet&type=sheet',
            },
            childUnitId: 'child-sheet',
            childType: UniverInstanceType.UNIVER_SHEET,
        });

        model.addDescriptor('host-1', descriptor);

        expect(model.getDescriptor('host-1', 'embed-1')).toMatchObject({
            source: {
                unitType: UniverInstanceType.UNIVER_SHEET,
                creationConfig: { id: 'child-sheet', name: 'Embedded Sheet' },
                ref: '#unit=child-sheet&type=sheet',
            },
            childUnitId: 'child-sheet',
            childType: UniverInstanceType.UNIVER_SHEET,
        });
        expect(model.countReferencesByResourceRef('host-1', getDescriptorRef(descriptor))).toBe(1);
        expect(model.getActiveDescriptorsByChildUnit('child-sheet')).toHaveLength(1);
        expect(model.serializeUnit('host-1').embeds['embed-1']).not.toHaveProperty('childUnitId');
    });

    it('releases unit leases when descriptors or host units leave the model', () => {
        const unitLeaseService = {
            release: vi.fn(),
        };
        const model = new EmbedModelService(unitLeaseService as never);
        model.addDescriptor('host-1', createDescriptor());

        model.softDeleteDescriptor('host-1', 'embed-1');
        expect(unitLeaseService.release).toHaveBeenCalledWith({ hostUnitId: 'host-1', embedId: 'embed-1' });
    });

    it('allows materialized child units to differ from self ref selectors', () => {
        const model = new EmbedModelService();
        const descriptor = createDescriptor({
            source: {
                unitType: UniverInstanceType.UNIVER_SHEET,
                ref: '#unit=fixture-key&type=sheet',
            },
            childUnitId: 'runtime-child-sheet',
            childType: UniverInstanceType.UNIVER_SHEET,
        });

        model.addDescriptor('host-1', descriptor);

        expect(model.getDescriptor('host-1', 'embed-1')).toMatchObject({
            source: {
                ref: '#unit=fixture-key&type=sheet',
            },
            childUnitId: 'runtime-child-sheet',
            childType: UniverInstanceType.UNIVER_SHEET,
        });
    });

    it('rejects non-canonical sources and type mismatches without owning child unit uniqueness', () => {
        const model = new EmbedModelService();

        expect(() => model.addDescriptor('host-1', { ...createDescriptor(), source: { unitType: UniverInstanceType.UNIVER_SHEET } } as never)).toThrow('RESOURCE_REF_INVALID');
        expect(() => model.addDescriptor('host-1', createDescriptor({ childType: UniverInstanceType.UNIVER_DOC }))).toThrow('EMBED_DESCRIPTOR_CHILD_TYPE_MISMATCH');

        model.addDescriptor('host-1', createDescriptor({ childUnitId: 'runtime-child-sheet' }));
        model.addDescriptor('host-1', createDescriptor({
            embedId: 'embed-2',
            hostAnchorId: 'anchor-2',
            childUnitId: 'runtime-child-sheet',
        }));
        expect(model.getActiveDescriptorsByChildUnit('runtime-child-sheet')).toHaveLength(2);

        model.loadUnit('host-2', {
            version: 1,
            embeds: {
                'embed-3': createDescriptor({
                    embedId: 'embed-3',
                    hostUnitId: 'host-2',
                    hostAnchorId: 'anchor-3',
                    childUnitId: 'runtime-child-sheet',
                }),
            },
        });
        expect(model.getDescriptor('host-2', 'embed-3')?.childUnitId).toBeUndefined();

        model.loadUnit('host-2', {
            version: 1,
            embeds: {
                deleted: createDescriptor({ embedId: 'deleted', hostUnitId: 'host-2', hostAnchorId: 'anchor-4', lifecycle: 'soft-deleted' }),
            },
        });
        expect(model.getDescriptors('host-2')).toHaveLength(1);

        expect(Object.values(model.parseJson(JSON.stringify({
            embeds: {
                a: createDescriptor({ embedId: 'a', hostAnchorId: 'a' }),
                b: createDescriptor({ embedId: 'b', hostAnchorId: 'b' }),
            },
        })).embeds).map((descriptor) => descriptor.childUnitId)).toEqual([undefined, undefined]);
        expect(model.parseJson('')).toEqual({ version: 1, embeds: {} });
    });
});

describe('embed resource ref providers', () => {
    it('registers resource ref providers by deterministic ResourceRef match', () => {
        const registry = new EmbedResourceRefProviderRegistryService();
        const provider = createResourceRefProvider();
        const registration = {
            registrationId: 'univer-uri-sheet',
            match: {
                fileKinds: ['uri' as const],
                uriSchemes: ['univer'],
                unitTypes: ['sheet' as const],
            },
            provider,
        };

        const disposable = registry.registerUnitProvider(registration);

        expect(registry.getUnitProvider({
            file: { kind: 'uri', uri: 'univer://workspace/file-1' },
            unit: { selector: 'sheet-1', type: 'sheet' },
        })).toBe(registration);
        expect(registry.getUnitProvider({
            file: { kind: 'uri', uri: 'https://example.com/file' },
            unit: { selector: 'sheet-1', type: 'sheet' },
        })).toBeUndefined();
        expect(registry.listUnitProviders()).toEqual([registration]);
        expect(() => registry.registerUnitProvider(registration)).toThrow('already registered');

        disposable.dispose();
        expect(registry.getUnitProvider({
            file: { kind: 'uri', uri: 'univer://workspace/file-1' },
            unit: { selector: 'sheet-1', type: 'sheet' },
        })).toBeUndefined();
        registry.registerUnitProvider(registration);

        registry.registerUnitProvider({
            registrationId: 'all-uri',
            match: {
                fileKinds: ['uri'],
            },
            provider: createResourceRefProvider(),
        });
        expect(() => registry.getUnitProvider({
            file: { kind: 'uri', uri: 'univer://workspace/file-1' },
            unit: { selector: 'sheet-1', type: 'sheet' },
        })).toThrow('provider-conflict');
    });
});

function createResourceRefProvider() {
    return {
        ensureUnit: vi.fn((input: { unitType: UniverInstanceType }) => ({
            unitId: 'runtime-unit',
            unitType: input.unitType,
        })),
    };
}

describe('retention and focus services', () => {
    it('reports cleanup candidates only when all references are soft deleted', () => {
        const model = new EmbedModelService();
        const ref = getDescriptorRef(createDescriptor());
        const retention = new EmbedChildRetentionService(model);

        expect(retention.getRetentionState('host-1', ref)).toMatchObject({
            totalReferences: 0,
            activeReferences: 0,
            childUnitIds: [],
            eligibleForCleanup: false,
        });

        model.addDescriptor('host-1', createDescriptor({ lifecycle: 'soft-deleted' }));
        expect(retention.getRetentionState('host-1', ref)).toMatchObject({
            totalReferences: 1,
            activeReferences: 0,
            softDeletedReferences: 1,
            childUnitIds: [],
            shouldDisposeNow: false,
            eligibleForCleanup: true,
        });
        expect(retention.listCleanupCandidates('host-1')).toHaveLength(1);
    });

    it('deduplicates focus owner events and clears by embed id', () => {
        const service = new EmbedFocusOwnerService();
        const observed: unknown[] = [];
        service.focusOwner$.subscribe((owner) => observed.push(owner));
        const owner = {
            hostUnitId: 'host-1',
            embedId: 'embed-1',
            childUnitId: 'child-1',
            childType: UniverInstanceType.UNIVER_DOC,
            reason: 'pointer',
        } as const;

        service.setFocusOwner(owner);
        service.setFocusOwner(owner);
        service.clearFocusOwner('other');
        expect(service.getFocusOwner()).toBe(owner);
        service.clearFocusOwner('embed-1');
        service.clearFocusOwner();

        expect(observed).toEqual([null, owner, null]);
    });
});

describe('embed commands and mutations', () => {
    it('creates, copies, removes, and records undo redo mutations', async () => {
        const descriptor = createDescriptor();
        const creationService = {
            prepareCreateEmbed: vi.fn(() => ({ descriptor })),
            prepareCopyEmbed: vi.fn(() => createDescriptor({ embedId: 'embed-copy', hostAnchorId: 'anchor-copy' })),
        };
        const descriptors = new Map<string, IEmbedDescriptor>([[descriptor.embedId, descriptor]]);
        const modelService = {
            getDescriptor: vi.fn((_hostUnitId: string, embedId: string): IEmbedDescriptor | undefined => descriptors.get(embedId)),
            addDescriptor: vi.fn((_hostUnitId: string, nextDescriptor: IEmbedDescriptor) => {
                descriptors.set(nextDescriptor.embedId, nextDescriptor);
            }),
            softDeleteDescriptor: vi.fn((_hostUnitId: string, embedId: string) => {
                const current = descriptors.get(embedId);
                if (current) {
                    descriptors.set(embedId, { ...current, lifecycle: 'soft-deleted' });
                }
            }),
        };
        const undoRedoService = { pushUndoRedo: vi.fn() };
        const accessor = createCommandAccessor(creationService, modelService, undoRedoService);

        const created = CreateEmbedCommand.handler(accessor, {
            embedId: 'embed-1',
            hostUnitId: 'host-1',
            hostType: UniverInstanceType.UNIVER_DOC,
            requestedHostAnchorId: 'anchor-1',
            entry: 'docs-custom-block',
            source: descriptor.source,
        });
        expect(created).toMatchObject({
            embedId: 'embed-1',
            hostUnitId: 'host-1',
            hostAnchorId: 'anchor-1',
        });
        expect(created).not.toHaveProperty('childUnitId');
        expect(undoRedoService.pushUndoRedo).toHaveBeenLastCalledWith(expect.objectContaining({
            unitID: 'host-1',
            undoMutations: [
                { id: SoftDeleteEmbedDescriptorMutation.id, params: { unitId: 'host-1', embedId: 'embed-1' } },
                { id: RemoveEmbedHostAnchorRecordMutation.id, params: { hostUnitId: 'host-1', hostAnchorId: 'anchor-1' } },
            ],
            redoMutations: [
                { id: SetEmbedHostAnchorRecordMutation.id, params: { record: expect.objectContaining({ hostAnchorId: 'anchor-1' }) } },
                { id: SetEmbedDescriptorMutation.id, params: { unitId: 'host-1', descriptor: created } },
            ],
        }));

        expect(CopyEmbedCommand.handler(accessor, {
            hostUnitId: 'host-1',
            sourceEmbedId: 'embed-1',
            nextEmbedId: 'embed-copy',
            requestedHostAnchorId: 'anchor-copy',
        })).toMatchObject({ embedId: 'embed-copy' });
        expect(RemoveEmbedCommand.handler(accessor, { hostUnitId: 'host-1', embedId: 'embed-1' })).toBe(true);
        expect(modelService.softDeleteDescriptor).toHaveBeenCalledWith('host-1', 'embed-1');

        expect(CreateEmbedCommand.handler(accessor, undefined)).toBe(false);
        expect(CopyEmbedCommand.handler(accessor, undefined)).toBe(false);
        expect(RemoveEmbedCommand.handler(accessor, undefined)).toBe(false);
        modelService.getDescriptor.mockReturnValueOnce(undefined);
        expect(RemoveEmbedCommand.handler(accessor, { hostUnitId: 'host-1', embedId: 'missing' })).toBe(false);
    });

    it('applies descriptor mutations through the model', () => {
        const modelService = {
            addDescriptor: vi.fn(),
            softDeleteDescriptor: vi.fn(),
        };
        const accessor = createCommandAccessor({}, modelService, {});
        const descriptor = createDescriptor();

        expect(SetEmbedDescriptorMutation.handler(accessor, { unitId: 'host-1', descriptor })).toBe(true);
        expect(modelService.addDescriptor).toHaveBeenCalledWith('host-1', descriptor);
        expect(SoftDeleteEmbedDescriptorMutation.handler(accessor, { unitId: 'host-1', embedId: 'embed-1' })).toBe(true);
        expect(modelService.softDeleteDescriptor).toHaveBeenCalledWith('host-1', 'embed-1');
        expect(SetEmbedDescriptorMutation.handler(accessor, undefined as never)).toBe(false);
        expect(SoftDeleteEmbedDescriptorMutation.handler(accessor, undefined as never)).toBe(false);
    });
});

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
                unit: { selector: 'child-sheet', type: 'sheet' },
            },
        },
        childUnitId: overrides.childUnitId,
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
        lifecycle: overrides.lifecycle,
        createdAt: overrides.createdAt,
        updatedAt: overrides.updatedAt,
    };
}

function createCommandAccessor(
    creationService: unknown,
    modelService: unknown,
    undoRedoService: unknown,
    instanceService: unknown = { getUnit: vi.fn() }
): IAccessor {
    let accessor: IAccessor;
    const hostAdapterRegistry = createTestHostAdapterRegistry();
    const anchorModelService = new EmbedHostAnchorModelService();
    const commandService = {
        syncExecuteCommand: vi.fn((id: string, params?: object) => {
            if (id === SetEmbedDescriptorMutation.id) {
                return SetEmbedDescriptorMutation.handler(accessor, params as never);
            }
            if (id === SoftDeleteEmbedDescriptorMutation.id) {
                return SoftDeleteEmbedDescriptorMutation.handler(accessor, params as never);
            }
            if (id === SetEmbedHostAnchorRecordMutation.id) {
                return SetEmbedHostAnchorRecordMutation.handler(accessor, params as never);
            }
            if (id === RemoveEmbedHostAnchorRecordMutation.id) {
                return RemoveEmbedHostAnchorRecordMutation.handler(accessor, params as never);
            }

            throw new Error('unexpected command');
        }),
    };
    const lifecycleService = new EmbedHostLifecycleService(
        creationService as never,
        modelService as never,
        instanceService as never,
        hostAdapterRegistry,
        commandService as never,
        undoRedoService as never
    );

    accessor = {
        get: vi.fn((token: unknown) => {
            if (token === EmbedHostLifecycleService) {
                return lifecycleService;
            }
            if (token === EmbedHostAdapterRegistryService) {
                return hostAdapterRegistry;
            }
            if (token === EmbedHostAnchorModelService) {
                return anchorModelService;
            }
            if (token === EmbedCreationService) {
                return creationService;
            }
            if (token === ICommandService) {
                return commandService;
            }
            if (token === EmbedModelService) {
                return modelService;
            }
            if (token === IUndoRedoService) {
                return undoRedoService;
            }
            if (token === IUniverInstanceService) {
                return instanceService;
            }
            throw new Error('unexpected token');
        }),
    } as never;

    return accessor;
}

function createTestHostAdapterRegistry(): EmbedHostAdapterRegistryService {
    const registry = new EmbedHostAdapterRegistryService();
    createTestHostAdapters().forEach((adapter) => registry.register(adapter));
    return registry;
}

function createTestHostAdapters(): IEmbedHostAdapterContribution[] {
    return [
        createTestHostAdapter(UniverInstanceType.UNIVER_DOC, 'docs-custom-block', 'docs-custom-block'),
        createTestHostAdapter(UniverInstanceType.UNIVER_SHEET, 'sheets-sheet-tab', 'sheets-sheet-tab'),
        createTestHostAdapter(UniverInstanceType.UNIVER_SHEET, 'sheets-floating-object', 'sheets-floating-object'),
        createTestHostAdapter(UniverInstanceType.UNIVER_BASE, 'bases-table-list-block', 'bases-table-list-block'),
        createTestHostAdapter(UniverInstanceType.UNIVER_SLIDE, 'slides-page-list-block', 'slides-page-list-block'),
        createTestHostAdapter(UniverInstanceType.UNIVER_SLIDE, 'slides-floating-object', 'slides-floating-object'),
    ];
}

function createTestHostAdapter(
    hostType: UniverInstanceType,
    entry: IEmbedHostAdapterContribution['entry'],
    kind: IEmbedHostAnchorRecord['kind']
): IEmbedHostAdapterContribution {
    return {
        hostType,
        entry,
        createAnchorPlan: (context) => createTestAnchorPlan(context, kind),
        removeAnchorPlan: (context) => createTestRemoveAnchorPlan(context, kind),
    };
}

function createTestAnchorPlan(
    context: IEmbedHostAnchorContext,
    kind: IEmbedHostAnchorRecord['kind']
): IEmbedHostAnchorMutationPlan {
    const hostAnchorId = context.requestedAnchorId ?? `${kind}:${context.embedId}`;
    return {
        hostAnchorId,
        redoMutations: [{
            id: SetEmbedHostAnchorRecordMutation.id,
            params: {
                record: {
                    embedId: context.embedId,
                    hostUnitId: context.hostUnitId,
                    hostType: context.hostType,
                    entry: context.entry,
                    hostAnchorId,
                    kind,
                    lifecycle: 'active',
                },
            },
        }],
        undoMutations: [{
            id: RemoveEmbedHostAnchorRecordMutation.id,
            params: {
                hostUnitId: context.hostUnitId,
                hostAnchorId,
            },
        }],
    };
}

function createTestRemoveAnchorPlan(
    context: IEmbedHostAnchorContext & { hostAnchorId: string },
    kind: IEmbedHostAnchorRecord['kind']
): IEmbedHostAnchorRemoveMutationPlan {
    return {
        redoMutations: [{
            id: RemoveEmbedHostAnchorRecordMutation.id,
            params: {
                hostUnitId: context.hostUnitId,
                hostAnchorId: context.hostAnchorId,
            },
        }],
        undoMutations: [{
            id: SetEmbedHostAnchorRecordMutation.id,
            params: {
                record: {
                    embedId: context.embedId,
                    hostUnitId: context.hostUnitId,
                    hostType: context.hostType,
                    entry: context.entry,
                    hostAnchorId: context.hostAnchorId,
                    kind,
                    lifecycle: 'active',
                },
            },
        }],
    };
}

function getDescriptorRef(descriptor: IEmbedDescriptor): ResourceRefInput {
    return descriptor.source.ref;
}
