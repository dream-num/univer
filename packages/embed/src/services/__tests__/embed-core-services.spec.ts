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

import type { Injector } from '@univerjs/core';
import type { IEmbedCapability, IEmbedCreateContext, IEmbedDescriptor } from '../../types/embed';
import type { IReferencedUnitLoadResult } from '../embed-resource-ref-provider-registry.service';
import { UniverInstanceType } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { getResourceRefInputKey } from '../../common/resource-ref-input';
import { ReferencedUnitOwnerKind } from '../../types/referenced-unit';
import {
    createDefaultEmbedCapabilities,
    createDefaultEmbedSourceMeta,
    EmbedCapabilityRegistryService,
    flushPendingEmbedCapabilities,
    registerEmbedCapabilities,
} from '../embed-capability-registry.service';
import { EmbedCreationService } from '../embed-creation.service';
import { EmbedNestedGuardService } from '../embed-nested-guard.service';
import {
    createDefaultReferencedUnitFacadeResolvers,
    EmbedReferencedUnitFacadeResolverRegistryService,
    flushPendingReferencedUnitFacadeResolvers,
    registerReferencedUnitFacadeResolvers,
} from '../embed-referenced-unit-api-resolver-registry.service';
import { EmbedReferencedUnitManagerService } from '../embed-referenced-unit-manager.service';
import { EMBED_CHILD_CREATE_OPTIONS, EmbedSourceResolverService } from '../embed-source-resolver.service';

describe('EmbedCapabilityRegistryService', () => {
    it('registers capabilities, rejects duplicates, and builds default source meta', () => {
        const registry = new EmbedCapabilityRegistryService();
        const floatCapability = createCapability({
            mode: 'float',
            layout: 'scroll-contained',
            hostType: UniverInstanceType.UNIVER_DOC,
            childType: UniverInstanceType.UNIVER_SHEET,
            entry: 'docs-custom-block',
        });
        const tabCapability = createCapability({
            mode: 'tab',
            hostType: UniverInstanceType.UNIVER_SHEET,
            childType: UniverInstanceType.UNIVER_SLIDE,
            entry: 'slides-page-list-block',
            menuBehavior: 'host-override',
            renderHost: 'dom',
        });

        expect(createDefaultEmbedCapabilities()).toEqual([]);
        registry.registerMany([floatCapability, tabCapability]);

        expect(registry.getCapability(floatCapability)).toBe(floatCapability);
        expect(registry.list()).toEqual([floatCapability, tabCapability]);
        expect(() => registry.register(floatCapability)).toThrow('Embed capability already registered');
        const sameProductCapability = createCapability({
            hostType: UniverInstanceType.UNIVER_DOC,
            childType: UniverInstanceType.UNIVER_DOC,
            entry: 'docs-custom-block',
        });
        registry.register(sameProductCapability);
        expect(registry.getCapability(sameProductCapability)).toBe(sameProductCapability);

        expect(createDefaultEmbedSourceMeta(floatCapability)).toEqual({
            verticalWheelMode: 'host',
            horizontalWheelMode: 'expand-then-self',
            floating: {
                enabled: true,
                layout: 'scroll-contained',
                fullscreen: true,
            },
            tab: false,
        });
        expect(createDefaultEmbedSourceMeta(tabCapability)).toEqual({
            renderHost: 'dom',
            floating: false,
            tab: {
                enabled: true,
                container: 'slide-page-list',
                replaceHostMenu: true,
                hideHostFxBar: true,
                lockHostRibbon: true,
                thumbnail: true,
            },
        });
    });

    it('queues capabilities until the registry service is available', () => {
        const capability = createCapability();
        const pendingInjector = createCapabilityInjector(undefined);

        registerEmbedCapabilities(pendingInjector, [capability, capability]);
        flushPendingEmbedCapabilities(pendingInjector);

        const registry = new EmbedCapabilityRegistryService();
        const injector = createCapabilityInjector(registry, pendingInjector);

        registerEmbedCapabilities(injector, [capability]);
        flushPendingEmbedCapabilities(injector);
        flushPendingEmbedCapabilities(injector);

        expect(registry.list()).toEqual([capability]);
    });
});

