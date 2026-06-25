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
import type { IEmbedDescriptor, IInsertEmbedBySnapshotCommandParams } from '@univerjs/embed';
import { generateRandomId, UniverInstanceType as UniverType } from '@univerjs/core';
import { FUniver as FUniverClass } from '@univerjs/core/facade';
import { EmbedHostEntryEnum, EmbedModelService, InsertEmbedBySnapshotCommand } from '@univerjs/embed';
import { FEmbed } from './f-embed';

const INSERT_HOST_EMBED_BY_SNAPSHOT_COMMAND_ID = 'embed-ui.command.insert-host-embed-by-snapshot';

export interface IEmbedRect {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface IInsertSheetIntoDocParams {
    hostDocUnitId: string;
    sheetSnapshot: IWorkbookData;
    index?: number;
}

export interface IInsertBaseIntoDocParams {
    hostDocUnitId: string;
    baseSnapshot: IBaseSnapshot;
    index?: number;
}

export interface IInsertSlideIntoDocParams<TSlideSnapshot = unknown> {
    hostDocUnitId: string;
    slideSnapshot?: TSlideSnapshot;
    index?: number;
}

export interface IInsertDocAsSheetTabParams {
    hostWorkbookUnitId: string;
    docSnapshot: IDocumentData;
    tabIndex?: number;
    name?: string;
}

export interface IInsertSlideAsSheetTabParams<TSlideSnapshot = unknown> {
    hostWorkbookUnitId: string;
    slideSnapshot?: TSlideSnapshot;
    tabIndex?: number;
    name?: string;
}

export interface IInsertBaseAsSheetTabParams {
    hostWorkbookUnitId: string;
    baseSnapshot: IBaseSnapshot;
    tabIndex?: number;
    name?: string;
}

export interface IInsertDocAsSheetFloatingParams {
    hostWorkbookUnitId: string;
    docSnapshot: IDocumentData;
    rect?: IEmbedRect;
}

export interface IInsertSlideAsSheetFloatingParams<TSlideSnapshot = unknown> {
    hostWorkbookUnitId: string;
    slideSnapshot?: TSlideSnapshot;
    rect?: IEmbedRect;
}

export interface IInsertBaseAsSheetFloatingParams {
    hostWorkbookUnitId: string;
    baseSnapshot: IBaseSnapshot;
    rect?: IEmbedRect;
}

export interface IInsertSheetAsBaseTableParams {
    hostBaseUnitId: string;
    sheetSnapshot: IWorkbookData;
    tableIndex?: number;
    name?: string;
}

export interface IInsertDocAsBaseTableParams {
    hostBaseUnitId: string;
    docSnapshot: IDocumentData;
    tableIndex?: number;
    name?: string;
}

export interface IInsertSlideAsBaseTableParams<TSlideSnapshot = unknown> {
    hostBaseUnitId: string;
    slideSnapshot?: TSlideSnapshot;
    tableIndex?: number;
    name?: string;
}

export interface IInsertSheetAsSlidePageParams {
    hostSlideUnitId: string;
    sheetSnapshot: IWorkbookData;
    pageIndex?: number;
    name?: string;
}

export interface IInsertBaseAsSlidePageParams {
    hostSlideUnitId: string;
    baseSnapshot: IBaseSnapshot;
    pageIndex?: number;
    name?: string;
}

export interface IInsertDocAsSlidePageParams {
    hostSlideUnitId: string;
    docSnapshot: IDocumentData;
    pageIndex?: number;
    name?: string;
}

export interface IInsertSheetAsSlideFloatingParams {
    hostSlideUnitId: string;
    sheetSnapshot: IWorkbookData;
    rect?: IEmbedRect;
}

export interface IInsertBaseAsSlideFloatingParams {
    hostSlideUnitId: string;
    baseSnapshot: IBaseSnapshot;
    rect?: IEmbedRect;
}

export interface IInsertDocAsSlideFloatingParams {
    hostSlideUnitId: string;
    docSnapshot: IDocumentData;
    rect?: IEmbedRect;
}

export interface IRemoveEmbedParams {
    hostUnitId: string;
    embedId: string;
}

export interface IGetEmbedParams {
    hostUnitId: string;
    embedId: string;
}

export interface IListEmbedsParams {
    hostUnitId?: string;
}

/**
 * @ignore
 */
export interface IFUniverEmbedMixin {
    /**
     * Insert a workbook snapshot into a document as a doc custom block.
     *
     * The `sheetSnapshot` must be a decoded `IWorkbookData` snapshot. It is not
     * an HTTP/base64 payload and it is not resolved by this facade.
     *
     * @param params.hostDocUnitId The document unit id that receives the block.
     * @param params.sheetSnapshot The workbook snapshot to create as the child unit.
     * @param params.index Optional document block index. If omitted, the host
     * adapter decides the default insertion position.
     * @returns The created embed facade.
     * @example Browser console
     * ```ts
     * const doc = univerAPI.getActiveDocument();
     * const sheetId = `sheet-${Date.now()}`;
     * const sheetSnapshot = {
     *   id: `workbook-${Date.now()}`,
     *   name: 'Embedded Sheet',
     *   appVersion: '1.0.0',
     *   locale: 'enUS',
     *   styles: {},
     *   sheetOrder: [sheetId],
     *   sheets: {
     *     [sheetId]: { id: sheetId, name: 'Sheet1', rowCount: 100, columnCount: 20, cellData: {} },
     *   },
     *   resources: [],
     * };
     * const embed = univerAPI.insertSheetIntoDoc({
     *   hostDocUnitId: doc.getId(),
     *   sheetSnapshot,
     * });
     * console.log(embed.getId(), embed.getChildUnitId());
     * ```
     */
    insertSheetIntoDoc(params: IInsertSheetIntoDocParams): FEmbed;

