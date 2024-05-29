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

import { Disposable, IPermissionService, IResourceManagerService, LifecycleStages, OnLifecycle } from '@univerjs/core';

import { Inject } from '@wendellhu/redi';
import { UnitAction, UnitObject, UniverType } from '@univerjs/protocol';
import type { ISheetFontRenderExtension } from '@univerjs/engine-render';
import type { IObjectModel, IRangeProtectionRule } from '../../../model/range-protection-rule.model';
import { RangeProtectionRuleModel } from '../../../model/range-protection-rule.model';
import { RangeProtectionRenderModel } from '../../../model/range-protection-render.model';
import type { IRangeProtectionRenderCellData } from '../../../render/range-protection/range-protection.render';
import { SheetInterceptorService } from '../../sheet-interceptor/sheet-interceptor.service';
import { INTERCEPTOR_POINT } from '../../sheet-interceptor/interceptor-const';

import { getAllRangePermissionPoint } from './util';

const PLUGIN_NAME = 'SHEET_RANGE_PROTECTION_PLUGIN';

@OnLifecycle(LifecycleStages.Starting, RangeProtectionService)
export class RangeProtectionService extends Disposable {
    constructor(
        @Inject(RangeProtectionRuleModel) private _selectionProtectionRuleModel: RangeProtectionRuleModel,
        @Inject(IPermissionService) private _permissionService: IPermissionService,
        @Inject(IResourceManagerService) private _resourceManagerService: IResourceManagerService,
        @Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService,
        @Inject(RangeProtectionRenderModel) private _selectionProtectionRenderModel: RangeProtectionRenderModel

    ) {
        super();
        this._initSnapshot();
        this._initRuleChange();
        this._initViewModelInterceptor();
    }

    private _initViewModelInterceptor() {
        this.disposeWithMe(this._sheetInterceptorService.intercept(INTERCEPTOR_POINT.CELL_CONTENT, {
            handler: (cell = {}, context, next) => {
                const { unitId, subUnitId, row, col } = context;
                const permissionList = this._selectionProtectionRenderModel.getCellInfo(unitId, subUnitId, row, col)
                    .filter((p) => !!p.ruleId)
                    .map((p) => {
                        const rule = this._selectionProtectionRuleModel.getRule(unitId, subUnitId, p.ruleId!) || {} as IRangeProtectionRule;
                        return {
                            ...p, ranges: rule.ranges!,
                        };
                    })
                    .filter((p) => !!p.ranges);
                if (permissionList.length) {
                    const isSkipFontRender = permissionList.some((p) => !p?.[UnitAction.View]);
                    const _cellData: IRangeProtectionRenderCellData & ISheetFontRenderExtension = { ...cell, selectionProtection: permissionList };
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

    private _initRuleChange() {
        this.disposeWithMe(
            this._selectionProtectionRuleModel.ruleChange$.subscribe((info) => {
                switch (info.type) {
                    case 'add': {
                        getAllRangePermissionPoint().forEach((F) => {
                            const instance = new F(info.unitId, info.subUnitId, info.rule.permissionId);
                            this._permissionService.addPermissionPoint(instance);
                        });
                        break;
                    }
                    case 'delete': {
                        getAllRangePermissionPoint().forEach((F) => {
                            const instance = new F(info.unitId, info.subUnitId, info.rule.permissionId);
                            this._permissionService.deletePermissionPoint(instance.id);
                        });
                        break;
                    }
                    case 'set': {
                        if (info.oldRule!.permissionId !== info.rule.permissionId) {
                            getAllRangePermissionPoint().forEach((F) => {
                                const oldPermissionPoint = new F(info.unitId, info.subUnitId, info.oldRule!.permissionId);
                                this._permissionService.deletePermissionPoint(oldPermissionPoint.id);
                                const newPermissionPoint = new F(info.unitId, info.subUnitId, info.rule.permissionId);
                                this._permissionService.addPermissionPoint(newPermissionPoint);
                            });
                        }
                        break;
                    }
                }
            }));
    }

    private _initSnapshot() {
        const toJson = (unitID: string) => {
            const object = this._selectionProtectionRuleModel.toObject();
            const v = object[unitID];
            return v ? JSON.stringify(v) : '';
        };
        const parseJson = (json: string): IObjectModel[keyof IObjectModel] => {
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
                pluginName: PLUGIN_NAME,
                businesses: [UniverType.UNIVER_SHEET],
                onLoad: (unitId, resources) => {
                    const result = this._selectionProtectionRuleModel.toObject();
                    result[unitId] = resources;
                    this._selectionProtectionRuleModel.fromObject(result);
                    const allAllowedParams: {
                        objectID: string;
                        unitID: string;
                        objectType: UnitObject;
                        actions: UnitAction[];
                    }[] = [];
                    Object.keys(resources).forEach((subUnitId) => {
                        const list = resources[subUnitId];
                        this._selectionProtectionRuleModel.getSubunitRuleList(unitId, subUnitId).forEach((rule) => {
                            allAllowedParams.push({
                                objectID: rule.permissionId,
                                unitID: unitId,
                                objectType: UnitObject.SelectRange,
                                actions: [UnitAction.View, UnitAction.Edit],
                            });
                        });

                        list.forEach((rule) => {
                            getAllRangePermissionPoint().forEach((Factor) => {
                                const instance = new Factor(unitId, subUnitId, rule.permissionId);
                                this._permissionService.addPermissionPoint(instance);
                            });
                        });
                    });
                },
                onUnLoad: () => {
                    this._selectionProtectionRuleModel.deleteUnitModel();
                },
            })
        );
    }
}

