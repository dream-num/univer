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

import type { Injector } from '@wendellhu/redi';
import type { Nullable } from '@univerjs/core';
import type { IFunctionService } from '../../services/function.service';
import { PrefixNode } from '../ast-node/prefix-node';
import { prefixToken } from '../../basics/token';
import { FUNCTION_NAMES_META } from '../../functions/meta/function-names';

export function prefixHandler(tokenTrim: string, functionService: IFunctionService, injector: Injector) {
    let minusPrefixNode: Nullable<PrefixNode>;
    let atPrefixNode: Nullable<PrefixNode>;
    const prefix = tokenTrim.slice(0, 2);
    let sliceLength = 0;
    if (new RegExp(prefixToken.MINUS, 'g').test(prefix)) {
        const functionExecutor = functionService.getExecutor(FUNCTION_NAMES_META.MINUS);
        minusPrefixNode = new PrefixNode(injector, prefixToken.MINUS, functionExecutor);
        sliceLength++;
    }

    if (new RegExp(prefixToken.AT, 'g').test(prefix)) {
        atPrefixNode = new PrefixNode(injector, prefixToken.AT);
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
