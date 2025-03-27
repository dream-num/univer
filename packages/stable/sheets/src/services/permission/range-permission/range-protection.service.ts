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

import type { UnitAction } from '@univerjs/protocol';

import type { IObjectModel } from '../../../model/range-protection-rule.model';
import { Disposable, Inject, IPermissionService, IResourceManagerService, IUniverInstanceService } from '@univerjs/core';
import { UnitObject, UniverType } from '@univerjs/protocol';
import { RangeProtectionRuleModel } from '../../../model/range-protection-rule.model';

import { RangeProtectionCache } from '../../../model/range-protection.cache';
import { baseProtectionActions, getAllRangePermissionPoint } from './util';

const PLUGIN_NAME = 'SHEET_RANGE_PROTECTION_PLUGIN';

export class RangeProtectionService extends Disposable {
    constructor(
        @Inject(RangeProtectionRuleModel) private _selectionProtectionRuleModel: RangeProtectionRuleModel,
        @Inject(IPermissionService) private _permissionService: IPermissionService,
        @Inject(IResourceManagerService) private _resourceManagerService: IResourceManagerService,
        @Inject(RangeProtectionCache) private _selectionProtectionCache: RangeProtectionCache,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService

    ) {
        super();
        this._initSnapshot();
        this._initRuleChange();
    }

    private _initRuleChange(): void {
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
            })
        );
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
                toJson,
                parseJson,
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
                                actions: baseProtectionActions,
                            });
                        });

                        list.forEach((rule) => {
                            getAllRangePermissionPoint().forEach((Factor) => {
                                const instance = new Factor(unitId, subUnitId, rule.permissionId);
                                instance.value = false;
                                this._permissionService.addPermissionPoint(instance);
                            });
                        });
                        this._selectionProtectionCache.reBuildCache(unitId, subUnitId);
                    });
                },
                onUnLoad: (unitId: string) => {
                    this._selectionProtectionCache.deleteUnit(unitId);
                },
            })
        );
    }
}
