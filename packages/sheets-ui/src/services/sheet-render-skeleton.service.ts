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

import { SpreadsheetRenderSkeleton } from '../components/sheets/sheet.render-skeleton';
import {
    Disposable,
    Inject,
    Injector,
    IUniverInstanceService,
    type Nullable,
    type Styles,
    UniverInstanceType,
    type Workbook,
    type Worksheet,
} from '@univerjs/core';
import { type Scene } from '@univerjs/engine-render';
import { SheetSkeletonService } from '@univerjs/sheets';
import { Subject } from 'rxjs';

export interface ISheetRenderSkeletonManagerParam {
    unitId: string;
    sheetId: string;
    skeleton: SpreadsheetRenderSkeleton;
    dirty: boolean;
    commandId?: string;
}

/**
 * Owns render-only spreadsheet skeletons for Sheet UI render units.
 */
export class SheetRenderSkeletonService extends Disposable {
    private readonly _sceneMap = new Map<string, Scene>();
    private readonly _skeletonStore = new Map<string, Map<string, ISheetRenderSkeletonManagerParam>>();
    private readonly _buildSkeleton$ = new Subject<SpreadsheetRenderSkeleton>();
    readonly buildSkeleton$ = this._buildSkeleton$.asObservable();

    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(IUniverInstanceService) private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(SheetSkeletonService) private readonly _sheetSkeletonService: SheetSkeletonService
    ) {
        super();
        this._init();
    }

    override dispose(): void {
        super.dispose();
        this._skeletonStore.forEach((sheetMap) => sheetMap.forEach((param) => param.skeleton.dispose()));
        this._skeletonStore.clear();
        this._sceneMap.clear();
        this._buildSkeleton$.complete();
    }

    setScene(unitId: string, scene: Scene): void {
        this._sceneMap.set(unitId, scene);
        this._skeletonStore.get(unitId)?.forEach((param) => param.skeleton.setScene(scene));
    }

    getSkeletonsByUnitId(unitId: string): SpreadsheetRenderSkeleton[] {
        return Array.from(this._skeletonStore.get(unitId)?.values() ?? []).map((param) => param.skeleton);
    }

    getSkeleton(unitId: string, sheetId: string): Nullable<SpreadsheetRenderSkeleton> {
        return this.getSkeletonParam(unitId, sheetId)?.skeleton;
    }

    getSkeletonParam(unitId: string, sheetId: string): Nullable<ISheetRenderSkeletonManagerParam> {
        return this._skeletonStore.get(unitId)?.get(sheetId);
    }

    newSkeletonParam(
        unitId: string,
        sheetId: string,
        worksheet: Worksheet,
        styles: Styles
    ): ISheetRenderSkeletonManagerParam {
        const skeleton = this._buildSkeleton(worksheet, styles);
        let sheetMap = this._skeletonStore.get(unitId);
        if (!sheetMap) {
            sheetMap = new Map<string, ISheetRenderSkeletonManagerParam>();
            this._skeletonStore.set(unitId, sheetMap);
        }

        const param: ISheetRenderSkeletonManagerParam = {
            unitId,
            sheetId,
            skeleton,
            dirty: false,
        };
        sheetMap.set(sheetId, param);
        return param;
    }

    ensureSkeleton(unitId: string, sheetId: string): SpreadsheetRenderSkeleton | undefined {
        const existing = this.getSkeleton(unitId, sheetId);
        if (existing) {
            return existing;
        }

        const workbook = this._univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET);
        const worksheet = workbook?.getSheetBySheetId(sheetId);
        if (!workbook || !worksheet) {
            return;
        }

        return this.newSkeletonParam(unitId, sheetId, worksheet, workbook.getStyles()).skeleton;
    }

    private _init(): void {
        this._univerInstanceService
            .getAllUnitsForType<Workbook>(UniverInstanceType.UNIVER_SHEET)
            .forEach((workbook) => this._initWorkbook(workbook));
        this.disposeWithMe(
            this._univerInstanceService
                .getTypeOfUnitAdded$<Workbook>(UniverInstanceType.UNIVER_SHEET)
                .subscribe(({ unit }) => this._initWorkbook(unit))
        );
        this.disposeWithMe(
            this._univerInstanceService
                .getTypeOfUnitDisposed$<Workbook>(UniverInstanceType.UNIVER_SHEET)
                .subscribe((workbook) => this._disposeWorkbook(workbook.getUnitId()))
        );
    }

    private _initWorkbook(workbook: Workbook): void {
        const unitId = workbook.getUnitId();
        const sheetMap = new Map<string, ISheetRenderSkeletonManagerParam>();
        workbook.getWorksheets().forEach((worksheet) => {
            const sheetId = worksheet.getSheetId();
            sheetMap.set(sheetId, {
                unitId,
                sheetId,
                skeleton: this._buildSkeleton(worksheet, workbook.getStyles()),
                dirty: false,
            });
        });
        this._skeletonStore.set(unitId, sheetMap);

        this.disposeWithMe(
            workbook.sheetCreated$.subscribe((worksheet) => {
                const currentSheetMap = this._skeletonStore.get(unitId);
                if (!currentSheetMap) {
                    return;
                }

                const sheetId = worksheet.getSheetId();
                currentSheetMap.set(sheetId, {
                    unitId,
                    sheetId,
                    skeleton: this._buildSkeleton(worksheet, workbook.getStyles()),
                    dirty: false,
                });
            })
        );
        this.disposeWithMe(
            workbook.sheetDisposed$.subscribe((worksheet) => {
                const currentSheetMap = this._skeletonStore.get(unitId);
                const skeleton = currentSheetMap?.get(worksheet.getSheetId())?.skeleton;
                skeleton?.dispose();
                currentSheetMap?.delete(worksheet.getSheetId());
            })
        );
    }

    private _buildSkeleton(worksheet: Worksheet, styles: Styles): SpreadsheetRenderSkeleton {
        const spreadsheetSkeleton = this._sheetSkeletonService.ensureSkeleton(
            worksheet.getUnitId(),
            worksheet.getSheetId()
        ) ?? this._sheetSkeletonService.newSkeleton(
            worksheet.getUnitId(),
            worksheet.getSheetId(),
            worksheet,
            styles
        );
        const skeleton = this._injector.createInstance(SpreadsheetRenderSkeleton, spreadsheetSkeleton, styles);
        const scene = this._sceneMap.get(worksheet.getUnitId());
        if (scene) {
            skeleton.setScene(scene);
        }
        this._buildSkeleton$.next(skeleton);
        return skeleton;
    }

    private _disposeWorkbook(unitId: string): void {
        this._skeletonStore.get(unitId)?.forEach((param) => param.skeleton.dispose());
        this._skeletonStore.delete(unitId);
        this._sceneMap.delete(unitId);
    }
}