    /**
     * Insert a Base snapshot into a document as a doc custom block.
     *
     * @param params.hostDocUnitId The document unit id that receives the block.
     * @param params.baseSnapshot The Base snapshot to create as the child unit.
     * @param params.index Optional document block index.
     * @returns The created embed facade.
     * @example Browser console
     * ```ts
     * const doc = univerAPI.getActiveDocument();
     * const now = Date.now();
     * const baseSnapshot = {
     *   id: `base-${Date.now()}`,
     *   name: 'Embedded Base',
     *   schemaVersion: 1,
     *   tables: {},
     *   tableOrder: [],
     *   createdAt: now,
     *   updatedAt: now,
     * };
     * const embed = univerAPI.insertBaseIntoDoc({
     *   hostDocUnitId: doc.getId(),
     *   baseSnapshot,
     * });
     * console.log(embed.getId(), embed.getEntry());
     * ```
     */
    insertBaseIntoDoc(params: IInsertBaseIntoDocParams): FEmbed;

    /**
     * Insert a slide snapshot into a document as a doc custom block.
     *
     * If `slideSnapshot` is omitted, the facade creates a minimal presentation
     * snapshot with one blank page.
     */
    insertSlideIntoDoc<TSlideSnapshot = unknown>(params: IInsertSlideIntoDocParams<TSlideSnapshot>): FEmbed;

    /**
     * Insert a document snapshot into a workbook as a sheet tab block.
     *
     * @param params.hostWorkbookUnitId The workbook unit id that receives the tab.
     * @param params.docSnapshot The document snapshot to create as the child unit.
     * @param params.tabIndex Optional target tab index.
     * @param params.name Optional tab name. If omitted, the host adapter should
     * choose an i18n-aware default and resolve duplicates.
     * @returns The created embed facade.
     * @example Browser console
     * ```ts
     * const workbook = univerAPI.getActiveWorkbook();
     * const docSnapshot = {
     *   id: `doc-${Date.now()}`,
     *   title: 'Embedded Doc',
     *   body: { dataStream: '\r\n' },
     *   documentStyle: {},
     * };
     * const embed = univerAPI.insertDocAsSheetTab({
     *   hostWorkbookUnitId: workbook.getId(),
     *   docSnapshot,
     *   name: 'Notes',
     * });
     * console.log(embed.getHostAnchorId());
     * ```
     */
    insertDocAsSheetTab(params: IInsertDocAsSheetTabParams): FEmbed;

