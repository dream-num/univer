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

import type { IWorkbookData } from '@univerjs/core';
import type { IEmbedDescriptor } from '../../types/embed';
import { ICommandService, UniverInstanceType } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { InsertEmbedBySnapshotCommand, RemoveEmbedCommand } from '../../commands/commands/embed.command';
import { EmbedModelService } from '../../services/embed-model.service';
import { FEmbed } from '../f-embed';
import { FUniverEmbedMixin } from '../f-univer';

describe('embed facade', () => {
    it('maps semantic insert APIs to the snapshot command', () => {
        const { api, commandService } = createFacade();
        const sheetSnapshot = { id: 'sheet-child' } as IWorkbookData;

        const embed = api.insertSheetIntoDoc({
            hostDocUnitId: 'doc-host',
            sheetSnapshot,
            index: 2,
        });

        expect(embed).toBeInstanceOf(FEmbed);
        expect(commandService.syncExecuteCommand).toHaveBeenCalledWith(InsertEmbedBySnapshotCommand.id, {
            hostUnitId: 'doc-host',
            hostType: UniverInstanceType.UNIVER_DOC,
            entry: 'docs-custom-block',
            childType: UniverInstanceType.UNIVER_SHEET,
            unitSnapshot: sheetSnapshot,
            hostContext: { index: 2 },
        });
    });

    it('keeps tab and floating params agent-friendly', () => {
        const { api, commandService } = createFacade();

        api.insertSlideAsSheetTab({
            hostWorkbookUnitId: 'workbook-host',
            slideSnapshot: { id: 'slide-child' } as never,
            tabIndex: 1,
            name: 'Deck',
        });
        api.insertBaseAsSheetFloating({
            hostWorkbookUnitId: 'workbook-host',
            baseSnapshot: { id: 'base-child' } as never,
            rect: { x: 10, y: 20, width: 480, height: 320 },
        });

        expect(commandService.syncExecuteCommand).toHaveBeenNthCalledWith(1, InsertEmbedBySnapshotCommand.id, {
            hostUnitId: 'workbook-host',
            hostType: UniverInstanceType.UNIVER_SHEET,
            entry: 'sheets-sheet-tab',
            childType: UniverInstanceType.UNIVER_SLIDE,
            unitSnapshot: { id: 'slide-child' },
            hostContext: { sheetIndex: 1, sheetName: 'Deck' },
        });
        expect(commandService.syncExecuteCommand).toHaveBeenNthCalledWith(2, InsertEmbedBySnapshotCommand.id, {
            hostUnitId: 'workbook-host',
            hostType: UniverInstanceType.UNIVER_SHEET,
            entry: 'sheets-floating-object',
            childType: UniverInstanceType.UNIVER_BASE,
            unitSnapshot: { id: 'base-child' },
            hostContext: { left: 10, top: 20, width: 480, height: 320 },
        });
    });

    it('creates a blank slide page when slide snapshot is omitted', () => {
        const { api, commandService } = createFacade();

        api.insertSlideAsSheetTab({
            hostWorkbookUnitId: 'workbook-host',
            tabIndex: 1,
            name: 'Deck',
        });

        const params = commandService.syncExecuteCommand.mock.calls[0][1] as unknown as {
            unitSnapshot: {
                name: string;
                defaultPageSize: { width: number; height: number };
                slideOrder: string[];
                activeSlideId: string;
                slides: Record<string, { pageType: string; elementOrder: string[]; elements: Record<string, unknown> }>;
                body: { pageOrder: string[]; pages: Record<string, unknown> };
            };
        };
        const pageId = params.unitSnapshot.slideOrder[0];

        expect(params.unitSnapshot.name).toBe('Deck');
        expect(params.unitSnapshot.defaultPageSize).toEqual({ width: 960, height: 540 });
        expect(params.unitSnapshot.activeSlideId).toBe(pageId);
        expect(params.unitSnapshot.slides[pageId]).toMatchObject({
            pageType: 'slide',
            elementOrder: [],
            elements: {},
        });
        expect(params.unitSnapshot.body.pageOrder).toEqual([pageId]);
        expect(params.unitSnapshot.body.pages[pageId]).toBeTruthy();
    });

    it('maps base and slide host semantic APIs', () => {
        const { api, commandService } = createFacade();

        api.insertSlideIntoDoc({
            hostDocUnitId: 'doc-host',
            slideSnapshot: { id: 'slide-child' } as never,
            index: 3,
        });
        api.insertSheetAsBaseTable({
            hostBaseUnitId: 'base-host',
            sheetSnapshot: { id: 'sheet-child' } as never,
            tableIndex: 2,
            name: 'Sheet Table',
        });
        api.insertDocAsSlidePage({
            hostSlideUnitId: 'slide-host',
            docSnapshot: { id: 'doc-child' } as never,
            pageIndex: 1,
            name: 'Doc Page',
        });
        api.insertBaseAsSlideFloating({
            hostSlideUnitId: 'slide-host',
            baseSnapshot: { id: 'base-child' } as never,
            rect: { x: 40, y: 50, width: 300, height: 200 },
        });

        expect(commandService.syncExecuteCommand).toHaveBeenNthCalledWith(1, InsertEmbedBySnapshotCommand.id, {
            hostUnitId: 'doc-host',
            hostType: UniverInstanceType.UNIVER_DOC,
            entry: 'docs-custom-block',
            childType: UniverInstanceType.UNIVER_SLIDE,
            unitSnapshot: { id: 'slide-child' },
            hostContext: { index: 3 },
        });
        expect(commandService.syncExecuteCommand).toHaveBeenNthCalledWith(2, InsertEmbedBySnapshotCommand.id, {
            hostUnitId: 'base-host',
            hostType: UniverInstanceType.UNIVER_BASE,
            entry: 'bases-table-list-block',
            childType: UniverInstanceType.UNIVER_SHEET,
            unitSnapshot: { id: 'sheet-child' },
            hostContext: { tableIndex: 2, tableName: 'Sheet Table' },
        });
        expect(commandService.syncExecuteCommand).toHaveBeenNthCalledWith(3, InsertEmbedBySnapshotCommand.id, {
            hostUnitId: 'slide-host',
            hostType: UniverInstanceType.UNIVER_SLIDE,
            entry: 'slides-page-list-block',
            childType: UniverInstanceType.UNIVER_DOC,
            unitSnapshot: { id: 'doc-child' },
            hostContext: { pageIndex: 1, pageName: 'Doc Page' },
        });
        expect(commandService.syncExecuteCommand).toHaveBeenNthCalledWith(4, InsertEmbedBySnapshotCommand.id, {
            hostUnitId: 'slide-host',
            hostType: UniverInstanceType.UNIVER_SLIDE,
            entry: 'slides-floating-object',
            childType: UniverInstanceType.UNIVER_BASE,
            unitSnapshot: { id: 'base-child' },
            hostContext: { left: 40, top: 50, width: 300, height: 200 },
        });
    });

    it('uses host snapshot command when embed-ui registers one', () => {
        const { api, commandService } = createFacade();
        commandService.hasCommand.mockReturnValue(true);

        api.insertBaseIntoDoc({
            hostDocUnitId: 'doc-host',
            baseSnapshot: { id: 'base-child' } as never,
        });

        expect(commandService.syncExecuteCommand).toHaveBeenCalledWith('embed-ui.command.insert-host-embed-by-snapshot', expect.objectContaining({
            hostUnitId: 'doc-host',
            entry: 'docs-custom-block',
        }));
    });

    it('reads descriptors and removes embeds through commands', () => {
        const descriptor = createDescriptor();
        const { api, commandService, model } = createFacade([descriptor]);

        expect(api.getEmbed({ hostUnitId: 'host-1', embedId: 'embed-1' })?.getChildUnitId()).toBe('child-1');
        expect(api.listEmbeds({ hostUnitId: 'host-1' })).toHaveLength(1);
        expect(api.listEmbeds()).toHaveLength(1);

        const embed = api.getEmbed({ hostUnitId: 'host-1', embedId: 'embed-1' })!;
        expect(embed.remove()).toBe(true);
        expect(commandService.syncExecuteCommand).toHaveBeenCalledWith(RemoveEmbedCommand.id, {
            hostUnitId: 'host-1',
            embedId: 'embed-1',
        });
        expect(model.getActiveDescriptors).toHaveBeenCalledWith('host-1');
    });
});

