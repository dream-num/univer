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
import type { IEmbedDescriptor, IEmbedGuestContribution } from '../types/embed';
import type { IResourceRef } from '../types/resource-ref';
import { IUndoRedoService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { CopyEmbedCommand, CreateEmbedCommand, InsertEmbedBySnapshotCommand, RemoveEmbedCommand } from '../commands/commands/embed.command';
import { SetEmbedDescriptorMutation, SoftDeleteEmbedDescriptorMutation } from '../commands/mutations/embed-descriptor.mutation';
import { assertResourceRef, getResourceRefKey, normalizeResourceRef } from '../common/resource-ref';
import { fromResourceRefUnitType, toResourceRefUnitType } from '../common/unit-type';
import { EmbedCapabilityRegistryService } from './embed-capability-registry.service';
import { EmbedChildRetentionService } from './embed-child-retention.service';
import { EmbedCreationService } from './embed-creation.service';
import { EmbedFocusOwnerService } from './embed-focus-owner.service';
import { EmbedGuestContributionRegistryService, flushPendingEmbedGuestContributions, registerEmbedGuestContribution } from './embed-guest-contribution-registry.service';
import { EmbedModelService } from './embed-model.service';
import { EmbedResourceRefProviderRegistryService } from './embed-resource-ref-provider-registry.service';

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
    });
});