describe('EmbedReferencedUnitFacadeResolverRegistryService', () => {
    it('resolves first-party facade instances through registered facade APIs', () => {
        const workbookFacade = { getId: vi.fn(() => 'workbook-1') };
        const documentFacade = { getId: vi.fn(() => 'doc-1') };
        const univerAPI = {
            getWorkbook: vi.fn(() => workbookFacade),
            getDocument: vi.fn(() => documentFacade),
        };
        const registry = new EmbedReferencedUnitFacadeResolverRegistryService();
        registry.registerMany(createDefaultReferencedUnitFacadeResolvers());

        expect(registry.resolve({
            unitId: 'workbook-1',
            unitType: UniverInstanceType.UNIVER_SHEET,
            injector: {} as Injector,
            univerAPI,
        })).toBe(workbookFacade);
        expect(registry.resolve({
            unitId: 'doc-1',
            unitType: UniverInstanceType.UNIVER_DOC,
            injector: {} as Injector,
            univerAPI,
        })).toBe(documentFacade);
        expect(univerAPI.getWorkbook).toHaveBeenCalledWith('workbook-1');
        expect(univerAPI.getDocument).toHaveBeenCalledWith('doc-1');
    });

    it('rejects missing and conflicting facade resolvers with stable errors', () => {
        const registry = new EmbedReferencedUnitFacadeResolverRegistryService();

        expect(() => registry.resolve({
            unitId: 'slide-1',
            unitType: UniverInstanceType.UNIVER_SLIDE,
            injector: {} as Injector,
            univerAPI: {},
        })).toThrow('REFERENCED_UNIT_FACADE_UNAVAILABLE');

        registry.register({
            registrationId: 'sheet-a',
            unitType: UniverInstanceType.UNIVER_SHEET,
            resolve: () => ({}),
        });
        registry.register({
            registrationId: 'sheet-b',
            unitType: UniverInstanceType.UNIVER_SHEET,
            resolve: () => ({}),
        });

        expect(() => registry.resolve({
            unitId: 'sheet-1',
            unitType: UniverInstanceType.UNIVER_SHEET,
            injector: {} as Injector,
            univerAPI: {},
        })).toThrow('REFERENCED_UNIT_FACADE_RESOLVER_CONFLICT');
    });

    it('queues facade resolvers until the registry service is available', () => {
        const registration = {
            registrationId: 'base-facade',
            unitType: UniverInstanceType.UNIVER_BASE,
            resolve: vi.fn(() => ({ id: 'base-1' })),
        };
        const pendingInjector = createFacadeResolverInjector(undefined);

        registerReferencedUnitFacadeResolvers(pendingInjector, [registration, registration]);
        flushPendingReferencedUnitFacadeResolvers(pendingInjector);

        const registry = new EmbedReferencedUnitFacadeResolverRegistryService();
        const injector = createFacadeResolverInjector(registry, pendingInjector);

        flushPendingReferencedUnitFacadeResolvers(injector);
        expect(registry.list()).toEqual([registration]);
    });
});

