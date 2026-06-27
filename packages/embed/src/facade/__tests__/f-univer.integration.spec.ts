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

import type { IBaseSnapshot, IDocumentData, IWorkbookData } from '@univerjs/core';
import type { IEmbedCapability } from '../../types/embed';
import type { IEmbedHostAdapterContribution, IEmbedHostAnchorContext, IEmbedHostAnchorMutationPlan, IEmbedHostAnchorRemoveMutationPlan } from '../../types/host-adapter';
import type { IEmbedHostAnchorRecord } from '../../types/host-anchor';
import { BaseDataModel, IUniverInstanceService, UnitModel, Univer, UniverInstanceType } from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { BehaviorSubject } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { RemoveEmbedHostAnchorRecordMutation, SetEmbedHostAnchorRecordMutation } from '../../commands/mutations/embed-host-anchor-record.mutation';
import { UniverEmbedPlugin } from '../../plugin';
import '../index';

describe('embed facade runtime integration', () => {
    it('creates every public insert API from minimal snapshots', () => {
        const univer = createUniver();
        const univerAPI = FUniver.newAPI(univer);
        const hostDoc = univer.createUnit<IDocumentData, UnitModel>(UniverInstanceType.UNIVER_DOC, createDocSnapshot('host-doc'));
        const hostWorkbook = univer.createUnit<IWorkbookData, UnitModel>(UniverInstanceType.UNIVER_SHEET, createSheetSnapshot('host-workbook'));
        const hostBase = univer.createUnit<IBaseSnapshot, BaseDataModel>(UniverInstanceType.UNIVER_BASE, createBaseSnapshot('host-base'));
        const hostSlide = univer.createUnit<object, UnitModel>(UniverInstanceType.UNIVER_SLIDE, createSlideSnapshot('host-slide'));

        const cases = [
            {
                name: 'insertSheetIntoDoc',
                run: () => univerAPI.insertSheetIntoDoc({
                    hostDocUnitId: hostDoc.getUnitId(),
                    sheetSnapshot: createSheetSnapshot('child-sheet-doc'),
                }),
                hostUnitId: hostDoc.getUnitId(),
                childType: UniverInstanceType.UNIVER_SHEET,
                entry: 'docs-custom-block',
            },
            {
                name: 'insertBaseIntoDoc',
                run: () => univerAPI.insertBaseIntoDoc({
                    hostDocUnitId: hostDoc.getUnitId(),
                    baseSnapshot: createBaseSnapshot('child-base-doc'),
                }),
                hostUnitId: hostDoc.getUnitId(),
                childType: UniverInstanceType.UNIVER_BASE,
                entry: 'docs-custom-block',
            },
            {
                name: 'insertSlideIntoDoc',
                run: () => univerAPI.insertSlideIntoDoc({
                    hostDocUnitId: hostDoc.getUnitId(),
                }),
                hostUnitId: hostDoc.getUnitId(),
                childType: UniverInstanceType.UNIVER_SLIDE,
                entry: 'docs-custom-block',
            },
            {
                name: 'insertDocAsSheetTab',
                run: () => univerAPI.insertDocAsSheetTab({
                    hostWorkbookUnitId: hostWorkbook.getUnitId(),
                    docSnapshot: createDocSnapshot('child-doc-tab'),
                    name: 'Doc Tab',
                }),
                hostUnitId: hostWorkbook.getUnitId(),
                childType: UniverInstanceType.UNIVER_DOC,
                entry: 'sheets-sheet-tab',
            },
            {
                name: 'insertSlideAsSheetTab',
                run: () => univerAPI.insertSlideAsSheetTab({
                    hostWorkbookUnitId: hostWorkbook.getUnitId(),
                    name: 'Slide Tab',
                }),
                hostUnitId: hostWorkbook.getUnitId(),
                childType: UniverInstanceType.UNIVER_SLIDE,
                entry: 'sheets-sheet-tab',
            },
            {
                name: 'insertBaseAsSheetTab',
                run: () => univerAPI.insertBaseAsSheetTab({
                    hostWorkbookUnitId: hostWorkbook.getUnitId(),
                    baseSnapshot: createBaseSnapshot('child-base-tab'),
                    name: 'Base Tab',
                }),
                hostUnitId: hostWorkbook.getUnitId(),
                childType: UniverInstanceType.UNIVER_BASE,
                entry: 'sheets-sheet-tab',
            },
            {
                name: 'insertDocAsSheetFloating',
                run: () => univerAPI.insertDocAsSheetFloating({
                    hostWorkbookUnitId: hostWorkbook.getUnitId(),
                    docSnapshot: createDocSnapshot('child-doc-float'),
                    rect: { x: 10, y: 20, width: 480, height: 320 },
                }),
                hostUnitId: hostWorkbook.getUnitId(),
                childType: UniverInstanceType.UNIVER_DOC,
                entry: 'sheets-floating-object',
            },
            {
                name: 'insertSlideAsSheetFloating',
                run: () => univerAPI.insertSlideAsSheetFloating({
                    hostWorkbookUnitId: hostWorkbook.getUnitId(),
                    rect: { x: 20, y: 30, width: 640, height: 360 },
                }),
                hostUnitId: hostWorkbook.getUnitId(),
                childType: UniverInstanceType.UNIVER_SLIDE,
                entry: 'sheets-floating-object',
            },
            {
                name: 'insertBaseAsSheetFloating',
                run: () => univerAPI.insertBaseAsSheetFloating({
                    hostWorkbookUnitId: hostWorkbook.getUnitId(),
                    baseSnapshot: createBaseSnapshot('child-base-float'),
                    rect: { x: 30, y: 40, width: 520, height: 360 },
                }),
                hostUnitId: hostWorkbook.getUnitId(),
                childType: UniverInstanceType.UNIVER_BASE,
                entry: 'sheets-floating-object',
            },
            {
                name: 'insertSheetAsBaseTable',
                run: () => univerAPI.insertSheetAsBaseTable({
                    hostBaseUnitId: hostBase.getUnitId(),
                    sheetSnapshot: createSheetSnapshot('child-sheet-base-table'),
                    name: 'Sheet Table',
                }),
                hostUnitId: hostBase.getUnitId(),
                childType: UniverInstanceType.UNIVER_SHEET,
                entry: 'bases-table-list-block',
            },
            {
                name: 'insertDocAsBaseTable',
                run: () => univerAPI.insertDocAsBaseTable({
                    hostBaseUnitId: hostBase.getUnitId(),
                    docSnapshot: createDocSnapshot('child-doc-base-table'),
                    name: 'Doc Table',
                }),
                hostUnitId: hostBase.getUnitId(),
                childType: UniverInstanceType.UNIVER_DOC,
                entry: 'bases-table-list-block',
            },
            {
                name: 'insertSlideAsBaseTable',
                run: () => univerAPI.insertSlideAsBaseTable({
                    hostBaseUnitId: hostBase.getUnitId(),
                    name: 'Slide Table',
                }),
                hostUnitId: hostBase.getUnitId(),
                childType: UniverInstanceType.UNIVER_SLIDE,
                entry: 'bases-table-list-block',
            },
            {
                name: 'insertSheetAsSlidePage',
                run: () => univerAPI.insertSheetAsSlidePage({
                    hostSlideUnitId: hostSlide.getUnitId(),
                    sheetSnapshot: createSheetSnapshot('child-sheet-slide-page'),
                    name: 'Sheet Page',
                }),
                hostUnitId: hostSlide.getUnitId(),
                childType: UniverInstanceType.UNIVER_SHEET,
                entry: 'slides-page-list-block',
            },
            {
                name: 'insertBaseAsSlidePage',
                run: () => univerAPI.insertBaseAsSlidePage({
                    hostSlideUnitId: hostSlide.getUnitId(),
                    baseSnapshot: createBaseSnapshot('child-base-slide-page'),
                    name: 'Base Page',
                }),
                hostUnitId: hostSlide.getUnitId(),
                childType: UniverInstanceType.UNIVER_BASE,
                entry: 'slides-page-list-block',
            },
            {
                name: 'insertDocAsSlidePage',
                run: () => univerAPI.insertDocAsSlidePage({
                    hostSlideUnitId: hostSlide.getUnitId(),
                    docSnapshot: createDocSnapshot('child-doc-slide-page'),
                    name: 'Doc Page',
                }),
                hostUnitId: hostSlide.getUnitId(),
                childType: UniverInstanceType.UNIVER_DOC,
                entry: 'slides-page-list-block',
            },
            {
                name: 'insertSheetAsSlideFloating',
                run: () => univerAPI.insertSheetAsSlideFloating({
                    hostSlideUnitId: hostSlide.getUnitId(),
                    sheetSnapshot: createSheetSnapshot('child-sheet-slide-float'),
                    rect: { x: 40, y: 50, width: 480, height: 320 },
                }),
                hostUnitId: hostSlide.getUnitId(),
                childType: UniverInstanceType.UNIVER_SHEET,
                entry: 'slides-floating-object',
            },
            {
                name: 'insertBaseAsSlideFloating',
                run: () => univerAPI.insertBaseAsSlideFloating({
                    hostSlideUnitId: hostSlide.getUnitId(),
                    baseSnapshot: createBaseSnapshot('child-base-slide-float'),
                    rect: { x: 50, y: 60, width: 520, height: 360 },
                }),
                hostUnitId: hostSlide.getUnitId(),
                childType: UniverInstanceType.UNIVER_BASE,
                entry: 'slides-floating-object',
            },
            {
                name: 'insertDocAsSlideFloating',
                run: () => univerAPI.insertDocAsSlideFloating({
                    hostSlideUnitId: hostSlide.getUnitId(),
                    docSnapshot: createDocSnapshot('child-doc-slide-float'),
                    rect: { x: 60, y: 70, width: 480, height: 320 },
                }),
                hostUnitId: hostSlide.getUnitId(),
                childType: UniverInstanceType.UNIVER_DOC,
                entry: 'slides-floating-object',
            },
        ];

        const created = cases.map((item) => {
            const embed = item.run();
            expect(embed.getHostUnitId(), item.name).toBe(item.hostUnitId);
            expect(embed.getChildType(), item.name).toBe(item.childType);
            expect(embed.getEntry(), item.name).toBe(item.entry);
            expect(embed.getChildUnitId(), item.name).toBeTruthy();
            expect(univerAPI.getEmbed({ hostUnitId: item.hostUnitId, embedId: embed.getId() })?.getId(), item.name).toBe(embed.getId());
            return embed;
        });

        expect(univerAPI.listEmbeds()).toHaveLength(18);
        expect(univerAPI.listEmbeds({ hostUnitId: hostDoc.getUnitId() })).toHaveLength(3);
        expect(univerAPI.listEmbeds({ hostUnitId: hostWorkbook.getUnitId() })).toHaveLength(6);
        expect(univerAPI.listEmbeds({ hostUnitId: hostBase.getUnitId() })).toHaveLength(3);
        expect(univerAPI.listEmbeds({ hostUnitId: hostSlide.getUnitId() })).toHaveLength(6);

        created.forEach((embed) => {
            expect(univerAPI.removeEmbed({ hostUnitId: embed.getHostUnitId(), embedId: embed.getId() })).toBe(true);
        });
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
        createCapability(UniverInstanceType.UNIVER_DOC, UniverInstanceType.UNIVER_BASE, 'docs-custom-block', 'float', 'docs-sticky-base', 'floating'),
        createCapability(UniverInstanceType.UNIVER_DOC, UniverInstanceType.UNIVER_SLIDE, 'docs-custom-block', 'float', 'aspect-fit', 'floating'),
        createCapability(UniverInstanceType.UNIVER_SHEET, UniverInstanceType.UNIVER_DOC, 'sheets-sheet-tab', 'tab', 'tab-peer', 'host-override'),
        createCapability(UniverInstanceType.UNIVER_SHEET, UniverInstanceType.UNIVER_SLIDE, 'sheets-sheet-tab', 'tab', 'tab-peer', 'host-override'),
        createCapability(UniverInstanceType.UNIVER_SHEET, UniverInstanceType.UNIVER_BASE, 'sheets-sheet-tab', 'tab', 'tab-peer', 'host-override'),
        createCapability(UniverInstanceType.UNIVER_SHEET, UniverInstanceType.UNIVER_DOC, 'sheets-floating-object', 'float', 'doc-width-scale', 'floating'),
        createCapability(UniverInstanceType.UNIVER_SHEET, UniverInstanceType.UNIVER_SLIDE, 'sheets-floating-object', 'float', 'aspect-fit', 'floating'),
        createCapability(UniverInstanceType.UNIVER_SHEET, UniverInstanceType.UNIVER_BASE, 'sheets-floating-object', 'float', 'scroll-contained', 'floating'),
        createCapability(UniverInstanceType.UNIVER_BASE, UniverInstanceType.UNIVER_SHEET, 'bases-table-list-block', 'tab', 'tab-peer', 'host-override'),
        createCapability(UniverInstanceType.UNIVER_BASE, UniverInstanceType.UNIVER_DOC, 'bases-table-list-block', 'tab', 'tab-peer', 'host-override'),
        createCapability(UniverInstanceType.UNIVER_BASE, UniverInstanceType.UNIVER_SLIDE, 'bases-table-list-block', 'tab', 'tab-peer', 'host-override'),
        createCapability(UniverInstanceType.UNIVER_SLIDE, UniverInstanceType.UNIVER_SHEET, 'slides-page-list-block', 'tab', 'tab-peer', 'host-override'),
        createCapability(UniverInstanceType.UNIVER_SLIDE, UniverInstanceType.UNIVER_BASE, 'slides-page-list-block', 'tab', 'tab-peer', 'host-override'),
        createCapability(UniverInstanceType.UNIVER_SLIDE, UniverInstanceType.UNIVER_DOC, 'slides-page-list-block', 'tab', 'tab-peer', 'host-override'),
        createCapability(UniverInstanceType.UNIVER_SLIDE, UniverInstanceType.UNIVER_SHEET, 'slides-floating-object', 'float', 'scroll-contained', 'floating'),
        createCapability(UniverInstanceType.UNIVER_SLIDE, UniverInstanceType.UNIVER_BASE, 'slides-floating-object', 'float', 'scroll-contained', 'floating'),
        createCapability(UniverInstanceType.UNIVER_SLIDE, UniverInstanceType.UNIVER_DOC, 'slides-floating-object', 'float', 'doc-width-scale', 'floating'),
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
        createHostAdapter(UniverInstanceType.UNIVER_BASE, 'bases-table-list-block', 'bases-table-list-block'),
        createHostAdapter(UniverInstanceType.UNIVER_SLIDE, 'slides-page-list-block', 'slides-page-list-block'),
        createHostAdapter(UniverInstanceType.UNIVER_SLIDE, 'slides-floating-object', 'slides-floating-object'),
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

function createBaseSnapshot(id: string): IBaseSnapshot {
    const now = Date.now();
    return {
        id,
        name: id,
        schemaVersion: 1,
        tables: {},
        tableOrder: [],
        createdAt: now,
        updatedAt: now,
    };
}

function createSlideSnapshot(id: string): object {
    const pageId = `${id}-page`;
    return {
        id,
        title: id,
        pageSize: { width: 960, height: 540 },
        body: {
            pageOrder: [pageId],
            pages: {
                [pageId]: {
                    id: pageId,
                    pageType: 0,
                    zIndex: 1,
                    title: 'Blank',
                    description: '',
                    pageBackgroundFill: { rgb: '#ffffff' },
                    pageElements: {},
                },
            },
        },
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
