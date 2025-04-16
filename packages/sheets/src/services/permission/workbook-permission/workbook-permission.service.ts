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

import type { Workbook } from '@univerjs/core';
import { Disposable, Inject, IPermissionService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { BehaviorSubject } from 'rxjs';
import { RangeProtectionRuleModel } from '../../../model/range-protection-rule.model';
import { getAllRangePermissionPoint } from '../range-permission/util';
import { WorksheetProtectionPointModel, WorksheetProtectionRuleModel } from '../worksheet-permission';
import { getAllWorksheetPermissionPoint, getAllWorksheetPermissionPointByPointPanel } from '../worksheet-permission/utils';
import { getAllWorkbookPermissionPoint } from './util';

export class WorkbookPermissionService extends Disposable {
    private _unitPermissionInitStateChange = new BehaviorSubject<boolean>(false);
    unitPermissionInitStateChange$ = this._unitPermissionInitStateChange.asObservable();

    constructor(
        @Inject(IPermissionService) private _permissionService: IPermissionService,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService,
        @Inject(RangeProtectionRuleModel) private _rangeProtectionRuleModel: RangeProtectionRuleModel,
        @Inject(WorksheetProtectionRuleModel) private _worksheetProtectionRuleModel: WorksheetProtectionRuleModel,
        @Inject(WorksheetProtectionPointModel) private _worksheetProtectionPointModel: WorksheetProtectionPointModel
    ) {
        super();

        this._init();
    }

    private _init() {
        const handleWorkbook = (workbook: Workbook) => {
            const unitId = workbook.getUnitId();
            getAllWorkbookPermissionPoint().forEach((F) => {
                const instance = new F(unitId);
                this._permissionService.addPermissionPoint(instance);
            });
        };

        this._univerInstanceService.getAllUnitsForType<Workbook>(UniverInstanceType.UNIVER_SHEET).forEach((workbook) => {
            handleWorkbook(workbook);
        });

        this.disposeWithMe(this._univerInstanceService.getTypeOfUnitAdded$<Workbook>(UniverInstanceType.UNIVER_SHEET).subscribe((workbook) => {
            handleWorkbook(workbook);
        }));

        this.disposeWithMe(this._univerInstanceService.getTypeOfUnitDisposed$<Workbook>(UniverInstanceType.UNIVER_SHEET).subscribe((workbook) => {
            const unitId = workbook.getUnitId();
            workbook.getSheets().forEach((worksheet) => {
                const subUnitId = worksheet.getSheetId();

                const rangeRuleList = this._rangeProtectionRuleModel.getSubunitRuleList(unitId, subUnitId);
                rangeRuleList.forEach((rule) => {
                    [...getAllRangePermissionPoint()].forEach((F) => {
                        const instance = new F(unitId, subUnitId, rule.permissionId);
                        this._permissionService.deletePermissionPoint(instance.id);
                    });
                });

                [...getAllWorksheetPermissionPoint(), ...getAllWorksheetPermissionPointByPointPanel()].forEach((F) => {
                    const instance = new F(unitId, subUnitId);
                    this._permissionService.deletePermissionPoint(instance.id);
                });
            });
            getAllWorkbookPermissionPoint().forEach((F) => {
                const instance = new F(unitId);
                this._permissionService.deletePermissionPoint(instance.id);
            });

            this._rangeProtectionRuleModel.deleteUnitModel(unitId);
            this._worksheetProtectionPointModel.deleteUnitModel(unitId);
            this._worksheetProtectionRuleModel.deleteUnitModel(unitId);
        }));
    }

    changeUnitInitState(state: boolean) {
        this._unitPermissionInitStateChange.next(state);
    }
}
