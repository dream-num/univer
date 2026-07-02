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

import type { IEmbedDescriptor } from '../../types/embed';
import { ICommandService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { CreateEmbedCommand, RemoveEmbedCommand } from '../../commands/commands/embed.command';
import { EmbedModelService } from '../../services/embed-model.service';
import { EmbedReferencedUnitApiResolverRegistryService } from '../../services/embed-referenced-unit-api-resolver-registry.service';
import { EmbedReferencedUnitManagerService } from '../../services/embed-referenced-unit-manager.service';
import { EMBED_CHILD_CREATE_OPTIONS } from '../../services/embed-source-resolver.service';
import { ReferencedUnitOwnerKind } from '../../types/referenced-unit';
import { FEmbed } from '../f-embed';
import { FEmbedHostSurface } from '../f-enum';
import { FUniverEmbedMixin } from '../f-univer';

describe('embed facade', () => {
    it('creates embeds through CreateEmbedCommand and resolves host type from unit id', () => {
        const { api, commandService } = createFacade();
        const ref = createRef();

        const embed = api.createEmbed({
            host: {
                unitId: 'host-1',
                surface: FEmbedHostSurface.DocBlock,
                anchorId: 'anchor-1',
                context: { index: 2 },
            },
            content: {
                unitType: UniverInstanceType.UNIVER_SHEET,
                ref,
            },
            interaction: 'interactive',
        });

        expect(embed).toBeInstanceOf(FEmbed);
        expect(commandService.syncExecuteCommand).toHaveBeenCalledWith(CreateEmbedCommand.id, {
            embedId: expect.stringMatching(/^embed_/),
            hostUnitId: 'host-1',
            hostType: UniverInstanceType.UNIVER_DOC,
            requestedHostAnchorId: 'anchor-1',
            entry: FEmbedHostSurface.DocBlock,
            source: {
                unitType: UniverInstanceType.UNIVER_SHEET,
                ref,
            },
            mode: 'interactive',
            sourceMeta: undefined,
            hostContext: { index: 2 },
        });
    });

    it('rejects createEmbed before command execution when the host unit does not exist', () => {
        const { api, commandService, univerInstanceService } = createFacade();
        univerInstanceService.getUnitType.mockReturnValueOnce(UniverInstanceType.UNRECOGNIZED);

        expect(() => api.createEmbed({
            host: {
                unitId: 'missing-host',
                surface: FEmbedHostSurface.DocBlock,
            },
            content: {
                unitType: UniverInstanceType.UNIVER_SHEET,
                ref: createRef(),
            },
        })).toThrow('EMBED_HOST_UNIT_NOT_FOUND');
        expect(commandService.syncExecuteCommand).not.toHaveBeenCalled();
    });

    it('gets, lists, and removes embeds through descriptors and commands', () => {
        const descriptor = createDescriptor();
        const { api, commandService, model } = createFacade([descriptor]);

        expect(api.getEmbed({ hostUnitId: 'host-1', embedId: 'missing' })).toBeNull();
        const embed = api.getEmbed({ hostUnitId: 'host-1', embedId: 'embed-1' })!;
        expect(embed.getId()).toBe('embed-1');
        expect(embed.getHostUnitId()).toBe('host-1');
        expect(embed.getChildUnitId()).toBe('child-1');
        expect(embed.getChildType()).toBe(UniverInstanceType.UNIVER_SHEET);
        expect(embed.getEntry()).toBe('docs-custom-block');
        expect(embed.getDescriptor()).toEqual(descriptor);

        expect(api.listEmbeds()).toHaveLength(1);
        expect(api.listEmbeds({ hostUnitId: 'host-1' })).toHaveLength(1);
        expect(api.listEmbeds({ hostUnitId: 'other' })).toHaveLength(0);

        expect(api.removeEmbed({ hostUnitId: 'host-1', embedId: 'missing' })).toBe(false);
        expect(embed.remove()).toBe(true);
        expect(commandService.syncExecuteCommand).toHaveBeenCalledWith(RemoveEmbedCommand.id, {
            hostUnitId: 'host-1',
            embedId: 'embed-1',
        });
        expect(model.getActiveDescriptors).toHaveBeenCalledWith('host-1');
    });

    it('loads units through the generic facade and embed facade', async () => {
        const descriptor = createDescriptor();
        const workbookFacade = { getId: vi.fn(() => 'child-1') };
        const { api, facadeResolverRegistry, referencedUnitManager } = createFacade([descriptor], workbookFacade);
        const ref = descriptor.source.ref;
        expect(ref).toBeDefined();

        await expect(api.loadUnitAsync(ref!, { unitType: UniverInstanceType.UNIVER_SHEET })).resolves.toBe(workbookFacade);
        expect(facadeResolverRegistry.resolve).toHaveBeenCalledWith({
            unitId: 'child-1',
            unitType: UniverInstanceType.UNIVER_SHEET,
            injector: expect.any(Object),
            api,
        });
        expect(referencedUnitManager.ensure).toHaveBeenCalledWith({
            ref,
            unitType: UniverInstanceType.UNIVER_SHEET,
            signal: undefined,
            createOptions: {},
        });

        const embed = api.getEmbed({ hostUnitId: 'host-1', embedId: 'embed-1' })!;
        await expect(embed.loadAsync({ makeCurrent: true })).resolves.toBe(workbookFacade);
        expect(facadeResolverRegistry.resolve).toHaveBeenLastCalledWith({
            unitId: 'child-1',
            unitType: UniverInstanceType.UNIVER_SHEET,
            injector: expect.any(Object),
            api,
        });
        expect(referencedUnitManager.ensure).toHaveBeenLastCalledWith({
            ref,
            owner: {
                kind: ReferencedUnitOwnerKind.Embed,
                unitId: 'host-1',
                ownerId: 'embed-1',
            },
            unitType: UniverInstanceType.UNIVER_SHEET,
            signal: undefined,
            createOptions: {
                ...EMBED_CHILD_CREATE_OPTIONS,
                makeCurrent: true,
            },
        });
    });

    it('loads locator refs from string locators', async () => {
        const workbookFacade = { getId: vi.fn(() => 'child-1') };
        const { api, referencedUnitManager, univerInstanceService } = createFacade(undefined, workbookFacade);

        await expect(api.loadUnitAsync('#unit=child-1&type=sheet', { unitType: UniverInstanceType.UNIVER_SHEET })).resolves.toBe(workbookFacade);
        expect(referencedUnitManager.ensure).toHaveBeenLastCalledWith({
            ref: '#unit=child-1&type=sheet',
            unitType: UniverInstanceType.UNIVER_SHEET,
            signal: undefined,
            createOptions: {},
        });
        await expect(api.loadUnitAsync('#unit=child-1&type=sheet')).resolves.toBe(workbookFacade);
        expect(referencedUnitManager.ensure).toHaveBeenLastCalledWith({
            ref: '#unit=child-1&type=sheet',
            unitType: undefined,
            signal: undefined,
            createOptions: {},
        });
        expect(univerInstanceService.getUnitType).not.toHaveBeenCalled();
    });

    it('rejects unsupported and invalid string locators before manager ensure', async () => {
        const { api, referencedUnitManager } = createFacade();

        await expect(api.loadUnitAsync('univer://remote-workbook#unit=child-1')).rejects.toThrow('INVALID_URI_REFERENCE');
        await expect(api.loadUnitAsync('#unit=child-1&range=A1')).rejects.toThrow('INVALID_FRAGMENT_SYNTAX');
        await expect(api.loadUnitAsync('#unit=')).rejects.toThrow('INVALID_FRAGMENT_SYNTAX');
        await expect(api.loadUnitAsync('child-1', { unitType: UniverInstanceType.UNIVER_SHEET })).rejects.toThrow('INVALID_URI_REFERENCE');
        await expect(api.loadUnitAsync('#unit=child-1')).rejects.toThrow('MISSING_TYPE');
        expect(referencedUnitManager.ensure).not.toHaveBeenCalled();
    });
});

function createFacade(descriptors: IEmbedDescriptor[] = [createDescriptor()], loadedUnitFacade: object = { getId: vi.fn(() => 'child-1') }) {
    const commandService = {
        syncExecuteCommand: vi.fn((id: string, params: {
            embedId?: string;
            hostUnitId?: string;
            hostType?: UniverInstanceType;
            entry?: IEmbedDescriptor['entry'];
            source?: IEmbedDescriptor['source'];
        }) => id === RemoveEmbedCommand.id
            ? true
            : ({
                embedId: params.embedId ?? 'embed-1',
                hostUnitId: params.hostUnitId ?? 'host-1',
                hostType: params.hostType ?? UniverInstanceType.UNIVER_DOC,
                hostAnchorId: 'anchor-1',
                entry: params.entry ?? 'docs-custom-block',
                childUnitId: 'child-1',
                childType: UniverInstanceType.UNIVER_SHEET,
                source: params.source ?? {
                    unitType: UniverInstanceType.UNIVER_SHEET,
                    ref: createRef(),
                },
            })),
    };
    const model = {
        getDescriptor: vi.fn((_hostUnitId: string, embedId: string) => descriptors.find((item) => item.embedId === embedId)),
        getActiveDescriptors: vi.fn((hostUnitId?: string) => descriptors.filter((item) => !hostUnitId || item.hostUnitId === hostUnitId)),
        getAllActiveDescriptors: vi.fn(() => descriptors),
    };
    const referencedUnitManager = {
        ensure: vi.fn((input) => ({
            loaded: Promise.resolve({
                ref: input.ref,
                unitId: 'child-1',
                unitType: UniverInstanceType.UNIVER_SHEET,
            }),
            dispose: vi.fn(),
        })),
    };
    const facadeResolverRegistry = {
        resolve: vi.fn(() => loadedUnitFacade),
    };
    const univerInstanceService = {
        getUnitType: vi.fn(() => UniverInstanceType.UNIVER_DOC),
    };
    const injector = {
        get: vi.fn((token: unknown) => {
            if (token === ICommandService) {
                return commandService;
            }
            if (token === IUniverInstanceService) {
                return univerInstanceService;
            }
            if (token === EmbedModelService) {
                return model;
            }
            if (token === EmbedReferencedUnitManagerService) {
                return referencedUnitManager;
            }
            if (token === EmbedReferencedUnitApiResolverRegistryService) {
                return facadeResolverRegistry;
            }
            throw new Error('Unexpected token');
        }),
        createInstance: vi.fn((Ctor: typeof FEmbed, descriptor: IEmbedDescriptor, univerAPI: FUniverEmbedMixin) => new Ctor(descriptor, univerAPI, injector as never)),
    };
    const api = Object.assign(Object.create(FUniverEmbedMixin.prototype), {
        _commandService: commandService,
        _injector: injector,
        _univerInstanceService: univerInstanceService,
    }) as FUniverEmbedMixin;

    return { api, commandService, facadeResolverRegistry, injector, model, referencedUnitManager, univerInstanceService };
}

function createRef() {
    return { file: { kind: 'self' as const }, unit: { selector: 'child-1', type: 'sheet' as const } };
}

function createDescriptor(overrides: Partial<IEmbedDescriptor> = {}): IEmbedDescriptor {
    return {
        embedId: 'embed-1',
        hostUnitId: 'host-1',
        hostType: UniverInstanceType.UNIVER_DOC,
        hostAnchorId: 'anchor-1',
        entry: 'docs-custom-block',
        source: {
            unitType: UniverInstanceType.UNIVER_SHEET,
            ref: createRef(),
        },
        childUnitId: 'child-1',
        childType: UniverInstanceType.UNIVER_SHEET,
        lifecycle: 'active',
        ...overrides,
    };
}
