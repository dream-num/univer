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
import type { IEmbedResourceRefDataProvider, IEmbedResourceRefUnitProvider, IReferencedUnitLoadResult } from '../embed-resource-ref-provider-registry.service';
import { parseResourceRef, ReferencedUnitDataType, ReferencedUnitErrorCode, UniverInstanceType } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { formatResourceRef } from '../../common/resource-ref-uri';
import {
    createDefaultEmbedCapabilities,
    createDefaultEmbedSourceMeta,
    EmbedCapabilityRegistryService,
    flushPendingEmbedCapabilities,
    registerEmbedCapabilities,
} from '../embed-capability-registry.service';
import { EmbedCreationService } from '../embed-creation.service';
import { createLocalRuntimeResourceRefUnitProviderRegistration, EmbedLocalRuntimeResourceRefUnitProvider, LOCAL_RUNTIME_RESOURCE_REF_PROVIDER_PRIORITY, LOCAL_RUNTIME_RESOURCE_REF_UNIT_PROVIDER_ID } from '../embed-local-runtime-resource-ref-provider';
import { EmbedNestedGuardService } from '../embed-nested-guard.service';
import {
    createDefaultReferencedUnitApiResolvers,
    EmbedReferencedUnitApiResolverRegistryService,
    flushPendingReferencedUnitApiResolvers,
    registerReferencedUnitApiResolvers,
} from '../embed-referenced-unit-api-resolver-registry.service';
import { EmbedReferencedUnitManagerService } from '../embed-referenced-unit-manager.service';
import { EmbedResourceRefProviderRegistryService } from '../embed-resource-ref-provider-registry.service';
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

describe('EmbedReferencedUnitApiResolverRegistryService', () => {
    it('resolves first-party API instances through registered APIs', () => {
        const workbookFacade = { getId: vi.fn(() => 'workbook-1') };
        const documentFacade = { getId: vi.fn(() => 'doc-1') };
        const univerAPI = {
            getWorkbook: vi.fn(() => workbookFacade),
            getDocument: vi.fn(() => documentFacade),
        };
        const registry = new EmbedReferencedUnitApiResolverRegistryService();
        registry.registerMany(createDefaultReferencedUnitApiResolvers());

        expect(registry.resolve({
            unitId: 'workbook-1',
            unitType: UniverInstanceType.UNIVER_SHEET,
            injector: {} as Injector,
            api: univerAPI,
        })).toBe(workbookFacade);
        expect(registry.resolve({
            unitId: 'doc-1',
            unitType: UniverInstanceType.UNIVER_DOC,
            injector: {} as Injector,
            api: univerAPI,
        })).toBe(documentFacade);
        expect(univerAPI.getWorkbook).toHaveBeenCalledWith('workbook-1');
        expect(univerAPI.getDocument).toHaveBeenCalledWith('doc-1');
    });

    it('rejects missing and conflicting API resolvers with stable errors', () => {
        const registry = new EmbedReferencedUnitApiResolverRegistryService();

        expect(() => registry.resolve({
            unitId: 'slide-1',
            unitType: UniverInstanceType.UNIVER_SLIDE,
            injector: {} as Injector,
            api: {},
        })).toThrow('REFERENCED_UNIT_API_UNAVAILABLE');

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
            api: {},
        })).toThrow('REFERENCED_UNIT_API_RESOLVER_CONFLICT');
    });

    it('queues API resolvers until the registry service is available', () => {
        const registration = {
            registrationId: 'base-api',
            unitType: UniverInstanceType.UNIVER_BASE,
            resolve: vi.fn(() => ({ id: 'base-1' })),
        };
        const pendingInjector = createApiResolverInjector(undefined);

        registerReferencedUnitApiResolvers(pendingInjector, [registration, registration]);
        flushPendingReferencedUnitApiResolvers(pendingInjector);

        const registry = new EmbedReferencedUnitApiResolverRegistryService();
        const injector = createApiResolverInjector(registry, pendingInjector);

        flushPendingReferencedUnitApiResolvers(injector);
        expect(registry.list()).toEqual([registration]);
    });
});