describe('EmbedSourceResolverService', () => {
    it('creates an empty child unit through the default unit service', async () => {
        const instanceService = createInstanceService();
        const resolver = new EmbedSourceResolverService(instanceService as never);

        const resolved = await resolver.resolve({
            kind: 'empty',
            unitType: UniverInstanceType.UNIVER_SHEET,
            creationConfig: { id: 'sheet-child', name: 'Sheet Child' },
        });

        expect(instanceService.createUnit).toHaveBeenCalledWith(
            UniverInstanceType.UNIVER_SHEET,
            { id: 'sheet-child', name: 'Sheet Child' },
            EMBED_CHILD_CREATE_OPTIONS
        );
        expect(resolved).toEqual({
            childUnitId: 'sheet-child',
            childType: UniverInstanceType.UNIVER_SHEET,
            source: {
                kind: 'ref',
                unitType: UniverInstanceType.UNIVER_SHEET,
                ref: {
                    file: { kind: 'self' },
                    unit: { selector: 'sheet-child', type: 'sheet' },
                },
            },
        });
    });

    it('uses guest contributions and starts plugins lazily for empty child units', async () => {
        const instanceService = createInstanceService();
        const contribution = {
            createEmptyUnit: vi.fn(() => ({
                unitId: 'doc-child',
                unitType: UniverInstanceType.UNIVER_DOC,
            })),
        };
        const registry = {
            get: vi.fn()
                .mockReturnValueOnce(undefined)
                .mockReturnValueOnce(contribution),
        };
        const pluginService = {
            startPluginsForType: vi.fn(),
        };
        const resolver = new EmbedSourceResolverService(instanceService as never, registry as never, pluginService as never);

        const resolved = await resolver.resolve({
            kind: 'empty',
            unitType: UniverInstanceType.UNIVER_DOC,
        });

        expect(pluginService.startPluginsForType).toHaveBeenCalledWith(UniverInstanceType.UNIVER_DOC);
        expect(contribution.createEmptyUnit).toHaveBeenCalledWith(
            expect.objectContaining({ id: expect.stringMatching(/^embed_/) }),
            EMBED_CHILD_CREATE_OPTIONS
        );
        expect(instanceService.createUnit).not.toHaveBeenCalled();
        expect(resolved.childUnitId).toBe('doc-child');
    });

    it('declares ref sources without materializing them', () => {
        const instanceService = createInstanceService();
        const resolver = new EmbedSourceResolverService(instanceService as never);
        const externalRef = {
            file: { kind: 'uri' as const, uri: 'univer://file-1' },
            unit: { selector: 'remote-sheet', type: 'sheet' as const },
        };

        expect(resolver.resolve({
            kind: 'ref',
            unitType: UniverInstanceType.UNIVER_SHEET,
            ref: externalRef,
        })).toEqual({
            childType: UniverInstanceType.UNIVER_SHEET,
            source: {
                kind: 'ref',
                unitType: UniverInstanceType.UNIVER_SHEET,
                ref: externalRef,
            },
        });
        expect(instanceService.getUnitType).not.toHaveBeenCalled();
    });
});

