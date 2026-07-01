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
import { IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
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
import { createLocalRuntimeResourceRefProvider, LOCAL_RUNTIME_RESOURCE_REF_PROVIDER_ID, LOCAL_RUNTIME_RESOURCE_REF_PROVIDER_PRIORITY } from '../embed-local-runtime-resource-ref-provider';
import { EmbedNestedGuardService } from '../embed-nested-guard.service';
import {
    createDefaultReferencedUnitFacadeResolvers,
    EmbedReferencedUnitFacadeResolverRegistryService,
    flushPendingReferencedUnitFacadeResolvers,
    registerReferencedUnitFacadeResolvers,
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
    it('declares ref sources without materializing them', () => {
        const resolver = new EmbedSourceResolverService();
        const selfRef = {
            file: { kind: 'self' as const },
            unit: { selector: 'local-sheet', type: 'sheet' as const },
        };
        const externalRef = {
            file: { kind: 'uri' as const, uri: 'univer://file-1' },
            unit: { selector: 'remote-sheet', type: 'sheet' as const },
        };
        const relativeRef = {
            file: { kind: 'relative' as const, path: './book.univer' },
            unit: { selector: 'relative-sheet', type: 'sheet' as const },
        };

        expect(resolver.resolve({
            unitType: UniverInstanceType.UNIVER_SHEET,
            ref: selfRef,
        })).toEqual({
            childUnitId: 'local-sheet',
            childType: UniverInstanceType.UNIVER_SHEET,
            ref: selfRef,
        });

        expect(resolver.resolve({
            unitType: UniverInstanceType.UNIVER_SHEET,
            ref: externalRef,
        })).toEqual({
            childType: UniverInstanceType.UNIVER_SHEET,
            ref: externalRef,
        });
        expect(resolver.resolve({
            unitType: UniverInstanceType.UNIVER_SHEET,
            ref: relativeRef,
        })).not.toHaveProperty('childUnitId');
        expect(resolver.resolve({
            unitType: UniverInstanceType.UNIVER_SHEET,
            ref: 'string-sheet',
        })).not.toHaveProperty('childUnitId');
    });

    it('rejects refs whose unit type does not match the declared child type', () => {
        const resolver = new EmbedSourceResolverService();

        expect(() => resolver.resolve({
            unitType: UniverInstanceType.UNIVER_DOC,
            ref: {
                file: { kind: 'self' },
                unit: { selector: 'local-sheet', type: 'sheet' },
            },
        })).toThrow('EMBED_SOURCE_TYPE_MISMATCH');
    });
});

