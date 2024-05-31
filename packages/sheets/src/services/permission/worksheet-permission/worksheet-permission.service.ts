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

import type { Workbook, Worksheet } from '@univerjs/core';
import { IPermissionService, IResourceManagerService, IUniverInstanceService, LifecycleStages, OnLifecycle, RxDisposable, UniverInstanceType } from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';
import { takeUntil } from 'rxjs/operators';

// import type { UnitAction, UnitObject } from '@univerjs/protocol';
import { UnitAction, UniverType } from '@univerjs/protocol';
import type { ISheetFontRenderExtension } from '@univerjs/engine-render';
import {
    WorksheetEditPermission,
    WorksheetViewPermission,
} from '../permission-point';
import type { IObjectModel, IObjectPointModel } from '../type';
import { SheetInterceptorService } from '../../sheet-interceptor/sheet-interceptor.service';
import { INTERCEPTOR_POINT } from '../../sheet-interceptor/interceptor-const';
import { WorksheetProtectionRuleModel } from './worksheet-permission-rule.model';
import { getAllWorksheetPermissionPoint, getAllWorksheetPermissionPointByPointPanel } from './utils';
import type { IWorksheetProtectionRenderCellData } from './type';
import { WorksheetProtectionPointModel } from './worksheet-permission-point.model';

export const RULE_MODEL_PLUGIN_NAME = 'SHEET_WORKSHEET_PROTECTION_PLUGIN';
export const POINT_MODEL_PLUGIN_NAME = 'SHEET_WORKSHEET_PROTECTION_POINT_PLUGIN';

@OnLifecycle(LifecycleStages.Starting, WorksheetPermissionService)
export class WorksheetPermissionService extends RxDisposable {
    constructor(
        @Inject(IPermissionService) private _permissionService: IPermissionService,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService,
        @Inject(Injector) readonly _injector: Injector,
        @Inject(WorksheetProtectionRuleModel) private _worksheetProtectionRuleModel: WorksheetProtectionRuleModel,
        @Inject(WorksheetProtectionPointModel) private _worksheetProtectionPointRuleModel: WorksheetProtectionPointModel,
        @Inject(IResourceManagerService) private _resourceManagerService: IResourceManagerService,
        @Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService
    ) {
        super();
        this._init();
        this._initRuleChange();
        this._initRuleSnapshot();
        this._initPointSnapshot();
        this._initViewModelInterceptor();
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
            };
            workbook.getSheets().forEach((worksheet) => {
                handleWorksheet(worksheet);
            });
            workbook.sheetCreated$.subscribe((worksheet) => {
                handleWorksheet(worksheet);
            });
            workbook.sheetDisposed$.subscribe((worksheet) => {
                const subUnitId = worksheet.getSheetId();
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
                        getAllWorksheetPermissionPoint().forEach((F) => {
                            const instance = new F(info.unitId, info.subUnitId);
                            this._permissionService.addPermissionPoint(instance);
                        });
                        break;
                    }
                    case 'delete': {
                        getAllWorksheetPermissionPoint().forEach((F) => {
                            const instance = new F(info.unitId, info.subUnitId);
                            this._permissionService.deletePermissionPoint(instance.id);
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
            }));
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
                toJson, parseJson,
                pluginName: RULE_MODEL_PLUGIN_NAME,
                businesses: [UniverType.UNIVER_SHEET],
                onLoad: (unitId, resources) => {
                    this._worksheetProtectionRuleModel.fromObject(resources);
                    Object.keys(resources).forEach((subUnitId) => {
                        getAllWorksheetPermissionPoint().forEach((F) => {
                            const instance = new F(unitId, subUnitId);
                            this._permissionService.addPermissionPoint(instance);
                        });
                    });
                    this._worksheetProtectionRuleModel.changeRuleInitState(true);
                },
                onUnLoad: () => {
                    this._worksheetProtectionRuleModel.deleteUnitModel();
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
                toJson, parseJson,
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
                onUnLoad: () => {
                    this._worksheetProtectionPointRuleModel.deleteUnitModel();
                },
            })
        );
    }

    private _initViewModelInterceptor() {
        this.disposeWithMe(this._sheetInterceptorService.intercept(INTERCEPTOR_POINT.CELL_CONTENT, {
            handler: (cell = {}, context, next) => {
                const { unitId, subUnitId } = context;
                const worksheetRule = this._worksheetProtectionRuleModel.getRule(unitId, subUnitId);
                if (worksheetRule?.permissionId && worksheetRule.name) {
                    const selectionProtection = [{
                        [UnitAction.View]: this._permissionService.getPermissionPoint(new WorksheetViewPermission(unitId, subUnitId).id)?.value ?? false,
                        [UnitAction.Edit]: this._permissionService.getPermissionPoint(new WorksheetEditPermission(unitId, subUnitId).id)?.value ?? false,
                    }];
                    const isSkipFontRender = !selectionProtection[0]?.[UnitAction.View];
                    const _cellData: IWorksheetProtectionRenderCellData & ISheetFontRenderExtension = { ...cell, hasWorksheetRule: true, selectionProtection };
                    if (isSkipFontRender) {
                        if (!_cellData.fontRenderExtension) {
                            _cellData.fontRenderExtension = {};
                        }
                        _cellData.fontRenderExtension.isSkip = isSkipFontRender;
                    }
                    return next(_cellData);
                }
                return next(cell);
            },
        }
        ));
    }
}