describe('EmbedReferencedUnitManagerService', () => {
    it('deduplicates concurrent materialization for the same embed owner and records usage', async () => {
        const ref = {
            file: { kind: 'uri' as const, uri: 'univer://file-1' },
            unit: { selector: 'remote-sheet', type: 'sheet' as const },
        };
        let resolveProvider!: (value: IReferencedUnitLoadResult) => void;
        const providerResult = new Promise<IReferencedUnitLoadResult>((resolve) => {
            resolveProvider = resolve;
        });
        const plan = {
            materializationKey: 'referenced-unit:embed-1',
            unitId: 'runtime-sheet-1',
            unitType: UniverInstanceType.UNIVER_SHEET,
        };
        const provider = {
            prepare: vi.fn(() => plan),
            ensure: vi.fn(() => providerResult),
        };
        const providerRegistry = {
            get: vi.fn(() => ({ registrationId: 'uri-provider', match: { fileKinds: ['uri'] }, provider })),
        };
        const manager = new EmbedReferencedUnitManagerService(providerRegistry as never);
        const input = {
            ref,
            owner: {
                kind: ReferencedUnitOwnerKind.Embed,
                unitId: 'host-doc',
                ownerId: 'embed-1',
            },
            createOptions: EMBED_CHILD_CREATE_OPTIONS,
        };

        const first = manager.ensure(input);
        const second = manager.ensure(input);
        expect(provider.prepare).toHaveBeenCalledTimes(2);
        expect(provider.ensure).toHaveBeenCalledTimes(1);
        expect(provider.ensure).toHaveBeenCalledWith({
            ref,
            refKey: getResourceRefInputKey(ref),
            owner: input.owner,
            unitType: UniverInstanceType.UNIVER_SHEET,
            createOptions: EMBED_CHILD_CREATE_OPTIONS,
            plan,
        });

        resolveProvider({
            unitId: 'runtime-sheet-1',
            unitType: UniverInstanceType.UNIVER_SHEET,
        });
        await expect(Promise.all([first.loaded, second.loaded])).resolves.toEqual([{
            ref,
            unitId: 'runtime-sheet-1',
            unitType: UniverInstanceType.UNIVER_SHEET,
        }, {
            ref,
            unitId: 'runtime-sheet-1',
            unitType: UniverInstanceType.UNIVER_SHEET,
        }]);

        const cached = manager.ensure(input);
        await expect(cached.loaded).resolves.toEqual({
            ref,
            unitId: 'runtime-sheet-1',
            unitType: UniverInstanceType.UNIVER_SHEET,
        });
        expect(provider.ensure).toHaveBeenCalledTimes(1);
        expect(manager.list({ owner: input.owner })).toEqual([{
            ref,
            unitId: 'runtime-sheet-1',
            unitType: UniverInstanceType.UNIVER_SHEET,
            usedBy: [{
                kind: ReferencedUnitOwnerKind.Embed,
                unitId: 'host-doc',
                ownerId: 'embed-1',
            }],
        }]);
        expect(manager.getByUnitId('runtime-sheet-1')).toEqual({
            ref,
            unitId: 'runtime-sheet-1',
            unitType: UniverInstanceType.UNIVER_SHEET,
            usedBy: [{
                kind: ReferencedUnitOwnerKind.Embed,
                unitId: 'host-doc',
                ownerId: 'embed-1',
            }],
        });
        expect(manager.findByRef(ref)).toEqual([{
            ref,
            unitId: 'runtime-sheet-1',
            unitType: UniverInstanceType.UNIVER_SHEET,
            usedBy: [{
                kind: ReferencedUnitOwnerKind.Embed,
                unitId: 'host-doc',
                ownerId: 'embed-1',
            }],
        }]);

        first.dispose();
        expect(manager.list({ owner: input.owner })).toEqual([{
            ref,
            unitId: 'runtime-sheet-1',
            unitType: UniverInstanceType.UNIVER_SHEET,
            usedBy: [{
                kind: ReferencedUnitOwnerKind.Embed,
                unitId: 'host-doc',
                ownerId: 'embed-1',
            }],
        }]);
        second.dispose();
        cached.dispose();
        expect(manager.list({ owner: input.owner })).toEqual([]);
        expect(manager.getByUnitId('runtime-sheet-1')).toEqual({
            ref,
            unitId: 'runtime-sheet-1',
            unitType: UniverInstanceType.UNIVER_SHEET,
            usedBy: [],
        });
    });

    it('materializes the same ResourceRef independently for different embed owners', async () => {
        const ref = {
            file: { kind: 'uri' as const, uri: 'univer://file-1' },
            unit: { selector: 'remote-sheet', type: 'sheet' as const },
        };
        const provider = {
            prepare: vi.fn((input: { owner?: { ownerId?: string }; unitType: UniverInstanceType }) => ({
                materializationKey: `referenced-unit:${input.owner?.ownerId}`,
                unitId: `${input.owner?.ownerId}-runtime-sheet`,
                unitType: input.unitType,
            })),
            ensure: vi.fn((input: { plan: { unitId: string; unitType: UniverInstanceType } }) => ({
                unitId: input.plan.unitId,
                unitType: input.plan.unitType,
            })),
        };
        const providerRegistry = {
            get: vi.fn(() => ({ registrationId: 'uri-provider', match: { fileKinds: ['uri'] }, provider })),
        };
        const manager = new EmbedReferencedUnitManagerService(providerRegistry as never);

        await expect(Promise.all([
            manager.ensure({
                ref,
                owner: {
                    kind: ReferencedUnitOwnerKind.Embed,
                    unitId: 'host-doc',
                    ownerId: 'embed-1',
                },
                createOptions: EMBED_CHILD_CREATE_OPTIONS,
            }).loaded,
            manager.ensure({
                ref,
                owner: {
                    kind: ReferencedUnitOwnerKind.Embed,
                    unitId: 'host-doc',
                    ownerId: 'embed-2',
                },
                createOptions: EMBED_CHILD_CREATE_OPTIONS,
            }).loaded,
        ])).resolves.toEqual([{
            ref,
            unitId: 'embed-1-runtime-sheet',
            unitType: UniverInstanceType.UNIVER_SHEET,
        }, {
            ref,
            unitId: 'embed-2-runtime-sheet',
            unitType: UniverInstanceType.UNIVER_SHEET,
        }]);

        expect(provider.ensure).toHaveBeenCalledTimes(2);
        expect(manager.list({ ref })).toEqual([{
            ref,
            unitId: 'embed-1-runtime-sheet',
            unitType: UniverInstanceType.UNIVER_SHEET,
            usedBy: [{
                kind: ReferencedUnitOwnerKind.Embed,
                unitId: 'host-doc',
                ownerId: 'embed-1',
            }],
        }, {
            ref,
            unitId: 'embed-2-runtime-sheet',
            unitType: UniverInstanceType.UNIVER_SHEET,
            usedBy: [{
                kind: ReferencedUnitOwnerKind.Embed,
                unitId: 'host-doc',
                ownerId: 'embed-2',
            }],
        }]);
    });

    it('uses provider materialization keys to share one local unit across owners', async () => {
        const ref = {
            file: { kind: 'uri' as const, uri: 'univer://file-1' },
            unit: { selector: 'remote-sheet', type: 'sheet' as const },
        };
        const plan = {
            materializationKey: 'referenced-unit:shared-ref',
            unitId: 'shared-runtime-sheet',
            unitType: UniverInstanceType.UNIVER_SHEET,
        };
        const provider = {
            prepare: vi.fn(() => plan),
            ensure: vi.fn((input: { plan: { unitId: string; unitType: UniverInstanceType } }) => ({
                unitId: input.plan.unitId,
                unitType: input.plan.unitType,
            })),
        };
        const providerRegistry = {
            get: vi.fn(() => ({ registrationId: 'uri-provider', match: { fileKinds: ['uri'] }, provider })),
        };
        const manager = new EmbedReferencedUnitManagerService(providerRegistry as never);

        await expect(Promise.all([
            manager.ensure({
                ref,
                owner: {
                    kind: ReferencedUnitOwnerKind.Embed,
                    unitId: 'host-doc',
                    ownerId: 'embed-1',
                },
                createOptions: EMBED_CHILD_CREATE_OPTIONS,
            }).loaded,
            manager.ensure({
                ref,
                owner: {
                    kind: ReferencedUnitOwnerKind.Embed,
                    unitId: 'host-doc',
                    ownerId: 'embed-2',
                },
                createOptions: EMBED_CHILD_CREATE_OPTIONS,
            }).loaded,
        ])).resolves.toEqual([{
            ref,
            unitId: 'shared-runtime-sheet',
            unitType: UniverInstanceType.UNIVER_SHEET,
        }, {
            ref,
            unitId: 'shared-runtime-sheet',
            unitType: UniverInstanceType.UNIVER_SHEET,
        }]);

        expect(provider.prepare).toHaveBeenCalledTimes(2);
        expect(provider.ensure).toHaveBeenCalledTimes(1);
        expect(manager.list({ ref })).toEqual([{
            ref,
            unitId: 'shared-runtime-sheet',
            unitType: UniverInstanceType.UNIVER_SHEET,
            usedBy: [{
                kind: ReferencedUnitOwnerKind.Embed,
                unitId: 'host-doc',
                ownerId: 'embed-1',
            }, {
                kind: ReferencedUnitOwnerKind.Embed,
                unitId: 'host-doc',
                ownerId: 'embed-2',
            }],
        }]);
    });

    it('rejects aborted load handles with a load-scoped stable error', async () => {
        const ref = {
            file: { kind: 'uri' as const, uri: 'univer://file-1' },
            unit: { selector: 'remote-sheet', type: 'sheet' as const },
        };
        const plan = {
            materializationKey: 'referenced-unit:aborted',
            unitId: 'runtime-sheet-1',
            unitType: UniverInstanceType.UNIVER_SHEET,
        };
        const provider = {
            prepare: vi.fn(() => plan),
            ensure: vi.fn(() => new Promise<IReferencedUnitLoadResult>(() => {
                // Keep the provider pending so the caller-owned signal decides this handle.
            })),
        };
        const providerRegistry = {
            get: vi.fn(() => ({ registrationId: 'uri-provider', match: { fileKinds: ['uri'] }, provider })),
        };
        const manager = new EmbedReferencedUnitManagerService(providerRegistry as never);
        const abortController = new AbortController();

        const handle = manager.ensure({
            ref,
            signal: abortController.signal,
            createOptions: EMBED_CHILD_CREATE_OPTIONS,
        });
        abortController.abort();

        await expect(handle.loaded).rejects.toThrow('REFERENCED_UNIT_LOAD_ABORTED');
    });

    it('finds string ResourceRef records through canonical locator keys', async () => {
        const plan = {
            materializationKey: 'referenced-unit:child-1',
            unitId: 'runtime-sheet-1',
            unitType: UniverInstanceType.UNIVER_SHEET,
        };
        const provider = {
            prepare: vi.fn(() => plan),
            ensure: vi.fn((input: { plan: { unitId: string; unitType: UniverInstanceType } }) => ({
                unitId: input.plan.unitId,
                unitType: input.plan.unitType,
            })),
        };
        const providerRegistry = {
            get: vi.fn(() => ({ registrationId: 'uri-provider', match: { uriReference: true }, provider })),
        };
        const manager = new EmbedReferencedUnitManagerService(providerRegistry as never);

        await manager.ensure({
            ref: '#unit=child-1',
            unitType: UniverInstanceType.UNIVER_SHEET,
            createOptions: EMBED_CHILD_CREATE_OPTIONS,
        }).loaded;

        expect(manager.findByRef('child-1')).toEqual([{
            ref: '#unit=child-1',
            unitId: 'runtime-sheet-1',
            unitType: UniverInstanceType.UNIVER_SHEET,
            usedBy: [],
        }]);
    });

    it('rejects provider results that do not match the materialization plan', async () => {
        const ref = {
            file: { kind: 'uri' as const, uri: 'univer://file-1' },
            unit: { selector: 'remote-sheet', type: 'sheet' as const },
        };
        const provider = {
            prepare: vi.fn(() => ({
                materializationKey: 'referenced-unit:mismatch',
                unitId: 'planned-runtime-sheet',
                unitType: UniverInstanceType.UNIVER_SHEET,
            })),
            ensure: vi.fn(() => ({
                unitId: 'actual-runtime-sheet',
                unitType: UniverInstanceType.UNIVER_SHEET,
            })),
        };
        const providerRegistry = {
            get: vi.fn(() => ({ registrationId: 'uri-provider', match: { fileKinds: ['uri'] }, provider })),
        };
        const manager = new EmbedReferencedUnitManagerService(providerRegistry as never);

        await expect(manager.ensure({
            ref,
            createOptions: EMBED_CHILD_CREATE_OPTIONS,
        }).loaded).rejects.toThrow('REFERENCED_UNIT_MATERIALIZATION_PLAN_MISMATCH');
    });
});

