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

export enum NodeType {
    REFERENCE = 1,
    VALUE = 2,
    OPERATOR = 3,
    FUNCTION = 4,
    LAMBDA = 5,
    LAMBDA_PARAMETER = 6,
    ERROR = 7,
    BASE = 8,
    ROOT = 9,
    UNION = 10,
    PREFIX = 11,
    SUFFIX = 12,
    NULL = 13,
}

export const NODE_ORDER_MAP = new Map([
    [NodeType.REFERENCE, 7],
    [NodeType.VALUE, 9],
    [NodeType.OPERATOR, 8],
    [NodeType.FUNCTION, 6],
    [NodeType.LAMBDA, 1],
    [NodeType.LAMBDA_PARAMETER, 2],
    [NodeType.ROOT, 10],
    [NodeType.UNION, 3],
    [NodeType.PREFIX, 4],
    [NodeType.SUFFIX, 5],
]);