describe('EmbedModelService', () => {
    it('stores normalized descriptors, clones resources, and tracks lifecycle', () => {
        const model = new EmbedModelService();
        const descriptor = createDescriptor({ hostContext: { volatile: true } } as Partial<IEmbedDescriptor>);

        model.addDescriptor('host-1', descriptor);

        expect(model.getDescriptor('host-1', 'embed-1')).toMatchObject({
            hostUnitId: 'host-1',
            childUnitId: 'child-sheet',
            childType: UniverInstanceType.UNIVER_SHEET,
            lifecycle: 'active',
        });
        expect(model.getDescriptor('host-1', 'embed-1')).not.toHaveProperty('hostContext');
        expect(model.getActiveDescriptors('host-1')).toHaveLength(1);
        expect(model.getActiveDescriptorsByChildUnit('child-sheet')).toHaveLength(1);
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

    it('rejects non-canonical sources, mismatches, and duplicate active child units', () => {
        const model = new EmbedModelService();

        expect(() => model.addDescriptor('host-1', { ...createDescriptor(), source: { kind: 'empty', unitType: UniverInstanceType.UNIVER_SHEET } } as never)).toThrow('EMBED_DESCRIPTOR_SOURCE_NOT_CANONICAL');
        expect(() => model.addDescriptor('host-1', createDescriptor({ childUnitId: 'other' }))).toThrow('EMBED_DESCRIPTOR_CHILD_REF_MISMATCH');
        expect(() => model.addDescriptor('host-1', createDescriptor({ childType: UniverInstanceType.UNIVER_DOC }))).toThrow('EMBED_DESCRIPTOR_CHILD_TYPE_MISMATCH');

        model.addDescriptor('host-1', createDescriptor());
        expect(() => model.addDescriptor('host-1', createDescriptor({ embedId: 'embed-2', hostAnchorId: 'anchor-2' }))).toThrow('EMBED_CHILD_UNIT_ALREADY_EMBEDDED');
        expect(() => model.loadUnit('host-2', {
            version: 1,
            embeds: {
                'embed-3': createDescriptor({ embedId: 'embed-3', hostUnitId: 'host-2', hostAnchorId: 'anchor-3' }),
            },
        })).toThrow('EMBED_CHILD_UNIT_ALREADY_EMBEDDED');

        model.loadUnit('host-2', {
            version: 1,
            embeds: {
                deleted: createDescriptor({ embedId: 'deleted', hostUnitId: 'host-2', hostAnchorId: 'anchor-4', lifecycle: 'soft-deleted' }),
            },
        });
        expect(model.getDescriptors('host-2')).toHaveLength(1);

        expect(() => model.parseJson(JSON.stringify({
            embeds: {
                a: createDescriptor({ embedId: 'a', hostAnchorId: 'a' }),
                b: createDescriptor({ embedId: 'b', hostAnchorId: 'b' }),
            },
        }))).toThrow('EMBED_CHILD_UNIT_ALREADY_EMBEDDED');
        expect(model.parseJson('')).toEqual({ version: 1, embeds: {} });
    });
});

describe('embed guest contributions and providers', () => {
    it('queues guest contributions until registry exists', () => {
        const contribution = createGuestContribution(UniverInstanceType.UNIVER_DOC);
        const pendingInjector = createInjector(undefined);

        registerEmbedGuestContribution(pendingInjector, contribution);
        registerEmbedGuestContribution(pendingInjector, contribution);
        flushPendingEmbedGuestContributions(pendingInjector);

        const registry = new EmbedGuestContributionRegistryService();
        const injector = createInjector(registry, pendingInjector);

        flushPendingEmbedGuestContributions(injector);
        expect(registry.list()).toEqual([contribution]);
        expect(registry.get(UniverInstanceType.UNIVER_DOC)).toBe(contribution);
        expect(() => registry.register(contribution)).toThrow('already registered');
    });

    it('registers resource ref providers by file kind', () => {
        const registry = new EmbedResourceRefProviderRegistryService();
        const provider = { fileKind: 'uri' as const, resolve: vi.fn() };

        registry.register(provider);

        expect(registry.get('uri')).toBe(provider);
        expect(registry.list()).toEqual([provider]);
        expect(() => registry.register(provider)).toThrow('already registered');
    });
});

describe('retention and focus services', () => {
    it('reports cleanup candidates only when all references are soft deleted', () => {
        const model = new EmbedModelService();
        const ref = getDescriptorRef(createDescriptor());
        const retention = new EmbedChildRetentionService(model);

        expect(retention.getRetentionState('host-1', ref)).toMatchObject({
            totalReferences: 0,
            activeReferences: 0,
            eligibleForCleanup: false,
        });

        model.addDescriptor('host-1', createDescriptor({ lifecycle: 'soft-deleted' }));
        expect(retention.getRetentionState('host-1', ref)).toMatchObject({
            totalReferences: 1,
            activeReferences: 0,
            softDeletedReferences: 1,
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
            createEmbed: vi.fn(async () => ({ descriptor })),
            copyEmbed: vi.fn(() => createDescriptor({ embedId: 'embed-copy', hostAnchorId: 'anchor-copy' })),
            removeEmbed: vi.fn(),
        };
        const modelService = {
            getDescriptor: vi.fn((): IEmbedDescriptor | undefined => descriptor),
            addDescriptor: vi.fn(),
            softDeleteDescriptor: vi.fn(),
        };
        const undoRedoService = { pushUndoRedo: vi.fn() };
        const accessor = createCommandAccessor(creationService, modelService, undoRedoService);

        await expect(CreateEmbedCommand.handler(accessor, {
            embedId: 'embed-1',
            hostUnitId: 'host-1',
            hostType: UniverInstanceType.UNIVER_DOC,
            hostAnchorId: 'anchor-1',
            entry: 'docs-custom-block',
            source: descriptor.source,
        })).resolves.toBe(descriptor);
        expect(undoRedoService.pushUndoRedo).toHaveBeenLastCalledWith(expect.objectContaining({
            unitID: 'host-1',
            undoMutations: [{ id: SoftDeleteEmbedDescriptorMutation.id, params: { hostUnitId: 'host-1', embedId: 'embed-1' } }],
            redoMutations: [{ id: SetEmbedDescriptorMutation.id, params: { hostUnitId: 'host-1', descriptor } }],
        }));

        expect(CopyEmbedCommand.handler(accessor, {
            hostUnitId: 'host-1',
            sourceEmbedId: 'embed-1',
            nextEmbedId: 'embed-copy',
            nextHostAnchorId: 'anchor-copy',
        })).toMatchObject({ embedId: 'embed-copy' });
        expect(RemoveEmbedCommand.handler(accessor, { hostUnitId: 'host-1', embedId: 'embed-1' })).toBe(true);
        expect(creationService.removeEmbed).toHaveBeenCalledWith({ hostUnitId: 'host-1', embedId: 'embed-1' });

        expect(await CreateEmbedCommand.handler(accessor, undefined)).toBe(false);
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

        expect(SetEmbedDescriptorMutation.handler(accessor, { hostUnitId: 'host-1', descriptor })).toBe(true);
        expect(modelService.addDescriptor).toHaveBeenCalledWith('host-1', descriptor);
        expect(SoftDeleteEmbedDescriptorMutation.handler(accessor, { hostUnitId: 'host-1', embedId: 'embed-1' })).toBe(true);
        expect(modelService.softDeleteDescriptor).toHaveBeenCalledWith('host-1', 'embed-1');
        expect(SetEmbedDescriptorMutation.handler(accessor, undefined as never)).toBe(false);
        expect(SoftDeleteEmbedDescriptorMutation.handler(accessor, undefined as never)).toBe(false);
    });

    it('inserts an embed from a local snapshot synchronously', () => {
        let storedDescriptor: IEmbedDescriptor | undefined;
        const modelService = {
            addDescriptor: vi.fn((_hostUnitId: string, descriptor: IEmbedDescriptor) => {
                storedDescriptor = descriptor;
            }),
            getDescriptor: vi.fn(() => storedDescriptor),
        };
        const undoRedoService = { pushUndoRedo: vi.fn() };
        const instanceService = {
            createUnit: vi.fn(() => ({ getUnitId: () => 'child-doc' })),
        };
        const capabilityRegistry = {
            getCapability: vi.fn(() => ({
                hostType: UniverInstanceType.UNIVER_SHEET,
                childType: UniverInstanceType.UNIVER_DOC,
                entry: 'sheets-sheet-tab',
                mode: 'tab',
                layout: 'tab-peer',
                menuBehavior: 'host-override',
                nestedEmbed: false,
            })),
        };
        const accessor = createCommandAccessor({}, modelService, undoRedoService, instanceService, capabilityRegistry);

        expect(InsertEmbedBySnapshotCommand.handler(accessor, {
            embedId: 'embed-doc',
            hostUnitId: 'host-sheet',
            hostType: UniverInstanceType.UNIVER_SHEET,
            hostAnchorId: 'anchor-doc',
            entry: 'sheets-sheet-tab',
            childType: UniverInstanceType.UNIVER_DOC,
            unitSnapshot: { id: 'child-doc', body: { dataStream: '\r\n' } },
            hostContext: { tabIndex: 1, name: 'Notes' },
        })).toMatchObject({
            embedId: 'embed-doc',
            hostUnitId: 'host-sheet',
            hostAnchorId: 'anchor-doc',
            childUnitId: 'child-doc',
            childType: UniverInstanceType.UNIVER_DOC,
            source: {
                kind: 'ref',
                ref: { file: { kind: 'self' }, unit: { selector: 'child-doc', type: 'doc' } },
            },
        });
        expect(instanceService.createUnit).toHaveBeenCalledWith(
            UniverInstanceType.UNIVER_DOC,
            { id: 'child-doc', body: { dataStream: '\r\n' } },
            expect.objectContaining({ makeCurrent: false, skipAutoRender: true, embeddedRender: true })
        );
        expect(modelService.addDescriptor).toHaveBeenCalledWith('host-sheet', expect.objectContaining({ embedId: 'embed-doc' }));
        expect(undoRedoService.pushUndoRedo).toHaveBeenCalledWith(expect.objectContaining({
            unitID: 'host-sheet',
            undoMutations: [{ id: SoftDeleteEmbedDescriptorMutation.id, params: { hostUnitId: 'host-sheet', embedId: 'embed-doc' } }],
        }));
        expect(InsertEmbedBySnapshotCommand.handler(accessor, undefined)).toBe(false);
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
            kind: 'ref',
            ref: {
                file: { kind: 'self' },
                unit: { selector: 'child-sheet', type: 'sheet' },
            },
        },
        childUnitId: overrides.childUnitId,
        childType: overrides.childType,
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

function createGuestContribution(childType: UniverInstanceType): IEmbedGuestContribution {
    return {
        childType,
        createEmptyUnit: vi.fn(),
    };
}

function createInjector(registry?: EmbedGuestContributionRegistryService, key: object = {}): Pick<import('@univerjs/core').Injector, 'get' | 'has'> {
    return Object.assign(key, {
        has: vi.fn((token: unknown) => Boolean(registry) && token === EmbedGuestContributionRegistryService),
        get: vi.fn((token: unknown) => {
            if (!registry || token !== EmbedGuestContributionRegistryService) {
                throw new Error('unexpected token');
            }

            return registry;
        }),
    }) as unknown as Pick<import('@univerjs/core').Injector, 'get' | 'has'>;
}

function createCommandAccessor(
    creationService: unknown,
    modelService: unknown,
    undoRedoService: unknown,
    instanceService?: unknown,
    capabilityRegistry?: unknown
): IAccessor {
    return {
        get: vi.fn((token: unknown) => {
            if (token === EmbedCreationService) {
                return creationService;
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
            if (token === EmbedCapabilityRegistryService) {
                return capabilityRegistry;
            }

            throw new Error('unexpected token');
        }),
    } as never;
}

function getDescriptorRef(descriptor: IEmbedDescriptor): IResourceRef {
    if (descriptor.source.kind !== 'ref') {
        throw new Error('test descriptor must use a ref source');
    }

    return descriptor.source.ref;
}
