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

import { Disposable, IUniverInstanceService, ThemeService, Tools } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import type { ISelectionWithStyle } from '@univerjs/sheets';
import { createIdentifier, Inject } from '@wendellhu/redi';

import { ISelectionRenderService } from '../selection/selection-render.service';
import { SelectionShape } from '../selection/selection-shape';
import { SheetSkeletonManagerService } from '../sheet-skeleton-manager.service';

export interface IMarkSelectionService {
    addShape(selection: ISelectionWithStyle, exits?: string[], zIndex?: number): string | null;
    removeShape(id: string): void;
    removeAllShapes(): void;
    refreshShapes(): void;
    getShapeMap(): Map<string, IMarkSelectionInfo>;
}

interface IMarkSelectionInfo {
    unitId: string;
    subUnitId: string;
    selection: ISelectionWithStyle;
    zIndex: number;
    control: SelectionShape | null;
    exits: string[];
}

const DEFAULT_Z_INDEX = 10000;
export const IMarkSelectionService = createIdentifier<IMarkSelectionService>('univer.mark-selection-service');

export class MarkSelectionService extends Disposable implements IMarkSelectionService {
    private _shapeMap: Map<string, IMarkSelectionInfo> = new Map();

    constructor(
        @IUniverInstanceService private readonly _currentService: IUniverInstanceService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @ISelectionRenderService private readonly _selectionRenderService: ISelectionRenderService,
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @Inject(ThemeService) private readonly _themeService: ThemeService
    ) {
        super();
    }

    addShape(selection: ISelectionWithStyle, exits: string[] = [], zIndex: number = DEFAULT_Z_INDEX): string | null {
        const workbook = this._currentService.getCurrentUniverSheetInstance();
        const subUnitId = workbook.getActiveSheet().getSheetId();
        const id = Tools.generateRandomId();
        this._shapeMap.set(id, {
            selection,
            subUnitId,
            unitId: workbook.getUnitId(),
            zIndex,
            control: null,
            exits,
        });
        this.refreshShapes();
        return id;
    }

    refreshShapes() {
        const currentUnitId = this._currentService.getCurrentUniverSheetInstance().getUnitId();
        const currentSubUnitId = this._currentService.getCurrentUniverSheetInstance().getActiveSheet().getSheetId();
        this._shapeMap.forEach((shape) => {
            const { unitId, subUnitId, selection, control: oldControl, zIndex } = shape;

            oldControl && oldControl.dispose();

            if (unitId !== currentUnitId || subUnitId !== currentSubUnitId) {
                return;
            }

            const { style } = selection;
            const { scene } = this._renderManagerService.getRenderById(unitId) || {};
            const { rangeWithCoord, primaryWithCoord } =
                this._selectionRenderService.convertSelectionRangeToData(selection);
            const skeleton = this._sheetSkeletonManagerService.getCurrent()?.skeleton;
            if (!scene || !skeleton) return;
            const { rowHeaderWidth, columnHeaderHeight } = skeleton;
            const control = new SelectionShape(scene, zIndex, false, this._themeService);
            control.update(rangeWithCoord, rowHeaderWidth, columnHeaderHeight, style, primaryWithCoord);
            shape.control = control;
        });
    }

    getShapeMap(): Map<string, IMarkSelectionInfo> {
        return this._shapeMap;
    }

    removeShape(id: string): void {
        const shapeInfo = this._shapeMap.get(id);
        if (!shapeInfo) return;
        const { control } = shapeInfo;
        control && control.dispose();
        this._shapeMap.delete(id);
    }

    removeAllShapes(): void {
        for (const shape of this._shapeMap.values()) {
            const { control } = shape;
            control && control.dispose();
        }
        this._shapeMap.clear();
    }
}
