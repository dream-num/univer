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
import type { BaseFunction } from '../../functions/base-function';

import type { BaseReferenceObject, FunctionVariantType } from '../reference-object/base-reference-object';
import type { BaseValueObject } from '../value-object/base-value-object';
import { ErrorType } from '../../basics/error-type';
import { prefixToken } from '../../basics/token';
import { FUNCTION_NAMES_META } from '../../functions/meta/function-names';
import { IFunctionService } from '../../services/function.service';
import { IFormulaRuntimeService } from '../../services/runtime.service';
import { LexerNode } from '../analysis/lexer-node';
import { ErrorValueObject } from '../value-object/base-value-object';
import { NumberValueObject } from '../value-object/primitive-object';
import { BaseAstNode, ErrorNode } from './base-ast-node';
import { BaseAstNodeFactory, DEFAULT_AST_NODE_FACTORY_Z_INDEX } from './base-ast-node-factory';
import { NODE_ORDER_MAP, NodeType } from './node-type';

export class PrefixNode extends BaseAstNode {
    constructor(
        private _runtimeService: IFormulaRuntimeService,
        private _operatorString: string,
        private _functionExecutor?: Nullable<BaseFunction>
    ) {
        super(_operatorString);
    }

    override get nodeType() {
        return NodeType.PREFIX;
    }

    override execute() {
        const children = this.getChildren();
        let value = children[0].getValue();
        let result: FunctionVariantType;
        if (value == null) {
            throw new Error('object is null');
        }

        if (this._operatorString === prefixToken.MINUS) {
            if (value.isReferenceObject()) {
                value = (value as BaseReferenceObject).toArrayValueObject();
            }
            result = this._functionExecutor!.calculate(
                NumberValueObject.create(0),
                value as BaseValueObject
            ) as FunctionVariantType;
        } else if (this._operatorString === prefixToken.AT) {
            result = this._handlerAT(value);
        } else {
            result = ErrorValueObject.create(ErrorType.VALUE);
        }
        this.setValue(result);
    }

    private _handlerAT(value: FunctionVariantType) {
        if (!value.isReferenceObject()) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const currentValue = value as BaseReferenceObject;

        if (currentValue.isCell()) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const runtimeService = this._runtimeService;

        const currentRow = runtimeService.currentRow || 0;
        const currentColumn = runtimeService.currentColumn || 0;

        const rangePos = currentValue.getRangePosition();

        const { startRow, startColumn, endRow, endColumn } = rangePos;

        if (endColumn !== startColumn && endRow !== startRow) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        if (startRow === endRow && startColumn === endColumn) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        // @ projection to current
        if (endRow === startRow && currentColumn >= startColumn && currentColumn <= endColumn) {
            return currentValue.getCellByColumn(currentColumn);
        } else if (startColumn === endColumn && currentRow >= startRow && currentRow <= endRow) {
            return currentValue.getCellByRow(currentRow);
        }

        if (currentValue.isTable()) {
            return currentValue.getCellByPosition(currentRow);
        }

        return ErrorValueObject.create(ErrorType.VALUE);
    }
}

export class PrefixNodeFactory extends BaseAstNodeFactory {
    constructor(
        @IFunctionService private readonly _functionService: IFunctionService,
        @IFormulaRuntimeService private readonly _runtimeService: IFormulaRuntimeService
    ) {
        super();
    }

    override get zIndex() {
        return NODE_ORDER_MAP.get(NodeType.PREFIX) || DEFAULT_AST_NODE_FACTORY_Z_INDEX;
    }

    override checkAndCreateNodeType(param: LexerNode | string) {
        if (!(param instanceof LexerNode)) {
            return;
        }

        const token = param.getToken();
        const tokenTrim = token.trim();

        if (tokenTrim.charAt(0) === '"' && tokenTrim.charAt(tokenTrim.length - 1) === '"') {
            return;
        }

        let functionName = '';
        if (tokenTrim === prefixToken.MINUS) {
            functionName = FUNCTION_NAMES_META.MINUS;
        } else if (tokenTrim === prefixToken.AT) {
            return new PrefixNode(this._runtimeService, tokenTrim);
        } else {
            return;
        }

        const functionExecutor = this._functionService.getExecutor(functionName);
        if (!functionExecutor) {
            console.error(`No function ${token}`);
            return ErrorNode.create(ErrorType.NAME);
        }
        return new PrefixNode(this._runtimeService, tokenTrim, functionExecutor);
    }
}
