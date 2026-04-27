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

import type { Nullable, Styles, Workbook, Worksheet } from '@univerjs/core';
import type { Scene } from '@univerjs/engine-render';
import { Disposable, Inject, Injector, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { SpreadsheetSkeleton } from '@univerjs/engine-render';
import { Subject } from 'rxjs';

export interface ISheetSkeletonManagerParam {
    unitId: string;
    sheetId: string;
    skeleton: SpreadsheetSkeleton;
    dirty: boolean;
    commandId?: string;
}

export class SheetSkeletonService extends Disposable {
    private _sceneMap: Map<string, Scene> = new Map();
    private _sheetSkeletonParamStore: Map<string, Map<string, ISheetSkeletonManagerParam>> = new Map();
    private _buildSkeleton$ = new Subject<SpreadsheetSkeleton>();
    readonly buildSkeleton$ = this._buildSkeleton$.asObservable();

    constructor(
        @Inject(Injector) readonly _injector: Injector,
        @Inject(IUniverInstanceService) private readonly _univerInstanceService: IUniverInstanceService
    ) {
        // empty
        super();

        this._init();
    }

    override dispose() {
        super.dispose();

        this._sheetSkeletonParamStore.forEach((subUnitMap) => subUnitMap.forEach((skeletonParam) => skeletonParam.skeleton.dispose()));
        this._sheetSkeletonParamStore.clear();
    }

    private _disposeByUnitId(unitId: string) {
        const sheetSkeletonMap = this._sheetSkeletonParamStore.get(unitId);
        if (!sheetSkeletonMap) {
            return;
        }

        sheetSkeletonMap.forEach((skeletonParam) => skeletonParam.skeleton.dispose());
        this._sheetSkeletonParamStore.delete(unitId);
    }

    private _init() {
        this.disposeWithMe(
            this._univerInstanceService.getTypeOfUnitAdded$<Workbook>(UniverInstanceType.UNIVER_SHEET).subscribe((event) => this._initWorkbookSkeleton(event.unit))
        );

        this.disposeWithMe(
            this._univerInstanceService.getTypeOfUnitDisposed$<Workbook>(UniverInstanceType.UNIVER_SHEET).subscribe((workbook) => this._disposeByUnitId(workbook.getUnitId()))
        );
    }

    private _initWorkbookSkeleton(workbook: Workbook) {
        const unitId = workbook.getUnitId();

        this._initSheetsSkeleton(workbook);

        this.disposeWithMe(
            workbook.sheetCreated$.subscribe((worksheet) => {
                const sheetSkeletonMap = this._sheetSkeletonParamStore.get(unitId);
                if (!sheetSkeletonMap) {
                    return;
                }

                const sheetId = worksheet.getSheetId();
                const skeleton = this._buildSkeleton(worksheet, workbook.getStyles());
                sheetSkeletonMap.set(sheetId, {
                    unitId,
                    sheetId,
                    skeleton,
                    dirty: false,
                });
            })
        );

        this.disposeWithMe(
            workbook.sheetDisposed$.subscribe((worksheet) => {
                const sheetSkeletonMap = this._sheetSkeletonParamStore.get(unitId);
                if (!sheetSkeletonMap) {
                    return;
                }

                const sheetId = worksheet.getSheetId();
                const skeletonParam = sheetSkeletonMap.get(sheetId);
                if (skeletonParam) {
                    skeletonParam.skeleton.dispose();
                }
                sheetSkeletonMap.delete(sheetId);
            })
        );
    }

    private _initSheetsSkeleton(workbook: Workbook) {
        const unitId = workbook.getUnitId();
        const sheetSkeletonMap = new Map<string, ISheetSkeletonManagerParam>();

        workbook.getWorksheets().forEach((worksheet) => {
            const sheetId = worksheet.getSheetId();
            const skeleton = this._buildSkeleton(worksheet, workbook.getStyles());
            sheetSkeletonMap.set(sheetId, {
                unitId,
                sheetId,
                skeleton,
                dirty: false,
            });
        });

        this._sheetSkeletonParamStore.set(unitId, sheetSkeletonMap);
    }

    private _buildSkeleton(worksheet: Worksheet, styles: Styles) {
        const spreadsheetSkeleton = this._injector.createInstance(
            SpreadsheetSkeleton,
            worksheet,
            styles
        );

        const unitId = worksheet.getUnitId();
        const scene = this._sceneMap.get(unitId);
        if (scene) {
            spreadsheetSkeleton.setScene(scene);
        }

        this._buildSkeleton$.next(spreadsheetSkeleton);
        return spreadsheetSkeleton;
    }

    setScene(unitId: string, scene: Scene) {
        this._sceneMap.set(unitId, scene);

        // update scene for all skeleton
        const sheetSkeletonMap = this._sheetSkeletonParamStore.get(unitId);
        if (!sheetSkeletonMap) {
            return;
        }

        sheetSkeletonMap.forEach((skeletonParam) => skeletonParam.skeleton.setScene(scene));
    }

    getSkeletonsByUnitId(unitId: string): SpreadsheetSkeleton[] {
        const sheetSkeletonMap = this._sheetSkeletonParamStore.get(unitId);
        if (!sheetSkeletonMap) {
            return [];
        }

        return Array.from(sheetSkeletonMap.values()).map((param) => param.skeleton);
    }

    getSkeleton(unitId: string, subUnitId: string): Nullable<SpreadsheetSkeleton> {
        return this.getSkeletonParam(unitId, subUnitId)?.skeleton;
    }

    getSkeletonParam(unitId: string, subUnitId: string): Nullable<ISheetSkeletonManagerParam> {
        const sheetSkeletonMap = this._sheetSkeletonParamStore.get(unitId);
        if (!sheetSkeletonMap) {
            return;
        }

        return sheetSkeletonMap.get(subUnitId);
    }

    newSkeleton(unitId: string, subUnitId: string, worksheet: Worksheet, styles: Styles): SpreadsheetSkeleton {
        return this.newSkeletonParam(unitId, subUnitId, worksheet, styles).skeleton;
    }

    newSkeletonParam(unitId: string, subUnitId: string, worksheet: Worksheet, styles: Styles): ISheetSkeletonManagerParam {
        const skeleton = this._buildSkeleton(worksheet, styles);

        let sheetSkeletonMap = this._sheetSkeletonParamStore.get(unitId);
        if (!sheetSkeletonMap) {
            sheetSkeletonMap = new Map<string, ISheetSkeletonManagerParam>();
            this._sheetSkeletonParamStore.set(unitId, sheetSkeletonMap);
        }

        const skeletonParam: ISheetSkeletonManagerParam = {
            unitId,
            sheetId: subUnitId,
            skeleton,
            dirty: false,
        };

        sheetSkeletonMap.set(subUnitId, skeletonParam);

        return skeletonParam;
    }

    ensureSkeleton(unitId: string, subUnitId: string): SpreadsheetSkeleton | undefined {
        const skeleton = this.getSkeleton(unitId, subUnitId);
        if (skeleton) {
            return skeleton;
        }

        const workbook = this._univerInstanceService.getUnit<Workbook>(unitId);
        if (!workbook) return;

        const worksheet = workbook.getSheetBySheetId(subUnitId);
        if (!worksheet) return;

        return this.newSkeleton(unitId, subUnitId, worksheet, workbook.getStyles());
    }
}