function createFacade(descriptors: IEmbedDescriptor[] = [createDescriptor()]) {
    const commandService = {
        hasCommand: vi.fn(() => false),
        syncExecuteCommand: vi.fn((id: string, params: { hostUnitId: string; hostType: UniverInstanceType; entry: IEmbedDescriptor['entry']; childType: UniverInstanceType }) => id === RemoveEmbedCommand.id
            ? true
            : ({
                embedId: 'embed-1',
                hostUnitId: params.hostUnitId,
                hostType: params.hostType,
                hostAnchorId: 'anchor-1',
                entry: params.entry,
                childUnitId: 'child-1',
                childType: params.childType,
                source: {
                    kind: 'ref',
                    ref: { file: { kind: 'self' }, unit: { selector: 'child-1', type: 'sheet' } },
                },
            })),
    };
    const model = {
        getDescriptor: vi.fn((_hostUnitId: string, embedId: string) => descriptors.find((item) => item.embedId === embedId)),
        getActiveDescriptors: vi.fn((hostUnitId?: string) => descriptors.filter((item) => !hostUnitId || item.hostUnitId === hostUnitId)),
        getAllActiveDescriptors: vi.fn(() => descriptors),
    };
    const injector = {
        get: vi.fn((token: unknown) => {
            if (token === ICommandService) {
                return commandService;
            }
            if (token === EmbedModelService) {
                return model;
            }
            throw new Error('Unexpected token');
        }),
        createInstance: vi.fn((Ctor: typeof FEmbed, descriptor: IEmbedDescriptor) => new Ctor(descriptor, injector as never)),
    };
    const api = Object.assign(Object.create(FUniverEmbedMixin.prototype), {
        _commandService: commandService,
        _injector: injector,
    }) as FUniverEmbedMixin;

    return { api, commandService, injector, model };
}

function createDescriptor(overrides: Partial<IEmbedDescriptor> = {}): IEmbedDescriptor {
    return {
        embedId: 'embed-1',
        hostUnitId: 'host-1',
        hostType: UniverInstanceType.UNIVER_DOC,
        hostAnchorId: 'anchor-1',
        entry: 'docs-custom-block',
        source: {
            kind: 'ref',
            ref: { file: { kind: 'self' }, unit: { selector: 'child-1', type: 'sheet' } },
        },
        childUnitId: 'child-1',
        childType: UniverInstanceType.UNIVER_SHEET,
        lifecycle: 'active',
        ...overrides,
    };
}