describe('EmbedNestedGuardService', () => {
    it('rejects nested embeds and unsupported empty child capabilities', () => {
        const capabilityRegistry = {
            getCapability: vi.fn()
                .mockReturnValueOnce(undefined)
                .mockReturnValueOnce(createCapability()),
        };
        const guard = new EmbedNestedGuardService(capabilityRegistry as never);

        expect(() => guard.assertCanCreate({
            ...createCreateContext(),
            parentEmbedId: 'parent-embed',
        })).toThrow('NESTED_EMBED_NOT_SUPPORTED');
        expect(() => guard.assertCanCreate({
            ...createCreateContext(),
            source: {
                kind: 'empty',
                unitType: UniverInstanceType.UNIVER_SLIDE,
            },
        })).toThrow('EMBED_CAPABILITY_NOT_SUPPORTED');
        expect(() => guard.assertCanCreate({
            ...createCreateContext(),
            source: {
                kind: 'empty',
                unitType: UniverInstanceType.UNIVER_SLIDE,
            },
        })).not.toThrow();
        expect(() => guard.assertCanCreate({
            ...createCreateContext(),
            source: {
                kind: 'ref',
                unitType: UniverInstanceType.UNIVER_DOC,
                ref: {
                    file: { kind: 'self' },
                    unit: { selector: 'child-1', type: 'doc' },
                },
            },
        })).not.toThrow();
    });
});