    /**
     * Insert a slide snapshot into a workbook as a sheet tab block.
     *
     * `slideSnapshot` is generic so `@univerjs/embed` stays headless and does
     * not depend on a specific slide package. If it is omitted, the facade
     * creates a minimal presentation snapshot with one blank page.
     *
     * @param params.hostWorkbookUnitId The workbook unit id that receives the tab.
     * @param params.slideSnapshot Optional slide snapshot to create as the child unit.
     * @param params.tabIndex Optional target tab index.
     * @param params.name Optional tab name. If omitted, the host adapter should
     * choose an i18n-aware default and resolve duplicates.
     * @returns The created embed facade.
     * @example Browser console
     * ```ts
     * const workbook = univerAPI.getActiveWorkbook();
     * const pageId = `page-${Date.now()}`;
     * const slideSnapshot = {
     *   id: `slide-${Date.now()}`,
     *   title: 'Embedded Slide',
     *   pageSize: { width: 960, height: 540 },
     *   body: {
     *     pageOrder: [pageId],
     *     pages: {
     *       [pageId]: {
     *         id: pageId,
     *         pageType: 0,
     *         zIndex: 1,
     *         title: 'Blank',
     *         description: '',
     *         pageBackgroundFill: { rgb: '#ffffff' },
     *         pageElements: {},
     *       },
     *     },
     *   },
     * };
     * const embed = univerAPI.insertSlideAsSheetTab({
     *   hostWorkbookUnitId: workbook.getId(),
     *   slideSnapshot,
     * });
     * console.log(embed.getChildUnitId());
     * ```
     */
    insertSlideAsSheetTab<TSlideSnapshot = unknown>(params: IInsertSlideAsSheetTabParams<TSlideSnapshot>): FEmbed;

    /**
     * Insert a Base snapshot into a workbook as a sheet tab block.
     *
     * @param params.hostWorkbookUnitId The workbook unit id that receives the tab.
     * @param params.baseSnapshot The Base snapshot to create as the child unit.
     * @param params.tabIndex Optional target tab index.
     * @param params.name Optional tab name. If omitted, the host adapter should
     * choose an i18n-aware default and resolve duplicates.
     * @returns The created embed facade.
     * @example Browser console
     * ```ts
     * const workbook = univerAPI.getActiveWorkbook();
     * const now = Date.now();
     * const baseSnapshot = {
     *   id: `base-${Date.now()}`,
     *   name: 'Embedded Base',
     *   schemaVersion: 1,
     *   tables: {},
     *   tableOrder: [],
     *   createdAt: now,
     *   updatedAt: now,
     * };
     * const embed = univerAPI.insertBaseAsSheetTab({
     *   hostWorkbookUnitId: workbook.getId(),
     *   baseSnapshot,
     * });
     * console.log(embed.getDescriptor());
     * ```
     */
    insertBaseAsSheetTab(params: IInsertBaseAsSheetTabParams): FEmbed;

    /**
     * Insert a document snapshot into a workbook as a floating block.
     *
     * @param params.hostWorkbookUnitId The workbook unit id that receives the float.
     * @param params.docSnapshot The document snapshot to create as the child unit.
     * @param params.rect Optional initial floating rectangle in sheet coordinates.
     * @returns The created embed facade.
     * @example Browser console
     * ```ts
     * const workbook = univerAPI.getActiveWorkbook();
     * const docSnapshot = {
     *   id: `doc-${Date.now()}`,
     *   title: 'Embedded Doc',
     *   body: { dataStream: '\r\n' },
     *   documentStyle: {},
     * };
     * const embed = univerAPI.insertDocAsSheetFloating({
     *   hostWorkbookUnitId: workbook.getId(),
     *   docSnapshot,
     *   rect: { x: 80, y: 80, width: 480, height: 320 },
     * });
     * console.log(embed.getId());
     * ```
     */
    insertDocAsSheetFloating(params: IInsertDocAsSheetFloatingParams): FEmbed;