describe('createLocalRuntimeResourceRefProvider', () => {
    it('resolves self refs and unit locators from existing runtime units', () => {
        const instanceService = createInstanceService();
        instanceService.getUnit.mockReturnValue({ getUnitId: () => 'child-sheet' });
        const registration = createLocalRuntimeResourceRefProvider(createLocalRuntimeProviderInjector(instanceService) as Injector);
        const ref = {
            file: { kind: 'self' as const },
            unit: { selector: 'child-sheet', type: 'sheet' as const },
        };

        expect(registration.registrationId).toBe(LOCAL_RUNTIME_RESOURCE_REF_PROVIDER_ID);
        expect(registration.match).toEqual({
            uriReference: true,
            fileKinds: ['self'],
            unitTypes: ['sheet', 'doc', 'slide', 'base'],
        });
        expect(registration.priority).toBe(LOCAL_RUNTIME_RESOURCE_REF_PROVIDER_PRIORITY);
        expect(registration.provider.ensure({
            ref,
            refKey: getResourceRefInputKey(ref),
            unitType: UniverInstanceType.UNIVER_SHEET,
            createOptions: EMBED_CHILD_CREATE_OPTIONS,
        })).toEqual({
            unitId: 'child-sheet',
        });
        expect(instanceService.getUnit).toHaveBeenCalledWith('child-sheet', UniverInstanceType.UNIVER_SHEET);

        expect(registration.provider.ensure({
            ref: '#unit=child-sheet',
            refKey: getResourceRefInputKey('#unit=child-sheet'),
            unitType: UniverInstanceType.UNIVER_SHEET,
            createOptions: EMBED_CHILD_CREATE_OPTIONS,
        })).toEqual({
            unitId: 'child-sheet',
        });
        expect(registration.provider.ensure({
            ref: 'child-sheet',
            refKey: getResourceRefInputKey('child-sheet'),
            unitType: UniverInstanceType.UNIVER_SHEET,
            createOptions: EMBED_CHILD_CREATE_OPTIONS,
        })).toEqual({
            unitId: 'child-sheet',
        });
        expect(instanceService.getUnit).toHaveBeenCalledTimes(3);
    });

    it('rejects unsupported refs, missing runtime units, and unit type mismatches', () => {
        const instanceService = createInstanceService();
        const provider = createLocalRuntimeResourceRefProvider(createLocalRuntimeProviderInjector(instanceService) as Injector).provider;
        const selfRef = {
            file: { kind: 'self' as const },
            unit: { selector: 'child-sheet', type: 'sheet' as const },
        };

        expect(() => provider.ensure({
            ref: {
                file: { kind: 'uri' as const, uri: 'univer://file-1' },
                unit: { selector: 'child-sheet', type: 'sheet' as const },
            },
            refKey: 'uri-ref',
            unitType: UniverInstanceType.UNIVER_SHEET,
            createOptions: EMBED_CHILD_CREATE_OPTIONS,
        })).toThrow('LOCAL_RUNTIME_RESOURCE_REF_UNSUPPORTED');
        expect(() => provider.ensure({
            ref: selfRef,
            refKey: getResourceRefInputKey(selfRef),
            unitType: UniverInstanceType.UNIVER_DOC,
            createOptions: EMBED_CHILD_CREATE_OPTIONS,
        })).toThrow('LOCAL_RUNTIME_RESOURCE_REF_UNIT_TYPE_MISMATCH');
        expect(() => provider.ensure({
            ref: selfRef,
            refKey: getResourceRefInputKey(selfRef),
            unitType: UniverInstanceType.UNIVER_SHEET,
            createOptions: EMBED_CHILD_CREATE_OPTIONS,
        })).toThrow('LOCAL_RUNTIME_RESOURCE_REF_UNIT_NOT_FOUND');
    });

    it('lets higher priority providers own shared unit locator rules', () => {
        const instanceService = createInstanceService();
        const localRegistration = createLocalRuntimeResourceRefProvider(createLocalRuntimeProviderInjector(instanceService) as Injector);
        const uriRegistration = {
            registrationId: 'univer-uri-provider',
            match: {
                uriReference: true,
                fileKinds: ['uri' as const],
                uriSchemes: ['univer'],
                unitTypes: ['sheet' as const],
            },
            priority: 100,
            provider: {
                ensure: vi.fn((input) => ({
                    unitId: 'remote-sheet',
                })),
            },
        };
        const registry = new EmbedResourceRefProviderRegistryService();
        registry.register(localRegistration);
        registry.register(uriRegistration);

        expect(registry.get({
            file: { kind: 'self' },
            unit: { selector: 'local-sheet', type: 'sheet' },
        }, 'sheet')).toBe(localRegistration);
        expect(registry.get({
            file: { kind: 'uri', uri: 'univer://remote-file' },
            unit: { selector: 'remote-sheet', type: 'sheet' },
        }, 'sheet')).toBe(uriRegistration);
        expect(registry.get('#unit=sheet-1', 'sheet')).toBe(localRegistration);
    });
});