describe('EmbedSourceResolverService', () => {
    it('declares ref sources without materializing them', () => {
        const resolver = new EmbedSourceResolverService();
        const selfRef = {
            file: { kind: 'self' as const },
            unit: { selector: 'local-sheet', type: 'sheet' as const },
        };
        const canonicalSelfRef = formatResourceRef(selfRef);

        expect(resolver.resolve({
            unitType: UniverInstanceType.UNIVER_SHEET,
            creationConfig: { id: 'local-sheet', name: 'Sheet Child' },
            ref: selfRef,
        })).toEqual({
            childType: UniverInstanceType.UNIVER_SHEET,
            source: {
                unitType: UniverInstanceType.UNIVER_SHEET,
                creationConfig: { id: 'local-sheet', name: 'Sheet Child' },
                ref: canonicalSelfRef,
            },
        });

        expect(() => resolver.resolve({
            unitType: UniverInstanceType.UNIVER_SHEET,
            ref: 'string-sheet',
        })).toThrow('INVALID_URI_REFERENCE');
    });
});

describe('EmbedLocalRuntimeResourceRefUnitProvider', () => {
    it('resolves canonical self unit refs from existing runtime units', () => {
        const instanceService = createInstanceService();
        instanceService.getUnit.mockReturnValue({ getUnitId: () => 'child-sheet' });
        const provider = new EmbedLocalRuntimeResourceRefUnitProvider(instanceService as never);
        const registration = createLocalRuntimeResourceRefUnitProviderRegistration(provider);
        const ref = parseResourceRef('#unit=child-sheet&type=sheet');

        expect(registration.registrationId).toBe(LOCAL_RUNTIME_RESOURCE_REF_UNIT_PROVIDER_ID);
        expect(registration.match).toEqual({
            fileKinds: ['self'],
            unitTypes: ['sheet', 'doc', 'slide', 'base'],
        });
        expect(registration.priority).toBe(LOCAL_RUNTIME_RESOURCE_REF_PROVIDER_PRIORITY);
        expect(registration.provider.ensureUnit({
            ref,
            unitType: UniverInstanceType.UNIVER_SHEET,
            createOptions: EMBED_CHILD_CREATE_OPTIONS,
        })).toEqual({
            unitId: 'child-sheet',
            unitType: UniverInstanceType.UNIVER_SHEET,
        });
        expect(instanceService.getUnit).toHaveBeenCalledWith('child-sheet', UniverInstanceType.UNIVER_SHEET);
        expect(instanceService.getUnit).toHaveBeenCalledTimes(1);
    });

    it('rejects missing runtime units and unit type mismatches', () => {
        const instanceService = createInstanceService();
        const provider = new EmbedLocalRuntimeResourceRefUnitProvider(instanceService as never);
        const ref = parseResourceRef('#unit=child-sheet&type=sheet');

        expect(() => provider.ensureUnit({
            ref,
            unitType: UniverInstanceType.UNIVER_DOC,
            createOptions: EMBED_CHILD_CREATE_OPTIONS,
        })).toThrow('LOCAL_RUNTIME_RESOURCE_REF_UNIT_TYPE_MISMATCH');
        expect(() => provider.ensureUnit({
            ref,
            unitType: UniverInstanceType.UNIVER_SHEET,
            createOptions: EMBED_CHILD_CREATE_OPTIONS,
        })).toThrow('LOCAL_RUNTIME_RESOURCE_REF_UNIT_NOT_FOUND');
    });

    it('lets higher priority unit providers own shared unit locator rules', () => {
        const instanceService = createInstanceService();
        const localRegistration = createLocalRuntimeResourceRefUnitProviderRegistration(new EmbedLocalRuntimeResourceRefUnitProvider(instanceService as never));
        const highPriorityRegistration = {
            registrationId: 'collaboration-unit-provider',
            match: {
                fileKinds: ['self' as const],
                unitTypes: ['sheet' as const],
            },
            priority: 100,
            provider: {
                ensureUnit: vi.fn((input) => ({
                    unitId: 'remote-sheet',
                    unitType: input.unitType,
                })),
            },
        };
        const registry = new EmbedResourceRefProviderRegistryService();
        registry.registerUnitProvider(localRegistration);
        registry.registerUnitProvider(highPriorityRegistration);

        expect(registry.getUnitProvider({
            file: { kind: 'self' },
            unit: { selector: 'local-sheet', type: 'sheet' },
        }, 'sheet')).toBe(highPriorityRegistration);
        expect(registry.getUnitProvider({
            file: { kind: 'uri', uri: 'univer://remote-file' },
            unit: { selector: 'remote-sheet', type: 'sheet' },
        }, 'sheet')).toBeUndefined();
    });
});