    /**
     * Insert a slide snapshot into a workbook as a floating block.
     *
     * If `slideSnapshot` is omitted, the facade creates a minimal presentation
     * snapshot with one blank page.
     *
     * @param params.hostWorkbookUnitId The workbook unit id that receives the float.
     * @param params.slideSnapshot Optional slide snapshot to create as the child unit.
     * @param params.rect Optional initial floating rectangle in sheet coordinates.
     * @returns The created embed facade.
     * @example Browser console
     * ```ts
     * const workbook = univerAPI.getActiveWorkbook();
     * const pageId = `page-${Date.now()}`;
     * const slideSnapshot = {
     *   id: `slide-${Date.now()}`,
     *   title: 'Embedded Slide',
     *   pageSize: { width: 960, height: 540 },
     *   body: {
     *     pageOrder: [pageId],
     *     pages: {
     *       [pageId]: {
     *         id: pageId,
     *         pageType: 0,
     *         zIndex: 1,
     *         title: 'Blank',
     *         description: '',
     *         pageBackgroundFill: { rgb: '#ffffff' },
     *         pageElements: {},
     *       },
     *     },
     *   },
     * };
     * const embed = univerAPI.insertSlideAsSheetFloating({
     *   hostWorkbookUnitId: workbook.getId(),
     *   slideSnapshot,
     *   rect: { x: 80, y: 80, width: 640, height: 360 },
     * });
     * console.log(embed.getChildType());
     * ```
     */
    insertSlideAsSheetFloating<TSlideSnapshot = unknown>(params: IInsertSlideAsSheetFloatingParams<TSlideSnapshot>): FEmbed;

    /**
     * Insert a Base snapshot into a workbook as a floating block.
     *
     * @param params.hostWorkbookUnitId The workbook unit id that receives the float.
     * @param params.baseSnapshot The Base snapshot to create as the child unit.
     * @param params.rect Optional initial floating rectangle in sheet coordinates.
     * @returns The created embed facade.
     * @example Browser console
     * ```ts
     * const workbook = univerAPI.getActiveWorkbook();
     * const now = Date.now();
     * const baseSnapshot = {
     *   id: `base-${Date.now()}`,
     *   name: 'Embedded Base',
     *   schemaVersion: 1,
     *   tables: {},
     *   tableOrder: [],
     *   createdAt: now,
     *   updatedAt: now,
     * };
     * const embed = univerAPI.insertBaseAsSheetFloating({
     *   hostWorkbookUnitId: workbook.getId(),
     *   baseSnapshot,
     *   rect: { x: 80, y: 80, width: 520, height: 360 },
     * });
     * console.log(embed.getEntry());
     * ```
     */
    insertBaseAsSheetFloating(params: IInsertBaseAsSheetFloatingParams): FEmbed;

    /**
     * Insert a workbook snapshot into a Base host as a table-list tab block.
     */
    insertSheetAsBaseTable(params: IInsertSheetAsBaseTableParams): FEmbed;

    /**
     * Insert a document snapshot into a Base host as a table-list tab block.
     */
    insertDocAsBaseTable(params: IInsertDocAsBaseTableParams): FEmbed;

    /**
     * Insert a slide snapshot into a Base host as a table-list tab block.
     *
     * If `slideSnapshot` is omitted, the facade creates a minimal presentation
     * snapshot with one blank page.
     */
    insertSlideAsBaseTable<TSlideSnapshot = unknown>(params: IInsertSlideAsBaseTableParams<TSlideSnapshot>): FEmbed;

    /**
     * Insert a workbook snapshot into a slide host as a page-list tab block.
     */
    insertSheetAsSlidePage(params: IInsertSheetAsSlidePageParams): FEmbed;

    /**
     * Insert a Base snapshot into a slide host as a page-list tab block.
     */
    insertBaseAsSlidePage(params: IInsertBaseAsSlidePageParams): FEmbed;

