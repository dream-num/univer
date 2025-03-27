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

import type { Nullable } from '@univerjs/core';
import type { IFunctionService } from '../../services/function.service';
import type { IFormulaRuntimeService } from '../../services/runtime.service';
import { prefixToken } from '../../basics/token';
import { FUNCTION_NAMES_META } from '../../functions/meta/function-names';
import { PrefixNode } from '../ast-node/prefix-node';

const minusRegExp = new RegExp(prefixToken.MINUS, 'g');
const atRegExp = new RegExp(prefixToken.AT, 'g');

export function prefixHandler(tokenTrimParam: string, functionService: IFunctionService, runtimeService: IFormulaRuntimeService) {
    let minusPrefixNode: Nullable<PrefixNode>;
    let atPrefixNode: Nullable<PrefixNode>;
    let tokenTrim = tokenTrimParam;
    const prefix = tokenTrim.slice(0, 2);
    let sliceLength = 0;
    if (prefix[0] === prefixToken.MINUS) {
        const functionExecutor = functionService.getExecutor(FUNCTION_NAMES_META.MINUS);
        minusPrefixNode = new PrefixNode(runtimeService, prefixToken.MINUS, functionExecutor);
        sliceLength++;
    }

    if (prefix[0] === prefixToken.AT) {
        atPrefixNode = new PrefixNode(runtimeService, prefixToken.AT);
        if (minusPrefixNode) {
                // minusPrefixNode.addChildren(atPrefixNode);
            atPrefixNode.setParent(minusPrefixNode);
        }
        sliceLength++;
    }

    if (sliceLength > 0) {
        tokenTrim = tokenTrim.slice(sliceLength);
    }

    return { tokenTrim, minusPrefixNode, atPrefixNode };
}
