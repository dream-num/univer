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

import { type ICellData, type Nullable, Tools } from '@univerjs/core';

/**
 * Update custom object by old and new value
 * @param oldVal
 * @param newVal
 */
export function handleCustom(oldVal: ICellData, newVal: ICellData) {
    // merge custom
    const merge = mergeCustom(oldVal.custom, newVal.custom);

    // then remove null
    if (merge) {
        Tools.removeNull(merge);
    }

    if (Tools.isEmptyObject(merge)) {
        delete oldVal.custom;
    } else {
        oldVal.custom = merge;
    }
}

/**
 * Merge custom object by old and new value
 * @param oldCustom
 * @param newCustom
 * @returns
 */
function mergeCustom(oldCustom: Nullable<Record<string, any>>, newCustom: Nullable<Record<string, any>>) {
    // clear custom
    if (newCustom === null) return newCustom;
    // don't operate
    if (newCustom === undefined) return oldCustom;

     // Merge the first layer of attributes to prevent overlap. Do not process deeper layers, as too deep will cause performance issues.
    return { ...oldCustom, ...newCustom };
}

/**
 * Convert old custom normal key for storage
 * @param style
 */
export function transformCustom(
    oldCustom: Nullable<Record<string, any>>,
    newCustom: Nullable<Record<string, any>>
): Nullable<Record<string, any>> {
    // If there is no newly set custom, directly store the historical custom
    if (!newCustom || !Object.keys(newCustom).length) {
        return oldCustom;
    }
    const backupCustom: Record<string, any> = oldCustom || {};

    for (const k in newCustom) {
        // 1. To modify the existing custom,we need original setting to undo
        // 2. Newly set the custom, we need null to undo
        if (!(k in backupCustom)) {
            backupCustom[k] = null;
        }
    }
    return backupCustom;
}
