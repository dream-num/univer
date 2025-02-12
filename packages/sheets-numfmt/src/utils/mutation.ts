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

import type { IMutationInfo } from '@univerjs/core';
import type { IRemoveNumfmtMutationParams, ISetNumfmtMutationParams } from '@univerjs/sheets';
import { Tools } from '@univerjs/core';
import { rangeMerge, RemoveNumfmtMutation, SetNumfmtMutation } from '@univerjs/sheets';

export const mergeNumfmtMutations = (list: IMutationInfo[]) => {
    const removeMutation = list
        .filter((item) => item.id === RemoveNumfmtMutation.id)
        .map((item) => item.params) as unknown as IRemoveNumfmtMutationParams[];
    const setMutation = list
        .filter((item) => item.id === SetNumfmtMutation.id)
        .map((item) => item.params) as unknown as ISetNumfmtMutationParams[];
    const result: IMutationInfo[] = [];

    if (removeMutation[0]) {
        const params = removeMutation.reduce(
            (res, cur) => {
                res.ranges.push(...cur.ranges);
                return res;
            },
            {
                ranges: [],
                unitId: removeMutation[0].unitId,
                subUnitId: removeMutation[0].subUnitId,
            } as IRemoveNumfmtMutationParams
        );
        params.ranges = rangeMerge(params.ranges);
        result.push({ id: RemoveNumfmtMutation.id, params });
    }
    const findKeyFromObj = (obj: Record<string, any>, item: any) => {
        const keys = Object.keys(obj);
        const index = keys.findIndex((key) => {
            const value = obj[key];
            return Tools.diffValue(value, item);
        });
        return keys[index];
    };
    if (setMutation[0]) {
        const params = setMutation.reduce(
            (res, cur) => {
                Object.keys(cur.values).forEach((key) => {
                    const curValue = cur.values[key];
                    const curRef = cur.refMap[key];
                    const index = findKeyFromObj(res.refMap, curRef);
                    if (index) {
                        res.values[index].ranges.push(...curValue.ranges);
                    } else {
                        const newIndex = Math.max(...Object.keys(res.refMap).map(Number), 0) + 1;
                        res.values[newIndex] = {
                            ranges: curValue.ranges,
                        };
                        res.refMap[newIndex] = curRef;
                    }
                });
                return res;
            },
            {
                values: {},
                refMap: {},
                unitId: setMutation[0].unitId,
                subUnitId: setMutation[0].subUnitId,
            } as ISetNumfmtMutationParams
        );
        Object.keys(params.values).forEach((key) => {
            const v = params.values[key];
            v.ranges = rangeMerge(v.ranges);
        });
        result.push({ id: SetNumfmtMutation.id, params });
    }
    return result;
};