describe('EmbedReferencedUnitManagerService', () => {
    it('calls provider ensure with a single-stage load input and records owner usage', async () => {
        const ref = {
            file: { kind: 'uri' as const, uri: 'univer://file-1' },
            unit: { selector: 'remote-sheet', type: 'sheet' as const },
        };
        const provider = {
            ensure: vi.fn((input) => ({
                unitId: 'runtime-sheet-1',
            })),
        };
        const providerRegistry = {
            get: vi.fn(() => ({ registrationId: 'uri-provider', match: { fileKinds: ['uri'] }, provider })),
        };
        const manager = new EmbedReferencedUnitManagerService(createReferencedUnitInstanceService() as never, providerRegistry as never);
        const input = {
            ref,
            owner: {
                kind: ReferencedUnitOwnerKind.Embed,
                unitId: 'host-doc',
                ownerId: 'embed-1',
            },
            createOptions: EMBED_CHILD_CREATE_OPTIONS,
        };

        const handle = manager.ensure(input);
        await expect(handle.loaded).resolves.toEqual({
            ref,
            unitId: 'runtime-sheet-1',
            unitType: UniverInstanceType.UNIVER_SHEET,
        });
        expect(provider.ensure).toHaveBeenCalledWith({
            ref,
            refKey: getResourceRefInputKey(ref),
            owner: input.owner,
            unitType: UniverInstanceType.UNIVER_SHEET,
            createOptions: EMBED_CHILD_CREATE_OPTIONS,
            signal: undefined,
        });
        expect(getStoredReferencedUnitRecords(manager)).toEqual([{
            ref,
            unitId: 'runtime-sheet-1',
            unitType: UniverInstanceType.UNIVER_SHEET,
            usedBy: [{
                kind: ReferencedUnitOwnerKind.Embed,
                unitId: 'host-doc',
                ownerId: 'embed-1',
            }],
        }]);

        handle.dispose();
        expect(getStoredReferencedUnitRecords(manager)).toEqual([]);
    });

    it('lets the provider own reuse policy across owners', async () => {
        const ref = {
            file: { kind: 'uri' as const, uri: 'univer://file-1' },
            unit: { selector: 'remote-sheet', type: 'sheet' as const },
        };
        const provider = {
            ensure: vi.fn((input) => ({
                unitId: input.owner?.ownerId === 'embed-1' ? 'embed-1-runtime-sheet' : 'embed-2-runtime-sheet',
            })),
        };
        const providerRegistry = {
            get: vi.fn(() => ({ registrationId: 'uri-provider', match: { fileKinds: ['uri'] }, provider })),
        };
        const manager = new EmbedReferencedUnitManagerService(createReferencedUnitInstanceService() as never, providerRegistry as never);

        const first = manager.ensure({
            ref,
            owner: {
                kind: ReferencedUnitOwnerKind.Embed,
                unitId: 'host-doc',
                ownerId: 'embed-1',
            },
            createOptions: EMBED_CHILD_CREATE_OPTIONS,
        });
        const second = manager.ensure({
            ref,
            owner: {
                kind: ReferencedUnitOwnerKind.Embed,
                unitId: 'host-doc',
                ownerId: 'embed-2',
            },
            createOptions: EMBED_CHILD_CREATE_OPTIONS,
        });

        await expect(Promise.all([first.loaded, second.loaded])).resolves.toEqual([{
            ref,
            unitId: 'embed-1-runtime-sheet',
            unitType: UniverInstanceType.UNIVER_SHEET,
        }, {
            ref,
            unitId: 'embed-2-runtime-sheet',
            unitType: UniverInstanceType.UNIVER_SHEET,
        }]);
        expect(provider.ensure).toHaveBeenCalledTimes(2);
        expect(getStoredReferencedUnitRecords(manager)).toEqual([{
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

    it('records shared provider results under the same runtime fact', async () => {
        const ref = {
            file: { kind: 'uri' as const, uri: 'univer://file-1' },
            unit: { selector: 'remote-sheet', type: 'sheet' as const },
        };
        const provider = {
            ensure: vi.fn((input) => ({
                unitId: 'shared-runtime-sheet',
            })),
        };
        const providerRegistry = {
            get: vi.fn(() => ({ registrationId: 'uri-provider', match: { fileKinds: ['uri'] }, provider })),
        };
        const manager = new EmbedReferencedUnitManagerService(createReferencedUnitInstanceService() as never, providerRegistry as never);

        await Promise.all([
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
        ]);

        expect(provider.ensure).toHaveBeenCalledTimes(2);
        expect(getStoredReferencedUnitRecords(manager)).toEqual([{
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
        const provider = {
            ensure: vi.fn(() => new Promise<IReferencedUnitLoadResult>(() => {
                // Keep the provider pending so the caller-owned signal decides this handle.
            })),
        };
        const providerRegistry = {
            get: vi.fn(() => ({ registrationId: 'uri-provider', match: { fileKinds: ['uri'] }, provider })),
        };
        const manager = new EmbedReferencedUnitManagerService(createReferencedUnitInstanceService() as never, providerRegistry as never);
        const abortController = new AbortController();

        const handle = manager.ensure({
            ref,
            signal: abortController.signal,
            createOptions: EMBED_CHILD_CREATE_OPTIONS,
        });
        abortController.abort();

        await expect(handle.loaded).rejects.toThrow('REFERENCED_UNIT_LOAD_ABORTED');
        expect(provider.ensure).toHaveBeenCalledWith({
            ref,
            refKey: getResourceRefInputKey(ref),
            owner: undefined,
            unitType: UniverInstanceType.UNIVER_SHEET,
            createOptions: EMBED_CHILD_CREATE_OPTIONS,
            signal: abortController.signal,
        });
    });

    it('loads string ResourceRef records through canonical locator keys', async () => {
        const provider = {
            ensure: vi.fn((input) => ({
                unitId: 'runtime-sheet-1',
            })),
        };
        const providerRegistry = {
            get: vi.fn(() => ({ registrationId: 'uri-provider', match: { uriReference: true }, provider })),
        };
        const manager = new EmbedReferencedUnitManagerService(createReferencedUnitInstanceService() as never, providerRegistry as never);

        await manager.ensure({
            ref: '#unit=child-1',
            unitType: UniverInstanceType.UNIVER_SHEET,
            createOptions: EMBED_CHILD_CREATE_OPTIONS,
        }).loaded;

        expect(provider.ensure).toHaveBeenCalledWith({
            ref: '#unit=child-1',
            refKey: getResourceRefInputKey('#unit=child-1'),
            owner: undefined,
            unitType: UniverInstanceType.UNIVER_SHEET,
            createOptions: EMBED_CHILD_CREATE_OPTIONS,
            signal: undefined,
        });
    });

    it('rejects request unit type mismatches with a referenced-unit stable error', () => {
        const ref = {
            file: { kind: 'uri' as const, uri: 'univer://file-1' },
            unit: { selector: 'remote-sheet', type: 'sheet' as const },
        };
        const providerRegistry = {
            get: vi.fn(),
        };
        const manager = new EmbedReferencedUnitManagerService(createReferencedUnitInstanceService() as never, providerRegistry as never);

        expect(() => manager.ensure({
            ref,
            unitType: UniverInstanceType.UNIVER_DOC,
            createOptions: EMBED_CHILD_CREATE_OPTIONS,
        })).toThrow('REFERENCED_UNIT_UNIT_TYPE_MISMATCH');
        expect(providerRegistry.get).not.toHaveBeenCalled();
    });

    it('rejects provider results that do not match the requested unit type', async () => {
        const ref = {
            file: { kind: 'uri' as const, uri: 'univer://file-1' },
            unit: { selector: 'remote-sheet', type: 'sheet' as const },
        };
        const provider = {
            ensure: vi.fn(() => ({
                unitId: 'actual-runtime-sheet',
            })),
        };
        const providerRegistry = {
            get: vi.fn(() => ({ registrationId: 'uri-provider', match: { fileKinds: ['uri'] }, provider })),
        };
        const manager = new EmbedReferencedUnitManagerService(createReferencedUnitInstanceService(UniverInstanceType.UNIVER_DOC) as never, providerRegistry as never);

        await expect(manager.ensure({
            ref,
            createOptions: EMBED_CHILD_CREATE_OPTIONS,
        }).loaded).rejects.toThrow('REFERENCED_UNIT_UNIT_TYPE_MISMATCH');
    });

    it('keeps failed loads out of usage records', async () => {
        const ref = {
            file: { kind: 'uri' as const, uri: 'univer://file-1' },
            unit: { selector: 'remote-sheet', type: 'sheet' as const },
        };
        const provider = {
            ensure: vi.fn(() => Promise.reject(new Error('load failed'))),
        };
        const providerRegistry = {
            get: vi.fn(() => ({ registrationId: 'uri-provider', match: { fileKinds: ['uri'] }, provider })),
        };
        const manager = new EmbedReferencedUnitManagerService(createReferencedUnitInstanceService() as never, providerRegistry as never);
        const handle = manager.ensure({
            ref,
            createOptions: EMBED_CHILD_CREATE_OPTIONS,
        });

        await expect(handle.loaded).rejects.toThrow('load failed');
        expect(getStoredReferencedUnitRecords(manager)).toEqual([]);
    });
});

describe('EmbedNestedGuardService', () => {
    it('rejects nested embeds and unsupported ref child capabilities', () => {
        const capabilityRegistry = {
            getCapability: vi.fn()
                .mockReturnValueOnce(undefined)
                .mockReturnValueOnce(createCapability({
                    childType: UniverInstanceType.UNIVER_SLIDE,
                }))
                .mockReturnValueOnce(createCapability({
                    childType: UniverInstanceType.UNIVER_DOC,
                })),
        };
        const guard = new EmbedNestedGuardService(capabilityRegistry as never);

        expect(() => guard.assertCanCreate({
            ...createCreateContext(),
            parentEmbedId: 'parent-embed',
        })).toThrow('NESTED_EMBED_NOT_SUPPORTED');
        expect(() => guard.assertCanCreate({
            ...createCreateContext(),
            source: {
                unitType: UniverInstanceType.UNIVER_SLIDE,
                ref: {
                    file: { kind: 'self' },
                    unit: { selector: 'child-slide', type: 'slide' },
                },
            },
        })).toThrow('EMBED_CAPABILITY_NOT_SUPPORTED');
        expect(() => guard.assertCanCreate({
            ...createCreateContext(),
            source: {
                unitType: UniverInstanceType.UNIVER_SLIDE,
                ref: {
                    file: { kind: 'self' },
                    unit: { selector: 'child-slide', type: 'slide' },
                },
            },
        })).not.toThrow();
        expect(() => guard.assertCanCreate({
            ...createCreateContext(),
            source: {
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
            { resolve: vi.fn(() => ({ childUnitId: descriptor.childUnitId, childType: descriptor.childType, ref: descriptor.ref })) } as never,
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
            { resolve: vi.fn(() => ({ childUnitId: descriptor.childUnitId, childType: descriptor.childType, ref: descriptor.ref })) } as never,
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
            { resolve: vi.fn(() => ({ childUnitId: descriptor.childUnitId, childType: descriptor.childType, ref: descriptor.ref })) } as never,
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

function createLocalRuntimeProviderInjector(instanceService: ReturnType<typeof createInstanceService>): Pick<Injector, 'get'> {
    return {
        get: vi.fn((token: unknown) => {
            if (token !== IUniverInstanceService) {
                throw new Error('unexpected token');
            }

            return instanceService;
        }),
    } as unknown as Pick<Injector, 'get'>;
}

function getStoredReferencedUnitRecords(manager: EmbedReferencedUnitManagerService) {
    return [...(manager as unknown as {
        _records: Map<string, {
            ref: unknown;
            unitId: string;
            unitType: UniverInstanceType;
            usedBy: Array<{ kind: ReferencedUnitOwnerKind; unitId?: string; ownerId?: string }>;
        }>;
    })._records.values()].map((record) => ({
        ref: record.ref,
        unitId: record.unitId,
        unitType: record.unitType,
        usedBy: record.usedBy.map((owner) => ({ ...owner })),
    }));
}

function createReferencedUnitInstanceService(unitType = UniverInstanceType.UNIVER_SHEET) {
    return {
        getUnitType: vi.fn(() => unitType),
    };
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
        ref: overrides.ref ?? {
            file: { kind: 'self' },
            unit: { selector: 'child-sheet', type: 'sheet' },
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
