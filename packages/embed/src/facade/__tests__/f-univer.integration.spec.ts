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

import type { IDocumentData, IWorkbookData } from '@univerjs/core';
import type { IEmbedCapability } from '../../types/embed';
import type { IEmbedHostAdapterContribution, IEmbedHostAnchorContext, IEmbedHostAnchorMutationPlan, IEmbedHostAnchorRemoveMutationPlan } from '../../types/host-adapter';
import type { IEmbedHostAnchorRecord } from '../../types/host-anchor';
import { BaseDataModel, IUniverInstanceService, UnitModel, Univer, UniverInstanceType } from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { BehaviorSubject } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { RemoveEmbedHostAnchorRecordMutation, SetEmbedHostAnchorRecordMutation } from '../../commands/mutations/embed-host-anchor-record.mutation';
import { UniverEmbedPlugin } from '../../plugin';
import { FEmbedHostSurface } from '../f-enum';
import '../index';

describe('embed facade runtime integration', () => {
    it('creates embeds through createEmbed without materializing provider-backed refs', async () => {
        const univer = createUniver();
        const univerAPI = FUniver.newAPI(univer);
        const hostDoc = univer.createUnit<IDocumentData, UnitModel>(UniverInstanceType.UNIVER_DOC, createDocSnapshot('host-doc'));
        const hostWorkbook = univer.createUnit<IWorkbookData, UnitModel>(UniverInstanceType.UNIVER_SHEET, createSheetSnapshot('host-workbook'));

        expect(univerAPI.Enum.FEmbedHostSurface.SheetFloating).toBe(FEmbedHostSurface.SheetFloating);

        const remoteRefEmbed = univerAPI.createEmbed({
            embedId: 'remote-ref-embed',
            host: {
                unitId: hostDoc.getUnitId(),
                surface: univerAPI.Enum.FEmbedHostSurface.DocBlock,
                anchorId: 'doc-anchor',
                context: { index: 1 },
            },
            content: {
                unitType: UniverInstanceType.UNIVER_SHEET,
                ref: '#unit=remote-sheet&type=sheet',
            },
        });
        expect(remoteRefEmbed.getHostType()).toBe(UniverInstanceType.UNIVER_DOC);
        expect(remoteRefEmbed.getChildType()).toBe(UniverInstanceType.UNIVER_SHEET);
        expect(remoteRefEmbed.getChildUnitId()).toBeUndefined();
        expect(remoteRefEmbed.getDescriptor().source).toEqual({
            unitType: UniverInstanceType.UNIVER_SHEET,
            ref: '#unit=remote-sheet&type=sheet',
        });

        const floatingEmbed = univerAPI.createEmbed({
            embedId: 'floating-doc-embed',
            host: {
                unitId: hostWorkbook.getUnitId(),
                surface: FEmbedHostSurface.SheetFloating,
                context: { rect: { x: 10, y: 20, width: 480, height: 320 } },
            },
            content: {
                unitType: UniverInstanceType.UNIVER_DOC,
                ref: '#unit=remote-doc&type=doc',
            },
        });
        expect(floatingEmbed.getHostType()).toBe(UniverInstanceType.UNIVER_SHEET);
        expect(floatingEmbed.getEntry()).toBe('sheets-floating-object');
        expect(floatingEmbed.getChildType()).toBe(UniverInstanceType.UNIVER_DOC);
        expect(floatingEmbed.getChildUnitId()).toBeUndefined();

        expect(univerAPI.listEmbeds()).toHaveLength(2);
        expect(univerAPI.listEmbeds({ hostUnitId: hostDoc.getUnitId() })).toHaveLength(1);
        expect(univerAPI.listEmbeds({ hostUnitId: hostWorkbook.getUnitId() })).toHaveLength(1);

        for (const embed of univerAPI.listEmbeds()) {
            expect(univerAPI.removeEmbed({ hostUnitId: embed.getHostUnitId(), embedId: embed.getId() })).toBe(true);
        }
        expect(univerAPI.listEmbeds()).toHaveLength(0);

        univer.dispose();
    });
});

function createUniver(): Univer {
    const univer = new Univer();
    const injector = univer.__getInjector();
    injector.get(IUniverInstanceService).registerCtorForType(UniverInstanceType.UNIVER_BASE, BaseDataModel);
    injector.get(IUniverInstanceService).registerCtorForType(UniverInstanceType.UNIVER_SLIDE, MockSlideUnit as never);
    univer.registerPlugin(UniverEmbedPlugin, {
        useDefaultCapabilities: false,
        capabilities: createCapabilities(),
        hostAdapters: createHostAdapters(),
    });
    return univer;
}