describe('EmbedCreationService', () => {
    it('prepares, creates, copies, and removes embeds through the model', async () => {
        const model = createModel();
        const descriptor = createDescriptor();
        const creationService = new EmbedCreationService(
            model as never,
            { getCapability: vi.fn(() => createCapability()) } as never,
            { resolve: vi.fn(() => ({ childUnitId: descriptor.childUnitId, childType: descriptor.childType, source: descriptor.source })) } as never,
            { assertCanCreate: vi.fn() } as never
        );
        const context = createCreateContext();

        const prepared = creationService.prepareCreateEmbed(context);
        expect(prepared.descriptor).toMatchObject({
            embedId: context.embedId,
            hostAnchorId: context.hostAnchorId,
            childUnitId: descriptor.childUnitId,
        });
        expect(model.addDescriptor).not.toHaveBeenCalled();

        const created = creationService.createEmbed(context);
        expect(model.addDescriptor).toHaveBeenCalledWith(context.hostUnitId, prepared.descriptor);
        expect(created.descriptor).toEqual(prepared.descriptor);

        model.getDescriptor.mockReturnValueOnce(undefined);
        expect(() => creationService.prepareCopyEmbed({
            hostUnitId: 'host-doc',
            sourceEmbedId: 'missing',
            nextEmbedId: 'embed-copy',
            nextHostAnchorId: 'anchor-copy',
        })).toThrow('EMBED_DESCRIPTOR_NOT_FOUND');

        const copied = creationService.copyEmbed({
            hostUnitId: 'host-doc',
            sourceEmbedId: 'embed-1',
            nextEmbedId: 'embed-copy',
            nextHostAnchorId: 'anchor-copy',
        });
        expect(copied).toMatchObject({
            embedId: 'embed-copy',
            hostAnchorId: 'anchor-copy',
            lifecycle: 'active',
            createdAt: undefined,
            updatedAt: undefined,
        });

        creationService.removeEmbed({ hostUnitId: 'host-doc', embedId: 'embed-1' });
        expect(model.softDeleteDescriptor).toHaveBeenCalledWith('host-doc', 'embed-1');
    });

    it('rejects unsupported capabilities and duplicate child units', async () => {
        const descriptor = createDescriptor();
        expect(() => new EmbedCreationService(
            createModel() as never,
            { getCapability: vi.fn(() => undefined) } as never,
            { resolve: vi.fn(() => ({ childUnitId: descriptor.childUnitId, childType: descriptor.childType, source: descriptor.source })) } as never,
            { assertCanCreate: vi.fn() } as never
        ).prepareCreateEmbed(createCreateContext())).toThrow('EMBED_CAPABILITY_NOT_SUPPORTED');

        const model = createModel();
        model.getActiveDescriptorsByChildUnit.mockReturnValueOnce([{
            ...descriptor,
            embedId: 'other',
            hostUnitId: 'other-host',
        }]);
        expect(() => new EmbedCreationService(
            model as never,
            { getCapability: vi.fn(() => createCapability()) } as never,
            { resolve: vi.fn(() => ({ childUnitId: descriptor.childUnitId, childType: descriptor.childType, source: descriptor.source })) } as never,
            { assertCanCreate: vi.fn() } as never
        ).prepareCreateEmbed(createCreateContext())).toThrow('EMBED_CHILD_UNIT_ALREADY_EMBEDDED');
    });
});

