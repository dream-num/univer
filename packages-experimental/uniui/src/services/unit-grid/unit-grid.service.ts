/**
 * Copyright 2023-present DreamNum Inc.
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

import { Disposable, isInternalEditorID } from '@univerjs/core';
import type { IRender } from '@univerjs/engine-render';
import { IRenderManagerService } from '@univerjs/engine-render';
import { BehaviorSubject } from 'rxjs';

export type IUnitGrid = string[];

/**
 * This services decides which (now at maximum two) units are going to be rendered in the browser.
 */
export class UnitGridService extends Disposable {
    // TODO@wzhudev: currently we only support at maximum 2 units rendered side by side.
    // In the future we would introduce a grid system (very much like vscode's) to support more
    // units and more complex layout.
    private _unitGrid: IUnitGrid = [];
    private readonly _unitGrid$ = new BehaviorSubject<IUnitGrid>(this._unitGrid);
    readonly unitGrid$ = this._unitGrid$.asObservable();

    constructor(
        @IRenderManagerService private readonly _renderSrv: IRenderManagerService
    ) {
        super();

        this._init();
    }

    setContainerForRender(unitId: string, element: HTMLElement) {
        this._renderSrv.getRenderById(unitId)?.engine.setContainer(element);
    }

    override dispose(): void {
        super.dispose();

        this._unitGrid$.complete();
    }

    private _init(): void {
        this._renderSrv.getRenderAll().forEach((renderer) => this._onRendererCreated(renderer));
        this.disposeWithMe(this._renderSrv.created$.subscribe((renderer) => this._onRendererCreated(renderer)));
        this.disposeWithMe(this._renderSrv.disposed$.subscribe((unitId) => this._onRenderedDisposed(unitId)));
    }

    private _onRendererCreated(renderer: IRender): void {
        if (isInternalEditorID(renderer.unitId)) {
            return;
        }

        this._unitGrid.push(renderer.unitId);
        this._emitLayoutChange();
    }

    private _onRenderedDisposed(unitId: string): void {
        const idx = this._unitGrid.indexOf(unitId);
        if (idx !== -1) {
            this._unitGrid.splice(idx, 1);
            this._emitLayoutChange();
        }
    }

    private _emitLayoutChange(): void {
        this._unitGrid$.next(this._unitGrid);
    }
}