function createCapabilities(): IEmbedCapability[] {
    return [
        createCapability(UniverInstanceType.UNIVER_DOC, UniverInstanceType.UNIVER_SHEET, 'docs-custom-block', 'float', 'docs-sticky-sheet', 'floating'),
        createCapability(UniverInstanceType.UNIVER_DOC, UniverInstanceType.UNIVER_DOC, 'docs-custom-block', 'float', 'doc-width-scale', 'floating'),
        createCapability(UniverInstanceType.UNIVER_DOC, UniverInstanceType.UNIVER_BASE, 'docs-custom-block', 'float', 'docs-sticky-base', 'floating'),
        createCapability(UniverInstanceType.UNIVER_DOC, UniverInstanceType.UNIVER_SLIDE, 'docs-custom-block', 'float', 'aspect-fit', 'floating'),
        createCapability(UniverInstanceType.UNIVER_SHEET, UniverInstanceType.UNIVER_DOC, 'sheets-sheet-tab', 'tab', 'tab-peer', 'host-override'),
        createCapability(UniverInstanceType.UNIVER_SHEET, UniverInstanceType.UNIVER_DOC, 'sheets-floating-object', 'float', 'doc-width-scale', 'floating'),
    ];
}

function createCapability(
    hostType: UniverInstanceType,
    childType: UniverInstanceType,
    entry: IEmbedCapability['entry'],
    mode: IEmbedCapability['mode'],
    layout: IEmbedCapability['layout'],
    menuBehavior: IEmbedCapability['menuBehavior']
): IEmbedCapability {
    return {
        hostType,
        childType,
        entry,
        mode,
        layout,
        menuBehavior,
        nestedEmbed: false,
    };
}

function createHostAdapters(): IEmbedHostAdapterContribution[] {
    return [
        createHostAdapter(UniverInstanceType.UNIVER_DOC, 'docs-custom-block', 'docs-custom-block'),
        createHostAdapter(UniverInstanceType.UNIVER_SHEET, 'sheets-sheet-tab', 'sheets-sheet-tab'),
        createHostAdapter(UniverInstanceType.UNIVER_SHEET, 'sheets-floating-object', 'sheets-floating-object'),
    ];
}

function createHostAdapter(
    hostType: UniverInstanceType,
    entry: IEmbedHostAdapterContribution['entry'],
    kind: IEmbedHostAnchorRecord['kind']
): IEmbedHostAdapterContribution {
    return {
        hostType,
        entry,
        createAnchorPlan: (context) => createAnchorPlan(context, kind),
        removeAnchorPlan: (context) => createRemoveAnchorPlan(context, kind),
    };
}

function createAnchorPlan(
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

function createRemoveAnchorPlan(
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

function createSheetSnapshot(id: string): IWorkbookData {
    const sheetId = `${id}-sheet`;
    return {
        id,
        name: id,
        appVersion: '1.0.0',
        locale: 'enUS' as never,
        styles: {},
        sheetOrder: [sheetId],
        sheets: {
            [sheetId]: {
                id: sheetId,
                name: 'Sheet1',
                rowCount: 10,
                columnCount: 10,
                cellData: {},
            },
        },
        resources: [],
    };
}

function createDocSnapshot(id: string): IDocumentData {
    return {
        id,
        title: id,
        body: {
            dataStream: '\r\n',
        },
        documentStyle: {},
    };
}

class MockSlideUnit extends UnitModel<object, UniverInstanceType.UNIVER_SLIDE> {
    override readonly type = UniverInstanceType.UNIVER_SLIDE;
    private readonly _name$: BehaviorSubject<string>;
    override readonly name$;

    constructor(private readonly _snapshot: { id: string; title?: string }) {
        super();
        this._name$ = new BehaviorSubject(_snapshot.title ?? '');
        this.name$ = this._name$.asObservable();
    }

    override getUnitId(): string {
        return this._snapshot.id;
    }

    override setName(name: string): void {
        this._snapshot.title = name;
        this._name$.next(name);
    }

    override getSnapshot(): object {
        return this._snapshot;
    }

    override getRev(): number {
        return 1;
    }

    override incrementRev(): void {
        // noop
    }

    override setRev(): void {
        // noop
    }
}
