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

import type { IRange } from '@univerjs/core';

// the size of the block
const BLOCKSIZE = 10;

export function setRangeBlockToken(range: IRange, baseKey: string, token: string, map: Map<string, Map<string, Set<string>>>): void {
    const { startRow, startColumn, endRow, endColumn } = range;
    // the horizontal and vertical start index of the block
    const startH = Math.floor(startRow / BLOCKSIZE);
    const startV = Math.floor(startColumn / BLOCKSIZE);

    for (let x = startH; x <= Math.ceil(endRow / BLOCKSIZE); x += BLOCKSIZE) {
        for (let y = startV; y <= Math.ceil(endColumn / BLOCKSIZE); y += BLOCKSIZE) {
            const key = `${baseKey}_${x}_${y}`;
            if (!map.has(baseKey)) {
                map.set(baseKey, new Map());
            }
            if (!map.get(baseKey)!.has(key)) {
                map.get(baseKey)!.set(key, new Set<string>());
            }
            map.get(baseKey)!.get(key)!.add(token);
        }
    }
}

export function getBlockTokensByRange(range: IRange, baseKey: string, map: Map<string, Map<string, Set<string>>>): Set<string> {
    const { startRow, startColumn, endRow, endColumn } = range;
    const startH = Math.floor(startRow / BLOCKSIZE);
    const startV = Math.floor(startColumn / BLOCKSIZE);
    const tokensSet = new Set<string>();
    for (let x = startH; x <= Math.ceil(endRow / BLOCKSIZE); x += BLOCKSIZE) {
        for (let y = startV; y <= Math.ceil(endColumn / BLOCKSIZE); y += BLOCKSIZE) {
            const key = `${baseKey}_${x}_${y}`;
            if (map.has(baseKey) && map.get(baseKey)!.has(key)) {
                map.get(baseKey)!.get(key)!.forEach((token) => {
                    tokensSet.add(token);
                });
            }
        }
    }
    return tokensSet;
}

