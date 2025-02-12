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

import type { Nullable, UnitModel } from '@univerjs/core';
import { createIdentifier, Disposable, ILocalStorageService, isInternalEditorID, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import type { IRender } from '@univerjs/engine-render';
import { IRenderManagerService } from '@univerjs/engine-render';
import type { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

export type IUnitGrid = IProjectNode[];

export interface IProjectNode {
    id: string;
    data: {
        unitId: string;
        type: UniverInstanceType;
    };
    style: {
        width: string;
        height: string;
        display: string;
        borderRadius: string;
        border: string;
        backgroundColor: string;
    };
    position: {
        x: number;
        y: number;
    };
}

export interface IUnitGridService {
    readonly unitGrid: IProjectNode[];
    readonly unitGrid$: Observable<IProjectNode[]>;
    readonly newNode: IProjectNode | null;
    readonly newNode$: Observable<IProjectNode | null>;

    setContainerForRender(unitId: string, element: HTMLElement): void;

    changeDimension(id: string, dimensions: { width: number; height: number }): void;
    changePosition(id: string, position: { x: number; y: number }): void;

}

export const IUnitGridService = createIdentifier<IUnitGridService>('uniui.grid.service');

// NOTE: please note that caching position and dimension of units is just for demo.
// The grid should be a unit itself.

/**
 * This services decides which (now at maximum two) units are going to be rendered in the browser.
 */
export class UnitGridService extends Disposable implements IUnitGridService {
    // TODO@wzhudev: currently we only support at maximum 2 units rendered side by side.
    // In the future we would introduce a grid system (very much like vscode's) to support more
    // units and more complex layout.
    protected _unitGrid: IUnitGrid = [];
    private readonly _unitGrid$ = new BehaviorSubject<IUnitGrid>(this._unitGrid);
    readonly unitGrid$ = this._unitGrid$.asObservable();

    protected _newNode: IProjectNode | null = null;
    private readonly _newNode$ = new BehaviorSubject<IProjectNode | null>(null);
    readonly newNode$ = this._newNode$.asObservable();

    get unitGrid() { return this._unitGrid; }
    get cachedGrid() { return this._cachedGrid; }
    get newNode() { return this._newNode; }

    private _nodeIndex = 0;

    constructor(
        @IRenderManagerService protected readonly _renderSrv: IRenderManagerService,
        @ILocalStorageService protected readonly _localStorageService: ILocalStorageService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService
    ) {
        super();

        this._init();
    }

    override dispose(): void {
        super.dispose();

        this._unitGrid$.complete();
        this._newNode$.complete();
    }

    setNewNodeObserver() {
        this._newNode$.next(this._newNode);
    }

    setContainerForRender(unitId: string, element: HTMLElement) {
        this._renderSrv.getRenderById(unitId)?.engine.setContainer(element);
    }

    changeDimension(id: string, dimension: { width: number; height: number }): void {
        const node = this._unitGrid.find((item) => item.id === id);
        if (node) {
            node.style.width = `${dimension.width}px`;
            node.style.height = `${dimension.height}px`;
            this._cacheData();
        }
    }

    changePosition(id: string, position: { x: number; y: number }): void {
        const node = this._unitGrid.find((item) => item.id === id);
        if (node) {
            node.position.x = position.x;
            node.position.y = position.y;
            this._cacheData();
        }
    }

    private async _init(): Promise<void> {
        await this._initData();

        this._renderSrv.getRenderAll().forEach((renderer) => this._onRendererCreated(renderer));
        this.disposeWithMe(this._renderSrv.created$.subscribe((render) => this._onRendererCreated(render)));
        // When hot reload in development mode, render dispose will be triggered, causing data to be cleared. Replace it with unitDispose
        this.disposeWithMe(this._univerInstanceService.unitDisposed$.subscribe((unitModel) => this._onUnitDisposed(unitModel)));
    }

    protected _cachedGrid: Nullable<IUnitGrid> = null;
    protected async _initData(): Promise<void> {
        const raw = await this._localStorageService.getItem<IUnitGrid>(getGridUnitLocalCacheKey('static'));
        if (raw) {
            this._cachedGrid = raw;
        }
    }

    protected _cacheData(): void {
        this._localStorageService.setItem(getGridUnitLocalCacheKey('static'), this.unitGrid);
    }

    protected _onRendererCreated(renderer: IRender): void {
        const { unitId, type, isThumbNail } = renderer;
        if (isInternalEditorID(unitId) || isThumbNail) {
            return;
        }

        this._insertNewNode(unitId, type);
    }

    private _insertNewNode(unitId: string, type: UniverInstanceType): void {
        const index = this._nodeIndex;
        this._nodeIndex += 1;

        const MAX_COUNT_IN_ROW = 3;
        const newNode: IProjectNode = this._cachedGrid?.find((item) => item.id === unitId) ?? {
            id: unitId,
            data: {
                unitId,
                type,
            },
            style: {
                width: type === UniverInstanceType.UNIVER_SLIDE ? '1000px' : '940px',
                height: '854px',
                display: 'flex',
                borderRadius: '8px',
                border: '1px solid #ccc',
                backgroundColor: type === UniverInstanceType.UNIVER_SHEET ? '#fff' : '#f4f6f8',
            },
            position: { x: (index % MAX_COUNT_IN_ROW) * 1050, y: Math.floor(index / MAX_COUNT_IN_ROW) * 950 + 40 },
        };

        this._unitGrid.push(newNode);
        this._newNode = newNode; // set new node, for viewport to scroll to
        this._emitLayoutChange();
    }

    protected _onUnitDisposed(unitModel: UnitModel): void {
        const unitId = unitModel.getUnitId();
        const idx = this._unitGrid.findIndex((item) => item.id === unitId);
        if (idx !== -1) {
            this._unitGrid.splice(idx, 1);
            this._emitLayoutChange();
        }
    }

    private _emitLayoutChange(): void {
        this._unitGrid$.next(this._unitGrid.slice());
        this._cacheData();
    }
}

export function getGridUnitLocalCacheKey(projectId: string): string {
    return `project-cache-${projectId}`;
}
