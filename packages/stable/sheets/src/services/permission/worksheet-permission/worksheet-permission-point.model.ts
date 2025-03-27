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

import type { IObjectPointModel, IPointRuleModel, IWorksheetProtectionPointRule } from '../type';
import { Subject } from 'rxjs';

export class WorksheetProtectionPointModel {
    private _model: IPointRuleModel = new Map();

    private _pointChange = new Subject<{
        unitId: string;
        subUnitId: string;
        permissionId: string;
    }>();

    pointChange$ = this._pointChange.asObservable();

    addRule(rule: IWorksheetProtectionPointRule) {
        const subUnitMap = this._ensureSubUnitMap(rule.unitId);
        subUnitMap.set(rule.subUnitId, rule);
        this._pointChange.next(rule);
    }

    deleteRule(unitId: string, subUnitId: string) {
        const rule = this._model.get(unitId)?.get(subUnitId);
        if (rule) {
            this._model?.get(unitId)?.delete(subUnitId);
            this._pointChange.next(rule);
        }
    }

    getRule(unitId: string, subUnitId: string) {
        return this._model?.get(unitId)?.get(subUnitId);
    }

    toObject() {
        const result: IObjectPointModel = {};
        const unitKeys = [...this._model.keys()];
        unitKeys.forEach((unitId) => {
            const subUnitMap = this._model.get(unitId);
            if (subUnitMap?.size) {
                result[unitId] = [];
                const subUnitKeys = [...subUnitMap.keys()];
                subUnitKeys.forEach((subUnitId) => {
                    const rule = subUnitMap.get(subUnitId);
                    if (rule) {
                        result[unitId].push(rule);
                    }
                });
            }
        });
        return result;
    }

    fromObject(obj: IObjectPointModel) {
        const result: IPointRuleModel = new Map();
        Object.keys(obj).forEach((unitId) => {
            const subUnitList = obj[unitId];
            if (subUnitList?.length) {
                const subUnitMap = new Map();
                subUnitList.forEach((rule) => {
                    subUnitMap.set(rule.subUnitId, rule);
                });
                result.set(unitId, subUnitMap);
            }
        });
        this._model = result;
    }

    deleteUnitModel(unitId: string) {
        this._model.delete(unitId);
    }

    private _ensureSubUnitMap(unitId: string) {
        let subUnitMap = this._model.get(unitId);
        if (!subUnitMap) {
            subUnitMap = new Map();
            this._model.set(unitId, subUnitMap);
        }
        return subUnitMap;
    }

    getTargetByPermissionId(unitId: string, permissionId: string) {
        const subUnitMap = this._model.get(unitId);
        if (!subUnitMap) return null;
        for (const [subUnitId, rule] of subUnitMap) {
            if (rule.permissionId === permissionId) {
                return [unitId, subUnitId];
            }
        }
    }
}
