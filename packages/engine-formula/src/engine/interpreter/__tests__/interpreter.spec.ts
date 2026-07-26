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
            isStopExecution: () => false,
        } as never);
        const node = new AsyncReferenceLikeNode();

        expect(interpreter.checkAsyncNode(node)).toBe(true);
        const value = await interpreter.executeAsync({ node, refOffsetX: 0, refOffsetY: 0 });

        expect(node.executeAsyncSpy).toHaveBeenCalledOnce();
        expect((value as NumberValueObject).getValue()).toBe(42);
    });
});