    /**
     * Insert a document snapshot into a slide host as a page-list tab block.
     */
    insertDocAsSlidePage(params: IInsertDocAsSlidePageParams): FEmbed;

    /**
     * Insert a workbook snapshot into a slide host as a floating block.
     */
    insertSheetAsSlideFloating(params: IInsertSheetAsSlideFloatingParams): FEmbed;

    /**
     * Insert a Base snapshot into a slide host as a floating block.
     */
    insertBaseAsSlideFloating(params: IInsertBaseAsSlideFloatingParams): FEmbed;

    /**
     * Insert a document snapshot into a slide host as a floating block.
     */
    insertDocAsSlideFloating(params: IInsertDocAsSlideFloatingParams): FEmbed;

    /**
     * Remove an embed by host unit id and embed id.
     *
     * @param params.hostUnitId The host unit id that owns the embed.
     * @param params.embedId The embed id to remove.
     * @returns `true` when the remove command succeeds.
     * @example Browser console
     * ```ts
     * const embed = univerAPI.listEmbeds()[0];
     * console.log(univerAPI.removeEmbed({
     *   hostUnitId: embed.getHostUnitId(),
     *   embedId: embed.getId(),
     * }));
     * ```
     */
    removeEmbed(params: IRemoveEmbedParams): boolean;

    /**
     * Get one embed by host unit id and embed id.
     *
     * @param params.hostUnitId The host unit id that owns the embed.
     * @param params.embedId The embed id to read.
     * @returns The embed facade, or `null` when it does not exist.
     * @example Browser console
     * ```ts
     * const first = univerAPI.listEmbeds()[0];
     * const embed = univerAPI.getEmbed({
     *   hostUnitId: first.getHostUnitId(),
     *   embedId: first.getId(),
     * });
     * console.log(embed && embed.getDescriptor());
     * ```
     */
    getEmbed(params: IGetEmbedParams): FEmbed | null;

    /**
     * List active embeds.
     *
     * @param params.hostUnitId Optional host unit id. When omitted, all active
     * embeds in the local runtime are returned.
     * @returns Active embed facades.
     * @example Browser console
     * ```ts
     * const embeds = univerAPI.listEmbeds();
     * console.table(embeds.map((embed) => ({
     *   id: embed.getId(),
     *   hostUnitId: embed.getHostUnitId(),
     *   childUnitId: embed.getChildUnitId(),
     *   entry: embed.getEntry(),
     * })));
     * ```
     */
    listEmbeds(params?: IListEmbedsParams): FEmbed[];
}

/**
 * The embed facade mixin on `FUniver`.
 * @ignore
 */
export class FUniverEmbedMixin extends FUniverClass implements IFUniverEmbedMixin {
    override insertSheetIntoDoc(params: IInsertSheetIntoDocParams): FEmbed {
        return this._insertEmbedBySnapshot({
            hostUnitId: params.hostDocUnitId,
            hostType: UniverType.UNIVER_DOC,
            entry: EmbedHostEntryEnum.DocsCustomBlock,
            childType: UniverType.UNIVER_SHEET,
            unitSnapshot: params.sheetSnapshot,
            hostContext: omitUndefined({ index: params.index }),
        });
    }

    override insertBaseIntoDoc(params: IInsertBaseIntoDocParams): FEmbed {
        return this._insertEmbedBySnapshot({
            hostUnitId: params.hostDocUnitId,
            hostType: UniverType.UNIVER_DOC,
            entry: EmbedHostEntryEnum.DocsCustomBlock,
            childType: UniverType.UNIVER_BASE,
            unitSnapshot: params.baseSnapshot,
            hostContext: omitUndefined({ index: params.index }),
        });
    }

    override insertSlideIntoDoc<TSlideSnapshot = unknown>(params: IInsertSlideIntoDocParams<TSlideSnapshot>): FEmbed {
        return this._insertEmbedBySnapshot({
            hostUnitId: params.hostDocUnitId,
            hostType: UniverType.UNIVER_DOC,
            entry: EmbedHostEntryEnum.DocsCustomBlock,
            childType: UniverType.UNIVER_SLIDE,
            unitSnapshot: resolveSlideSnapshot(params.slideSnapshot),
            hostContext: omitUndefined({ index: params.index }),
        });
    }