describe('EmbedReferencedUnitManagerService', () => {
    it('reuses pending loads for the same ResourceRef', async () => {
        const ref = '#unit=remote-sheet&type=sheet';
        let resolveLoad!: (value: IReferencedUnitLoadResult) => void;
        const provider: IEmbedResourceRefUnitProvider = {
            ensureUnit: vi.fn((input) => new Promise<IReferencedUnitLoadResult>((resolve) => {
                resolveLoad = () => resolve({ unitId: 'runtime-sheet-1', unitType: input.unitType });
            })),
        };
        const manager = createReferencedUnitManager(provider);

        const first = manager.ensure(ref, { createOptions: EMBED_CHILD_CREATE_OPTIONS });
        const second = manager.ensure(ref, { createOptions: EMBED_CHILD_CREATE_OPTIONS });
        await Promise.resolve();
        expect(provider.ensureUnit).toHaveBeenCalledTimes(1);
        resolveLoad({ unitId: 'runtime-sheet-1', unitType: UniverInstanceType.UNIVER_SHEET });

        await expect(Promise.all([first, second])).resolves.toEqual([{
            ref,
            unitId: 'runtime-sheet-1',
            unitType: UniverInstanceType.UNIVER_SHEET,
        }, {
            ref,
            unitId: 'runtime-sheet-1',
            unitType: UniverInstanceType.UNIVER_SHEET,
        }]);
    });

    it('rejects aborted load promises with a load-scoped stable error', async () => {
        const ref = '#unit=remote-sheet&type=sheet';
        const provider: IEmbedResourceRefUnitProvider = {
            ensureUnit: vi.fn(() => new Promise<IReferencedUnitLoadResult>(() => {
                // Keep the provider pending so the caller-owned signal decides this await.
            })),
        };
        const manager = createReferencedUnitManager(provider);
        const abortController = new AbortController();

        const loaded = manager.ensure(
            ref,
            {
                signal: abortController.signal,
                createOptions: EMBED_CHILD_CREATE_OPTIONS,
            }
        );
        abortController.abort();

        await expect(loaded).rejects.toThrow('REFERENCED_UNIT_LOAD_ABORTED');
        expect(provider.ensureUnit).toHaveBeenCalledWith({
            ref: parseResourceRef(ref),
            unitType: UniverInstanceType.UNIVER_SHEET,
            createOptions: EMBED_CHILD_CREATE_OPTIONS,
            signal: abortController.signal,
        });
    });

    it('rejects request and provider unit type mismatches with structured error codes', async () => {
        const ref = '#unit=remote-sheet&type=sheet';
        const provider: IEmbedResourceRefUnitProvider = {
            ensureUnit: vi.fn(() => ({
                unitId: 'actual-runtime-sheet',
                unitType: UniverInstanceType.UNIVER_DOC,
            })),
        };
        const manager = createReferencedUnitManager(provider);

        expect(() => manager.ensure(
            ref,
            {
                unitType: UniverInstanceType.UNIVER_DOC,
                createOptions: EMBED_CHILD_CREATE_OPTIONS,
            }
        )).toThrow(ReferencedUnitErrorCode.UnitTypeMismatch);

        await expect(manager.ensure(
            ref,
            {
                createOptions: EMBED_CHILD_CREATE_OPTIONS,
            }
        )).rejects.toThrow(ReferencedUnitErrorCode.UnitTypeMismatch);
    });

    it('routes readData to the selected data provider and requires a range selector', async () => {
        const provider: IEmbedResourceRefUnitProvider = {
            ensureUnit: vi.fn((input) => ({ unitId: 'runtime-sheet', unitType: input.unitType })),
        };
        const dataProvider: IEmbedResourceRefDataProvider = {
            readData: vi.fn(() => ({
                type: ReferencedUnitDataType.RANGE,
                values: [[1]],
            })),
        };
        const manager = createReferencedUnitManager(provider, dataProvider);

        await expect(manager.readData('#unit=remote-sheet&type=sheet')).rejects.toThrow(ReferencedUnitErrorCode.MissingDataSelector);
        await expect(manager.readData({
            ...parseResourceRef('#unit=remote-sheet&type=sheet'),
            part: { kind: 'range', ref: 'Sheet1!A1', sheetName: 'Sheet1', range: 'A1' },
        })).resolves.toEqual({
            type: ReferencedUnitDataType.RANGE,
            values: [[1]],
        });
        expect(dataProvider.readData).toHaveBeenCalledWith(expect.objectContaining({
            unitType: UniverInstanceType.UNIVER_SHEET,
            dataType: ReferencedUnitDataType.RANGE,
            selector: { kind: 'range', ref: 'Sheet1!A1', sheetName: 'Sheet1', range: 'A1' },
        }));
    });
});

