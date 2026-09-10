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

export function getTopmostDocsTableHit<T>(
    tables: readonly T[],
    hitBody: (table: T) => boolean,
    hitControls: (table: T) => boolean,
    isNestedTable: (outer: T, inner: T) => boolean = () => false
): T | undefined {
    const bodyHit = tables.findLast(hitBody);
    if (bodyHit) {
        const bodyDepth = tables.filter((outer) => outer !== bodyHit && isNestedTable(outer, bodyHit)).length;
        for (let index = tables.length - 1; index >= 0; index--) {
            const table = tables[index];
            if (
                table !== bodyHit &&
                hitControls(table) &&
                tables.filter((outer) => outer !== table && isNestedTable(outer, table)).length > bodyDepth
            ) {
                return table;
            }
        }
        return bodyHit;
    }

    return tables.findLast(hitControls);
}