function createCapability(overrides: Partial<IEmbedCapability> = {}): IEmbedCapability {
    return {
        hostType: overrides.hostType ?? UniverInstanceType.UNIVER_DOC,
        childType: overrides.childType ?? UniverInstanceType.UNIVER_SHEET,
        entry: overrides.entry ?? 'docs-custom-block',
        mode: overrides.mode ?? 'float',
        layout: overrides.layout ?? 'doc-width-scale',
        menuBehavior: overrides.menuBehavior ?? 'floating',
        renderHost: overrides.renderHost,
        nestedEmbed: overrides.nestedEmbed ?? false,
    };
}

function createCapabilityInjector(registry?: EmbedCapabilityRegistryService, key: object = {}): Pick<Injector, 'get' | 'has'> {
    return Object.assign(key, {
        has: vi.fn((token: unknown) => Boolean(registry) && token === EmbedCapabilityRegistryService),
        get: vi.fn((token: unknown) => {
            if (!registry || token !== EmbedCapabilityRegistryService) {
                throw new Error('unexpected token');
            }

            return registry;
        }),
    }) as unknown as Pick<Injector, 'get' | 'has'>;
}

function createFacadeResolverInjector(registry?: EmbedReferencedUnitFacadeResolverRegistryService, key: object = {}): Pick<Injector, 'get' | 'has'> {
    return Object.assign(key, {
        has: vi.fn((token: unknown) => Boolean(registry) && token === EmbedReferencedUnitFacadeResolverRegistryService),
        get: vi.fn((token: unknown) => {
            if (!registry || token !== EmbedReferencedUnitFacadeResolverRegistryService) {
                throw new Error('unexpected token');
            }

            return registry;
        }),
    }) as unknown as Pick<Injector, 'get' | 'has'>;
}