describe('EmbedNestedGuardService', () => {
    it('rejects nested embeds and accepts ResourceRef create contexts', () => {
        const guard = new EmbedNestedGuardService();

        expect(() => guard.assertCanCreate({
            ...createCreateContext(),
            parentEmbedId: 'parent-embed',
        })).toThrow('NESTED_EMBED_NOT_SUPPORTED');
        expect(() => guard.assertCanCreate(createCreateContext())).not.toThrow();
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
            childUnitId: undefined,
            lifecycle: 'active',
            createdAt: undefined,
            updatedAt: undefined,
        });

        creationService.removeEmbed({ hostUnitId: 'host-doc', embedId: 'embed-1' });
        expect(model.softDeleteDescriptor).toHaveBeenCalledWith('host-doc', 'embed-1');
    });

    it('rejects unsupported capabilities and leaves child unit ownership to materialization', async () => {
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
        ).prepareCreateEmbed(createCreateContext())).not.toThrow();
        expect(model.getActiveDescriptorsByChildUnit).not.toHaveBeenCalled();
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

function createApiResolverInjector(registry?: EmbedReferencedUnitApiResolverRegistryService, key: object = {}): Pick<Injector, 'get' | 'has'> {
    return Object.assign(key, {
        has: vi.fn((token: unknown) => Boolean(registry) && token === EmbedReferencedUnitApiResolverRegistryService),
        get: vi.fn((token: unknown) => {
            if (!registry || token !== EmbedReferencedUnitApiResolverRegistryService) {
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

function createReferencedUnitManager(
    unitProvider: IEmbedResourceRefUnitProvider,
    dataProvider?: IEmbedResourceRefDataProvider
): EmbedReferencedUnitManagerService {
    const registry = new EmbedResourceRefProviderRegistryService();
    registry.registerUnitProvider({
        registrationId: 'test-unit-provider',
        match: {
            fileKinds: ['self'],
            unitTypes: ['sheet', 'doc', 'slide', 'base'],
        },
        provider: unitProvider,
    });
    if (dataProvider) {
        registry.registerDataProvider({
            registrationId: 'test-data-provider',
            match: {
                fileKinds: ['self'],
                unitTypes: ['sheet'],
            },
            provider: dataProvider,
        });
    }

    return new EmbedReferencedUnitManagerService(registry);
}

function createCreateContext(): IEmbedCreateContext {
    return {
        embedId: 'embed-1',
        hostUnitId: 'host-doc',
        hostType: UniverInstanceType.UNIVER_DOC,
        hostAnchorId: 'anchor-1',
        entry: 'docs-custom-block',
        source: {
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
