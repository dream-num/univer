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

import type { Workbook, Worksheet } from '@univerjs/core';
import type { IObjectModel, IObjectPointModel } from '../type';
import { ILogService, Inject, Injector, IPermissionService, IResourceManagerService, IUniverInstanceService, RxDisposable, UniverInstanceType } from '@univerjs/core';
import { UniverType } from '@univerjs/protocol';

import { takeUntil } from 'rxjs/operators';
import { RangeProtectionRuleModel } from '../../../model/range-protection-rule.model';
import { getAllRangePermissionPoint } from '../range-permission/util';
import { getAllWorkbookPermissionPoint } from '../workbook-permission';
import { getAllWorksheetPermissionPoint, getAllWorksheetPermissionPointByPointPanel } from './utils';
import { WorksheetProtectionPointModel } from './worksheet-permission-point.model';
import { WorksheetProtectionRuleModel } from './worksheet-permission-rule.model';

export const RULE_MODEL_PLUGIN_NAME = 'SHEET_WORKSHEET_PROTECTION_PLUGIN';
export const POINT_MODEL_PLUGIN_NAME = 'SHEET_WORKSHEET_PROTECTION_POINT_PLUGIN';

export class WorksheetPermissionService extends RxDisposable {
    constructor(
        @Inject(IPermissionService) private _permissionService: IPermissionService,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService,
        @Inject(Injector) readonly _injector: Injector,
        @Inject(WorksheetProtectionRuleModel) private _worksheetProtectionRuleModel: WorksheetProtectionRuleModel,
        @Inject(WorksheetProtectionPointModel) private _worksheetProtectionPointRuleModel: WorksheetProtectionPointModel,
        @Inject(IResourceManagerService) private _resourceManagerService: IResourceManagerService,
        @Inject(RangeProtectionRuleModel) private _rangeProtectionRuleModel: RangeProtectionRuleModel,
        @Inject(ILogService) private _logService: ILogService
    ) {
        super();
        this._init();
        this._initRuleChange();
        this._initRuleSnapshot();
        this._initPointSnapshot();
    }

    private _init() {
        const handleWorkbook = (workbook: Workbook) => {
            const unitId = workbook.getUnitId();
            const handleWorksheet = (worksheet: Worksheet) => {
                const subUnitId = worksheet.getSheetId();
                [...getAllWorksheetPermissionPoint(), ...getAllWorksheetPermissionPointByPointPanel()].forEach((F) => {
                    const instance = new F(unitId, subUnitId);
                    this._permissionService.addPermissionPoint(instance);
                });
                this._logService.debug('[WorksheetPermissionService]', 'Initialization completed', unitId, subUnitId);
            };
            workbook.getSheets().forEach((worksheet) => {
                handleWorksheet(worksheet);
            });
            workbook.sheetCreated$.subscribe((worksheet) => {
                handleWorksheet(worksheet);
            });
            workbook.sheetDisposed$.subscribe((worksheet) => {
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
        };

        this._univerInstanceService.getAllUnitsForType<Workbook>(UniverInstanceType.UNIVER_SHEET).forEach((workbook) => {
            handleWorkbook(workbook);
        });

        this._univerInstanceService.getTypeOfUnitAdded$<Workbook>(UniverInstanceType.UNIVER_SHEET).pipe(takeUntil(this.dispose$)).subscribe(handleWorkbook);

        this._univerInstanceService.getTypeOfUnitDisposed$<Workbook>(UniverInstanceType.UNIVER_SHEET).pipe(takeUntil(this.dispose$)).subscribe((workbook) => {
            workbook.getSheets().forEach((worksheet) => {
                const unitId = workbook.getUnitId();
                const subUnitId = worksheet.getSheetId();
                getAllWorksheetPermissionPoint().forEach((F) => {
                    const instance = new F(unitId, subUnitId);
                    this._permissionService.deletePermissionPoint(instance.id);
                });
            });
        });
    }

    private _initRuleChange() {
        this.disposeWithMe(
            this._worksheetProtectionRuleModel.ruleChange$.subscribe((info) => {
                switch (info.type) {
                    case 'add': {
                        break;
                    }
                    case 'delete': {
                        getAllWorksheetPermissionPoint().forEach((F) => {
                            const instance = new F(info.unitId, info.subUnitId);
                            this._permissionService.updatePermissionPoint(instance.id, true);
                        });
                        break;
                    }
                    case 'set': {
                        getAllWorksheetPermissionPoint().forEach((F) => {
                            const instance = new F(info.unitId, info.subUnitId);
                            this._permissionService.updatePermissionPoint(instance.id, info.rule);
                        });
                        break;
                    }
                }
            })
        );
    }

    private _initRuleSnapshot() {
        const toJson = () => {
            const object = this._worksheetProtectionRuleModel.toObject();
            return JSON.stringify(object);
        };
        const parseJson = (json: string): IObjectModel => {
            if (!json) {
                return {};
            }
            try {
                return JSON.parse(json);
            } catch (err) {
                return {};
            }
        };
        this.disposeWithMe(
            this._resourceManagerService.registerPluginResource({
                toJson,
                parseJson,
                pluginName: RULE_MODEL_PLUGIN_NAME,
                businesses: [UniverType.UNIVER_SHEET],
                onLoad: (unitId, resources) => {
                    this._worksheetProtectionRuleModel.fromObject(resources);
                    Object.keys(resources).forEach((subUnitId) => {
                        getAllWorksheetPermissionPoint().forEach((F) => {
                            const instance = new F(unitId, subUnitId);
                            instance.value = false;
                            this._permissionService.addPermissionPoint(instance);
                        });
                    });
                    this._worksheetProtectionRuleModel.changeRuleInitState(true);
                },
                onUnLoad: (unitId: string) => {
                    const workbook = this._univerInstanceService.getUnit<Workbook>(unitId);
                    if (workbook) {
                        workbook.getSheets().forEach((worksheet) => {
                            const subUnitId = worksheet.getSheetId();

                            [...getAllWorksheetPermissionPoint(), ...getAllWorksheetPermissionPointByPointPanel()].forEach((F) => {
                                const instance = new F(unitId, subUnitId);
                                this._permissionService.deletePermissionPoint(instance.id);
                            });
                        });
                        getAllWorkbookPermissionPoint().forEach((F) => {
                            const instance = new F(unitId);
                            this._permissionService.deletePermissionPoint(instance.id);
                        });
                    }

                    this._worksheetProtectionRuleModel.deleteUnitModel(unitId);
                },
            })
        );
    }

    private _initPointSnapshot() {
        const toJson = () => {
            const object = this._worksheetProtectionPointRuleModel.toObject();
            return JSON.stringify(object);
        };
        const parseJson = (json: string): IObjectPointModel => {
            if (!json) {
                return {};
            }
            try {
                return JSON.parse(json);
            } catch (err) {
                return {};
            }
        };
        this.disposeWithMe(
            this._resourceManagerService.registerPluginResource({
                toJson,
                parseJson,
                pluginName: POINT_MODEL_PLUGIN_NAME,
                businesses: [UniverType.UNIVER_SHEET],
                onLoad: (unitId, resources) => {
                    this._worksheetProtectionPointRuleModel.fromObject(resources);
                    Object.keys(resources).forEach((subUnitId) => {
                        getAllWorksheetPermissionPointByPointPanel().forEach((F) => {
                            const instance = new F(unitId, subUnitId);
                            this._permissionService.addPermissionPoint(instance);
                        });
                    });
                },
                onUnLoad: (unitId: string) => {
                    this._worksheetProtectionPointRuleModel.deleteUnitModel(unitId);
                },
            })
        );
    }
}
