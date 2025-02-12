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

// import type { IRange } from '@univerjs/core';

// // the size of the block
// const BLOCKSIZE = 10;

// export function setRangeBlockToken(range: IRange, baseKey: string, token: string, map: Map<string, Map<string, Set<string>>>): void {
//     const { startRow, startColumn, endRow, endColumn } = range;

//     // 计算块的起始和结束索引
//     const startH = Math.floor(startRow / BLOCKSIZE);
//     const endH = Math.ceil(endRow / BLOCKSIZE);
//     const startV = Math.floor(startColumn / BLOCKSIZE);
//     const endV = Math.ceil(endColumn / BLOCKSIZE);

//     // 遍历所有与range有交集的块
//     for (let x = startH; x <= endH; x++) {
//         for (let y = startV; y <= endV; y++) {
//             const key = `${baseKey}_${x}_${y}`;
//             if (!map.has(baseKey)) {
//                 map.set(baseKey, new Map());
//             }
//             if (!map.get(baseKey)!.has(key)) {
//                 map.get(baseKey)!.set(key, new Set<string>());
//             }
//             map.get(baseKey)!.get(key)!.add(token);
//         }
//     }
// }

// export function getBlockTokensByRange(tokensSet: Set<string>, range: IRange, baseKey: string, map: Map<string, Map<string, Set<string>>>): Set<string> {
//     const { startRow, startColumn, endRow, endColumn } = range;

//     // 计算块的起始和结束索引
//     const startH = Math.floor(startRow / BLOCKSIZE);
//     const endH = Math.floor(endRow / BLOCKSIZE);
//     const startV = Math.floor(startColumn / BLOCKSIZE);
//     const endV = Math.floor(endColumn / BLOCKSIZE);

//     // 遍历所有与range有交集的块
//     for (let x = startH; x <= endH; x++) {
//         for (let y = startV; y <= endV; y++) {
//             const key = `${baseKey}_${x}_${y}`;
//             if (map.has(baseKey) && map.get(baseKey)!.has(key)) {
//                 const blockTokens = map.get(baseKey)!.get(key)!;
//                 blockTokens.forEach((token) => tokensSet.add(token));
//             }
//         }
//     }

//     return tokensSet;
// }

// export function updateBlockKey(tokensSet: Map<string, Set<string>>, range: IRange, baseKey: string, map: Map<string, Map<string, Set<string>>>) {
//     const { startRow, startColumn, endRow, endColumn } = range;

//     // 计算块的起始和结束索引
//     const startH = Math.floor(startRow / BLOCKSIZE);
//     const endH = Math.floor(endRow / BLOCKSIZE);
//     const startV = Math.floor(startColumn / BLOCKSIZE);
//     const endV = Math.floor(endColumn / BLOCKSIZE);

//     let hasCreate = tokensSet.has(baseKey);

//     // 遍历所有与range有交集的块
//     for (let x = startH; x <= endH; x++) {
//         for (let y = startV; y <= endV; y++) {
//             if (!hasCreate) {
//                 tokensSet.set(baseKey, new Set<string>());
//                 hasCreate = true;
//             }

//             tokensSet.get(baseKey)?.add(`${baseKey}_${x}_${y}`);
//         }
//     }
// }
