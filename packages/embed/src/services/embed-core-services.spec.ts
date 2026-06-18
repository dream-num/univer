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

import type { IEmbedCapability, IEmbedCreateContext, IEmbedDescriptor } from '../types/embed';
import { UniverInstanceType } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { createDefaultEmbedCapabilities, createDefaultEmbedSourceMeta, EmbedCapabilityRegistryService, flushPendingEmbedCapabilities, registerEmbedCapabilities } from './embed-capability-registry.service';
import { EmbedCreationService } from './embed-creation.service';
import { EMBED_CHILD_CREATE_OPTIONS, EmbedSourceResolverService } from './embed-source-resolver.service';

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
        expect(() => registry.register(createCapability({
            hostType: UniverInstanceType.UNIVER_DOC,
            childType: UniverInstanceType.UNIVER_DOC,
        }))).toThrow('Cannot register same product embed capability');

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
        const resolver = new EmbedSourceResolverService(instanceService as never, registry as never, undefined, pluginService as never);

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

    it('validates self resource refs and external provider refs', async () => {
        const instanceService = createInstanceService();
        instanceService.getUnitType.mockReturnValue(UniverInstanceType.UNIVER_SHEET);
        instanceService.getUnit.mockReturnValue({ getUnitId: () => 'sheet-child' });
        const provider = {
            resolve: vi.fn(async () => ({
                unitId: 'external-sheet',
                unitType: UniverInstanceType.UNIVER_SHEET,
                ref: {
                    file: { kind: 'self' },
                    unit: { selector: 'external-sheet', type: 'sheet' },
                },
            })),
        };
        const providerRegistry = {
            get: vi.fn((kind: string) => kind === 'uri' ? provider : undefined),
        };
        const resolver = new EmbedSourceResolverService(instanceService as never, undefined, providerRegistry as never);

        await expect(resolver.resolve({
            kind: 'ref',
            ref: {
                file: { kind: 'self' },
                unit: { selector: 'sheet-child', type: 'sheet' },
            },
        })).resolves.toMatchObject({
            childUnitId: 'sheet-child',
            childType: UniverInstanceType.UNIVER_SHEET,
        });

        await expect(resolver.resolve({
            kind: 'ref',
            ref: {
                file: { kind: 'uri', uri: 'univer://file-1' },
                unit: { selector: 'remote-sheet', type: 'sheet' },
            },
        })).resolves.toMatchObject({
            childUnitId: 'external-sheet',
            childType: UniverInstanceType.UNIVER_SHEET,
        });

        instanceService.getUnitType.mockReturnValue(UniverInstanceType.UNRECOGNIZED);
        await expect(resolver.resolve({
            kind: 'ref',
            ref: {
                file: { kind: 'self' },
                unit: { selector: 'missing', type: 'sheet' },
            },
        })).rejects.toThrow('UNIT_NOT_FOUND');

        instanceService.getUnitType.mockReturnValue(UniverInstanceType.UNIVER_DOC);
        await expect(resolver.resolve({
            kind: 'ref',
            ref: {
                file: { kind: 'self' },
                unit: { selector: 'doc-child', type: 'sheet' },
            },
        })).rejects.toThrow('UNIT_TYPE_MISMATCH');

        await expect(resolver.resolve({
            kind: 'ref',
            ref: {
                file: { kind: 'relative', path: './missing.univer' },
                unit: { selector: 'remote-sheet', type: 'sheet' },
            },
        })).rejects.toThrow('PROVIDER_UNSUPPORTED');

        provider.resolve.mockResolvedValueOnce({
            unitId: 'external-doc',
            unitType: UniverInstanceType.UNIVER_DOC,
        } as never);
        await expect(resolver.resolve({
            kind: 'ref',
            ref: {
                file: { kind: 'uri', uri: 'univer://file-1' },
                unit: { selector: 'remote-sheet', type: 'sheet' },
            },
        })).rejects.toThrow('UNIT_TYPE_MISMATCH');
    });
});

describe('EmbedCreationService', () => {
    it('prepares, creates, copies, and removes embeds through the model', async () => {
        const model = createModel();
        const descriptor = createDescriptor();
        const creationService = new EmbedCreationService(
            model as never,
            { getCapability: vi.fn(() => createCapability()) } as never,
            { resolve: vi.fn(async () => ({ childUnitId: descriptor.childUnitId, childType: descriptor.childType, source: descriptor.source })) } as never,
            { assertCanCreate: vi.fn() } as never
        );
        const context = createCreateContext();

        const prepared = await creationService.prepareCreateEmbed(context);
        expect(prepared.descriptor).toMatchObject({
            embedId: context.embedId,
            hostAnchorId: context.hostAnchorId,
            childUnitId: descriptor.childUnitId,
        });
        expect(model.addDescriptor).not.toHaveBeenCalled();

        const created = await creationService.createEmbed(context);
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
        await expect(new EmbedCreationService(
            createModel() as never,
            { getCapability: vi.fn(() => undefined) } as never,
            { resolve: vi.fn(async () => ({ childUnitId: descriptor.childUnitId, childType: descriptor.childType, source: descriptor.source })) } as never,
            { assertCanCreate: vi.fn() } as never
        ).prepareCreateEmbed(createCreateContext())).rejects.toThrow('EMBED_CAPABILITY_NOT_SUPPORTED');

        const model = createModel();
        model.getActiveDescriptorsByChildUnit.mockReturnValueOnce([{
            ...descriptor,
            embedId: 'other',
            hostUnitId: 'other-host',
        }]);
        await expect(new EmbedCreationService(
            model as never,
            { getCapability: vi.fn(() => createCapability()) } as never,
            { resolve: vi.fn(async () => ({ childUnitId: descriptor.childUnitId, childType: descriptor.childType, source: descriptor.source })) } as never,
            { assertCanCreate: vi.fn() } as never
        ).prepareCreateEmbed(createCreateContext())).rejects.toThrow('EMBED_CHILD_UNIT_ALREADY_EMBEDDED');
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

function createCapabilityInjector(registry?: EmbedCapabilityRegistryService, key: object = {}): Pick<import('@univerjs/core').Injector, 'get' | 'has'> {
    return Object.assign(key, {
        has: vi.fn((token: unknown) => Boolean(registry) && token === EmbedCapabilityRegistryService),
        get: vi.fn((token: unknown) => {
            if (!registry || token !== EmbedCapabilityRegistryService) {
                throw new Error('unexpected token');
            }

            return registry;
        }),
    }) as unknown as Pick<import('@univerjs/core').Injector, 'get' | 'has'>;
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
