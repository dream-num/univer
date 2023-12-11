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

import type { IMutationInfo } from '@univerjs/core';
import type { IRemoveNumfmtMutationParams, ISetNumfmtMutationParams } from '@univerjs/sheets';
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
                workbookId: setMutation[0].workbookId,
                worksheetId: setMutation[0].worksheetId,
            } as IRemoveNumfmtMutationParams
        );
        params.ranges = rangeMerge(params.ranges);
        result.push({ id: RemoveNumfmtMutation.id, params });
    }
    if (setMutation[0]) {
        const params = setMutation.reduce(
            (res, cur) => {
                Object.keys(cur.values).forEach((key) => {
                    const curValue = cur.values[key];
                    const curRef = cur.refMap[key];
                    if (res.values[key]) {
                        res.values[key].ranges.push(...curValue.ranges);
                    } else {
                        res.values[key] = {
                            ranges: curValue.ranges,
                        };
                        res.refMap[key] = curRef;
                    }
                });
                return res;
            },
            {
                values: {},
                refMap: {},
                workbookId: setMutation[0].workbookId,
                worksheetId: setMutation[0].worksheetId,
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