    override insertDocAsSheetTab(params: IInsertDocAsSheetTabParams): FEmbed {
        return this._insertEmbedBySnapshot({
            hostUnitId: params.hostWorkbookUnitId,
            hostType: UniverType.UNIVER_SHEET,
            entry: EmbedHostEntryEnum.SheetsSheetTab,
            childType: UniverType.UNIVER_DOC,
            unitSnapshot: params.docSnapshot,
            hostContext: omitUndefined({ sheetIndex: params.tabIndex, sheetName: params.name }),
        });
    }

    override insertSlideAsSheetTab<TSlideSnapshot = unknown>(params: IInsertSlideAsSheetTabParams<TSlideSnapshot>): FEmbed {
        return this._insertEmbedBySnapshot({
            hostUnitId: params.hostWorkbookUnitId,
            hostType: UniverType.UNIVER_SHEET,
            entry: EmbedHostEntryEnum.SheetsSheetTab,
            childType: UniverType.UNIVER_SLIDE,
            unitSnapshot: resolveSlideSnapshot(params.slideSnapshot, params.name),
            hostContext: omitUndefined({ sheetIndex: params.tabIndex, sheetName: params.name }),
        });
    }

    override insertBaseAsSheetTab(params: IInsertBaseAsSheetTabParams): FEmbed {
        return this._insertEmbedBySnapshot({
            hostUnitId: params.hostWorkbookUnitId,
            hostType: UniverType.UNIVER_SHEET,
            entry: EmbedHostEntryEnum.SheetsSheetTab,
            childType: UniverType.UNIVER_BASE,
            unitSnapshot: params.baseSnapshot,
            hostContext: omitUndefined({ sheetIndex: params.tabIndex, sheetName: params.name }),
        });
    }

    override insertDocAsSheetFloating(params: IInsertDocAsSheetFloatingParams): FEmbed {
        return this._insertEmbedBySnapshot({
            hostUnitId: params.hostWorkbookUnitId,
            hostType: UniverType.UNIVER_SHEET,
            entry: EmbedHostEntryEnum.SheetsFloatingObject,
            childType: UniverType.UNIVER_DOC,
            unitSnapshot: params.docSnapshot,
            hostContext: rectToHostContext(params.rect),
        });
    }

    override insertSlideAsSheetFloating<TSlideSnapshot = unknown>(params: IInsertSlideAsSheetFloatingParams<TSlideSnapshot>): FEmbed {
        return this._insertEmbedBySnapshot({
            hostUnitId: params.hostWorkbookUnitId,
            hostType: UniverType.UNIVER_SHEET,
            entry: EmbedHostEntryEnum.SheetsFloatingObject,
            childType: UniverType.UNIVER_SLIDE,
            unitSnapshot: resolveSlideSnapshot(params.slideSnapshot),
            hostContext: rectToHostContext(params.rect),
        });
    }

    override insertBaseAsSheetFloating(params: IInsertBaseAsSheetFloatingParams): FEmbed {
        return this._insertEmbedBySnapshot({
            hostUnitId: params.hostWorkbookUnitId,
            hostType: UniverType.UNIVER_SHEET,
            entry: EmbedHostEntryEnum.SheetsFloatingObject,
            childType: UniverType.UNIVER_BASE,
            unitSnapshot: params.baseSnapshot,
            hostContext: rectToHostContext(params.rect),
        });
    }

    override insertSheetAsBaseTable(params: IInsertSheetAsBaseTableParams): FEmbed {
        return this._insertEmbedBySnapshot({
            hostUnitId: params.hostBaseUnitId,
            hostType: UniverType.UNIVER_BASE,
            entry: EmbedHostEntryEnum.BasesTableListBlock,
            childType: UniverType.UNIVER_SHEET,
            unitSnapshot: params.sheetSnapshot,
            hostContext: omitUndefined({ tableIndex: params.tableIndex, tableName: params.name }),
        });
    }

