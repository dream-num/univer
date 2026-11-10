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

import type { DisposableCollection, IDocumentData, IDrawingParam } from '@univerjs/core';
import type {
    Documents,
    DocumentSkeleton,
    Engine,
    IBoundRectNoAngle,
    IDocumentSkeletonHeaderFooter,
    IDocumentSkeletonPage,
    Scene,
} from '@univerjs/engine-render';
import { createInterceptorKey, Disposable, InterceptorManager } from '@univerjs/core';

export interface IDocPrintContext {
    unitId: string;
    pageIndex?: number;
    scene: Scene;
    engine: Engine;
    root: HTMLElement;
    skeleton: DocumentSkeleton;
}

export interface IDocPrintDomtContext extends IDocPrintContext {
    offset: { x: number; y: number };
    bound: IBoundRectNoAngle;
}
export interface IDocPrintComponentContext extends IDocPrintContext {
    documents: Documents;
}

export interface IDocPrintPreparationContext {
    unitId: string;
    dpr: number;
}

const PRINTING_COMPONENT_COLLECT = createInterceptorKey<undefined, IDocPrintComponentContext>('PRINTING_COMPONENT_COLLECT');
const PRINTING_DOM_COLLECT = createInterceptorKey<DisposableCollection, IDocPrintDomtContext>('PRINTING_DOM_COLLECT');

export class DocPrintInterceptorService extends Disposable {
    getDrawingForPrint<T extends IDrawingParam>(skeleton: DocumentSkeleton, drawing: T): T {
        const model = skeleton.getViewModel().getDataModel();
        let drawings = model.getDrawings();
        if (!drawings?.[drawing.drawingId]) {
            drawings = Object.values(model.getSnapshot().notes ?? {}).find((note) => note.drawings?.[drawing.drawingId])?.drawings;
        }
        const source = drawings?.[drawing.drawingId];
        if (!source) {
            return drawing;
        }
        let hidden = source.hidden === true;
        let groupId: string | undefined = source.groupId;
        const visited = new Set<string>();
        while (!hidden && groupId && !visited.has(groupId)) {
            visited.add(groupId);
            const parent = drawings?.[groupId];
            if (!parent) {
                break;
            }
            hidden = parent.hidden === true;
            groupId = parent.groupId;
        }
        // Viewport culling is transient; print visibility comes from the document.
        return { ...drawing, hidden };
    }

    private _printComponentMap: Map<string, string> = new Map();
    private readonly _printPreparationHandlers = new Set<(context: IDocPrintPreparationContext) => Promise<void>>();

    readonly interceptor = new InterceptorManager({
        PRINTING_COMPONENT_COLLECT,
        PRINTING_DOM_COLLECT,
    });

    constructor() {
        super();

        this.disposeWithMe(this.interceptor.intercept(this.interceptor.getInterceptPoints().PRINTING_COMPONENT_COLLECT, {
            priority: -1,
            handler: (_value) => _value,
        }));

        this.disposeWithMe(this.interceptor.intercept(this.interceptor.getInterceptPoints().PRINTING_DOM_COLLECT, {
            priority: -1,
            handler: (_value) => _value,
        }));
    }

    registerPrintComponent(componentKey: string, printingComponentKey: string) {
        this._printComponentMap.set(componentKey, printingComponentKey);
    }

    getPrintComponent(componentKey: string) {
        return this._printComponentMap.get(componentKey);
    }

    getPageDrawingIds(skeleton: DocumentSkeleton, pageIndex?: number): ReadonlySet<string> | null {
        const data = skeleton.getSkeletonData();
        if (!data || pageIndex == null) {
            return null;
        }

        const drawingIds = new Set<string>();
        // Every print slice of a continuous document belongs to its one measured page.
        const page = data.pages.length === 1 ? data.pages[0] : data.pages[pageIndex];
        if (!page) {
            return drawingIds;
        }

        collectPageDrawingIds(page, drawingIds);
        const header = data.skeHeaders.get(page.headerId)?.get(page.headerLayoutKey ?? page.pageWidth);
        const footer = data.skeFooters.get(page.footerId)?.get(page.footerLayoutKey ?? page.pageWidth);
        if (header) {
            collectPageDrawingIds(header, drawingIds);
        }
        if (footer) {
            collectPageDrawingIds(footer, drawingIds);
        }

        collectGroupedDrawingIds(skeleton.getViewModel().getDataModel().getSnapshot(), drawingIds);
        return drawingIds;
    }

    registerPrintPreparation(handler: (context: IDocPrintPreparationContext) => Promise<void>) {
        this._printPreparationHandlers.add(handler);
        return () => this._printPreparationHandlers.delete(handler);
    }

    async preparePrint(context: IDocPrintPreparationContext): Promise<void> {
        await Promise.all([...this._printPreparationHandlers].map((handler) => handler(context)));
    }

    override dispose(): void {
        this._printPreparationHandlers.clear();
        super.dispose();
    }
}

function collectGroupedDrawingIds(document: IDocumentData, drawingIds: Set<string>): void {
    const drawingMaps = [document.drawings, ...Object.values(document.notes ?? {}).map((note) => note.drawings)];
    const children = new Map<string, string[]>();
    for (const drawings of drawingMaps) {
        for (const drawing of Object.values(drawings ?? {})) {
            if (drawing.groupId) {
                const siblings = children.get(drawing.groupId) ?? [];
                siblings.push(drawing.drawingId);
                children.set(drawing.groupId, siblings);
            }
        }
    }
    const pending = [...drawingIds];
    for (let index = 0; index < pending.length; index++) {
        for (const child of children.get(pending[index]) ?? []) {
            if (!drawingIds.has(child)) {
                drawingIds.add(child);
                pending.push(child);
            }
        }
    }
}

function collectPageDrawingIds(page: IDocumentSkeletonPage | IDocumentSkeletonHeaderFooter, drawingIds: Set<string>): void {
    for (const drawingId of page.skeDrawings.keys()) {
        drawingIds.add(drawingId);
    }
    for (const note of page.notes ?? []) {
        collectPageDrawingIds(note.page, drawingIds);
    }
    for (const group of page.skeColumnGroups?.values() ?? []) {
        for (const column of group.columns) {
            collectPageDrawingIds(column.page, drawingIds);
        }
    }
    // Cell drawings belong to their cell skeleton, not the host page's map.
    for (const table of page.skeTables.values()) {
        for (const row of table.rows) {
            for (const cell of row.cells) {
                collectPageDrawingIds(cell, drawingIds);
            }
        }
    }
}
