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

import { compareToken } from './token';

export function reverseCompareOperator(operator: compareToken): compareToken {
    let result: compareToken;
    switch (operator) {
        case compareToken.EQUALS:
            result = compareToken.EQUALS;
            break;
        case compareToken.GREATER_THAN:
            result = compareToken.LESS_THAN;
            break;
        case compareToken.GREATER_THAN_OR_EQUAL:
            result = compareToken.LESS_THAN_OR_EQUAL;
            break;
        case compareToken.LESS_THAN:
            result = compareToken.GREATER_THAN;
            break;
        case compareToken.LESS_THAN_OR_EQUAL:
            result = compareToken.GREATER_THAN_OR_EQUAL;
            break;
        case compareToken.NOT_EQUAL:
            result = compareToken.NOT_EQUAL;
            break;
    }
    return result;
}