function createInstanceService() {
    return {
        createUnit: vi.fn((type: UniverInstanceType, config: Record<string, unknown>) => ({
            getUnitId: () => config.id as string,
            type,
        })),
        getUnitType: vi.fn(() => UniverInstanceType.UNRECOGNIZED),
        getUnit: vi.fn((): unknown => null),
    };
}

function createCreateContext(): IEmbedCreateContext {
    return {
        embedId: 'embed-1',
        hostUnitId: 'host-doc',
        hostType: UniverInstanceType.UNIVER_DOC,
        hostAnchorId: 'anchor-1',
        entry: 'docs-custom-block',
        source: {
            kind: 'ref',
            unitType: UniverInstanceType.UNIVER_SHEET,
            ref: {
                file: { kind: 'self' },
                unit: { selector: 'child-sheet', type: 'sheet' },
            },
        },
    };
}

function createModel() {
    const descriptor = createDescriptor();
    const store = new Map<string, IEmbedDescriptor>([
        [descriptor.embedId, descriptor],
    ]);
    return {
        addDescriptor: vi.fn((_hostUnitId: string, nextDescriptor: IEmbedDescriptor) => {
            store.set(nextDescriptor.embedId, nextDescriptor);
        }),
        getDescriptor: vi.fn((_hostUnitId: string, embedId: string) => store.get(embedId)),
        getActiveDescriptorsByChildUnit: vi.fn((): IEmbedDescriptor[] => []),
        softDeleteDescriptor: vi.fn(),
    };
}

function createDescriptor(overrides: Partial<IEmbedDescriptor> = {}): IEmbedDescriptor {
    return {
        embedId: overrides.embedId ?? 'embed-1',
        hostUnitId: overrides.hostUnitId ?? 'host-doc',
        hostType: overrides.hostType ?? UniverInstanceType.UNIVER_DOC,
        hostAnchorId: overrides.hostAnchorId ?? 'anchor-1',
        entry: overrides.entry ?? 'docs-custom-block',
        source: overrides.source ?? {
            kind: 'ref',
            unitType: UniverInstanceType.UNIVER_SHEET,
            ref: {
                file: { kind: 'self' },
                unit: { selector: 'child-sheet', type: 'sheet' },
            },
        },
        childUnitId: overrides.childUnitId ?? 'child-sheet',
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
