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

import { describe, expect, it, vi } from 'vitest';
import { AstNodePromiseType } from '../../../basics/common';
import { BaseAstNode } from '../../ast-node/base-ast-node';
import { NumberValueObject } from '../../value-object/primitive-object';
import { Interpreter } from '../interpreter';

class AsyncReferenceLikeNode extends BaseAstNode {
    readonly executeAsyncSpy = vi.fn(async () => {
        this.setValue(NumberValueObject.create(42));
        return AstNodePromiseType.SUCCESS;
    });

    constructor() {
        super('[Remote]Sheet1!A1');
        this.setAsync();
    }

    override executeAsync() {
        return this.executeAsyncSpy();
    }
}

describe('Interpreter async nodes', () => {
    it('detects and awaits an async root node regardless of node type', async () => {
        const interpreter = new Interpreter({
            currentColumn: 0,
            currentRow: 0,
            isStopExecution: () => false,
        });
        const node = new AsyncReferenceLikeNode();

        expect(interpreter.checkAsyncNode(node)).toBe(true);
        const value = await interpreter.executeAsync({ node, refOffsetX: 0, refOffsetY: 0 });

        expect(node.executeAsyncSpy).toHaveBeenCalledOnce();
        expect((value as NumberValueObject).getValue()).toBe(42);
    });
});
