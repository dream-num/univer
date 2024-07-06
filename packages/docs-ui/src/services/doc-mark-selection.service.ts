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

import type { DocumentDataModel } from '@univerjs/core';
import { IUniverInstanceService, Tools, UniverInstanceType } from '@univerjs/core';
import { type BaseObject, IRenderManagerService, type ITextRangeWithStyle } from '@univerjs/engine-render';

export interface IDocMarkSelectionService {
    addShape(selection: ITextRangeWithStyle, zIndex?: number): string | null;
    removeShape(id: string): void;
    removeAllShapes(): void;
    refreshShapes(): void;
    getShapeMap(): Map<string, IDocMarkSelectionInfo>;
}

export interface IDocMarkSelectionInfo {
    control: BaseObject[] | null;
    unitId: string;
    selection: ITextRangeWithStyle;
    zIndex: number;
}

const DEFAULT_Z_INDEX = 10000;

export class DocMarkSelectionService implements IDocMarkSelectionService {
    private _shapeMap: Map<string, IDocMarkSelectionInfo> = new Map();

    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService
    ) {}

    addShape(selection: ITextRangeWithStyle, zIndex = DEFAULT_Z_INDEX): string | null {
        const doc = this._univerInstanceService.getCurrentUnitForType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        if (!doc) return null;
        const id = Tools.generateRandomId();

        this._shapeMap.set(id, {
            selection,
            unitId: doc.getUnitId(),
            zIndex,
            control: null,
        });

        this.refreshShapes();
        return id;
    }

    removeShape(id: string): void {
        const shapeInfo = this._shapeMap.get(id);
        if (!shapeInfo) return;
        const { control } = shapeInfo;
        control && control.forEach((obj) => obj.dispose());
        this._shapeMap.delete(id);
    }

    removeAllShapes(): void {
        for (const shape of this._shapeMap.values()) {
            const { control } = shape;
            control && control.forEach((obj) => obj.dispose());
        }
        this._shapeMap.clear();
    }

    refreshShapes() {
        const doc = this._univerInstanceService.getCurrentUnitForType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        if (!doc) return;

        const currentUnitId = doc.getUnitId();
        this._shapeMap.forEach((shape) => {
            const { unitId, selection, control: oldControl, zIndex } = shape;

            oldControl && oldControl.forEach((obj) => obj.dispose());

            if (unitId !== currentUnitId) {
                return;
            }

            const { style } = selection;
            const renderUnit = this._renderManagerService.getRenderById(unitId);
            const scene = renderUnit?.scene;
            // const { rangeWithCoord, primaryWithCoord } =
                // this._selectionRenderService.attachSelectionWithCoord(selection);

            // const skeleton = this._renderManagerService.withCurrentTypeOfUnit(UniverInstanceType.UNIVER_SHEET, SheetSkeletonManagerService)?.getCurrentSkeleton();
            // if (!scene || !skeleton) return;

            // const { rowHeaderWidth, columnHeaderHeight } = skeleton;
            // const control = new SelectionShape(scene, zIndex, false, this._themeService);
            // control.update(rangeWithCoord, rowHeaderWidth, columnHeaderHeight, style, primaryWithCoord);
            // shape.control = control;
        });
    }

    getShapeMap(): Map<string, IDocMarkSelectionInfo> {
        return this._shapeMap;
    }
}