    override insertDocAsBaseTable(params: IInsertDocAsBaseTableParams): FEmbed {
        return this._insertEmbedBySnapshot({
            hostUnitId: params.hostBaseUnitId,
            hostType: UniverType.UNIVER_BASE,
            entry: EmbedHostEntryEnum.BasesTableListBlock,
            childType: UniverType.UNIVER_DOC,
            unitSnapshot: params.docSnapshot,
            hostContext: omitUndefined({ tableIndex: params.tableIndex, tableName: params.name }),
        });
    }

    override insertSlideAsBaseTable<TSlideSnapshot = unknown>(params: IInsertSlideAsBaseTableParams<TSlideSnapshot>): FEmbed {
        return this._insertEmbedBySnapshot({
            hostUnitId: params.hostBaseUnitId,
            hostType: UniverType.UNIVER_BASE,
            entry: EmbedHostEntryEnum.BasesTableListBlock,
            childType: UniverType.UNIVER_SLIDE,
            unitSnapshot: resolveSlideSnapshot(params.slideSnapshot, params.name),
            hostContext: omitUndefined({ tableIndex: params.tableIndex, tableName: params.name }),
        });
    }

    override insertSheetAsSlidePage(params: IInsertSheetAsSlidePageParams): FEmbed {
        return this._insertEmbedBySnapshot({
            hostUnitId: params.hostSlideUnitId,
            hostType: UniverType.UNIVER_SLIDE,
            entry: EmbedHostEntryEnum.SlidesPageListBlock,
            childType: UniverType.UNIVER_SHEET,
            unitSnapshot: params.sheetSnapshot,
            hostContext: omitUndefined({ pageIndex: params.pageIndex, pageName: params.name }),
        });
    }

    override insertBaseAsSlidePage(params: IInsertBaseAsSlidePageParams): FEmbed {
        return this._insertEmbedBySnapshot({
            hostUnitId: params.hostSlideUnitId,
            hostType: UniverType.UNIVER_SLIDE,
            entry: EmbedHostEntryEnum.SlidesPageListBlock,
            childType: UniverType.UNIVER_BASE,
            unitSnapshot: params.baseSnapshot,
            hostContext: omitUndefined({ pageIndex: params.pageIndex, pageName: params.name }),
        });
    }

    override insertDocAsSlidePage(params: IInsertDocAsSlidePageParams): FEmbed {
        return this._insertEmbedBySnapshot({
            hostUnitId: params.hostSlideUnitId,
            hostType: UniverType.UNIVER_SLIDE,
            entry: EmbedHostEntryEnum.SlidesPageListBlock,
            childType: UniverType.UNIVER_DOC,
            unitSnapshot: params.docSnapshot,
            hostContext: omitUndefined({ pageIndex: params.pageIndex, pageName: params.name }),
        });
    }

    override insertSheetAsSlideFloating(params: IInsertSheetAsSlideFloatingParams): FEmbed {
        return this._insertEmbedBySnapshot({
            hostUnitId: params.hostSlideUnitId,
            hostType: UniverType.UNIVER_SLIDE,
            entry: EmbedHostEntryEnum.SlidesFloatingObject,
            childType: UniverType.UNIVER_SHEET,
            unitSnapshot: params.sheetSnapshot,
            hostContext: rectToHostContext(params.rect),
        });
    }

    override insertBaseAsSlideFloating(params: IInsertBaseAsSlideFloatingParams): FEmbed {
        return this._insertEmbedBySnapshot({
            hostUnitId: params.hostSlideUnitId,
            hostType: UniverType.UNIVER_SLIDE,
            entry: EmbedHostEntryEnum.SlidesFloatingObject,
            childType: UniverType.UNIVER_BASE,
            unitSnapshot: params.baseSnapshot,
            hostContext: rectToHostContext(params.rect),
        });
    }

    override insertDocAsSlideFloating(params: IInsertDocAsSlideFloatingParams): FEmbed {
        return this._insertEmbedBySnapshot({
            hostUnitId: params.hostSlideUnitId,
            hostType: UniverType.UNIVER_SLIDE,
            entry: EmbedHostEntryEnum.SlidesFloatingObject,
            childType: UniverType.UNIVER_DOC,
            unitSnapshot: params.docSnapshot,
            hostContext: rectToHostContext(params.rect),
        });
    }

    override removeEmbed(params: IRemoveEmbedParams): boolean {
        const embed = this.getEmbed(params);
        return embed ? embed.remove() : false;
    }

    override getEmbed(params: IGetEmbedParams): FEmbed | null {
        const descriptor = this._injector.get(EmbedModelService).getDescriptor(params.hostUnitId, params.embedId);
        return descriptor ? this._toFEmbed(descriptor) : null;
    }

    override listEmbeds(params: IListEmbedsParams = {}): FEmbed[] {
        const model = this._injector.get(EmbedModelService);
        const descriptors = params.hostUnitId
            ? model.getActiveDescriptors(params.hostUnitId)
            : model.getAllActiveDescriptors();
        return descriptors.map((descriptor) => this._toFEmbed(descriptor));
    }

    private _insertEmbedBySnapshot<TSnapshot>(params: IInsertEmbedBySnapshotCommandParams<TSnapshot>): FEmbed {
        const commandId = this._commandService.hasCommand(INSERT_HOST_EMBED_BY_SNAPSHOT_COMMAND_ID)
            ? INSERT_HOST_EMBED_BY_SNAPSHOT_COMMAND_ID
            : InsertEmbedBySnapshotCommand.id;
        const descriptor = this._commandService.syncExecuteCommand<IInsertEmbedBySnapshotCommandParams<TSnapshot>, IEmbedDescriptor | false>(
            commandId,
            params
        );
        if (!descriptor) {
            throw new Error('EMBED_INSERT_FAILED');
        }

        return this._toFEmbed(descriptor);
    }

    private _toFEmbed(descriptor: IEmbedDescriptor): FEmbed {
        return this._injector.createInstance(FEmbed, descriptor);
    }
}

FUniverClass.extend(FUniverEmbedMixin);

declare module '@univerjs/core/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FUniver extends IFUniverEmbedMixin {}
}

function omitUndefined<T extends Record<string, unknown>>(value: T): Record<string, unknown> | undefined {
    const entries = Object.entries(value).filter(([, item]) => item !== undefined);
    return entries.length ? Object.fromEntries(entries) : undefined;
}

function rectToHostContext(rect?: IEmbedRect): Record<string, unknown> | undefined {
    if (!rect) {
        return undefined;
    }

    return {
        left: rect.x,
        top: rect.y,
        width: rect.width,
        height: rect.height,
    };
}

function resolveSlideSnapshot<TSlideSnapshot>(
    slideSnapshot: TSlideSnapshot | undefined,
    name = 'Embedded Slides'
): TSlideSnapshot | Record<string, unknown> {
    return slideSnapshot ?? createEmptySlideSnapshot(name);
}

function createEmptySlideSnapshot(name: string): Record<string, unknown> {
    const unitId = generateRandomId(6);
    const pageId = generateRandomId(6);

    return {
        id: unitId,
        name,
        title: name,
        appVersion: '0.0.1',
        locale: 'enUS',
        defaultPageSize: { width: 960, height: 540 },
        slideOrder: [pageId],
        slides: {
            [pageId]: {
                id: pageId,
                pageType: 'slide',
                name: 'Slide 1',
                background: {
                    type: 'solid',
                    color: '#ffffff',
                },
                showMasterSp: true,
                elementOrder: [],
                elements: {},
            },
        },
        activeSlideId: pageId,
        pageSize: { width: 960, height: 540 },
        body: {
            pageOrder: [pageId],
            pages: {
                [pageId]: {
                    id: pageId,
                    pageType: 0,
                    zIndex: 1,
                    title: 'Slide 1',
                    description: '',
                    pageBackgroundFill: { rgb: '#ffffff' },
                    pageElements: {},
                },
            },
        },
    };
}
