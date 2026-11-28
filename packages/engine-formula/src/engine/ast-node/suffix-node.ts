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

import { DateSystem } from '@univerjs/core';
import type { BaseFunction } from '../../functions/base-function';
import type { Anchorarray } from '../../functions/lookup/anchorarray';
import type { BaseReferenceObject, FunctionVariantType } from '../reference-object/base-reference-object';
import type { BaseValueObject, ICalculationLocale } from '../value-object/base-value-object';
import { ErrorType } from '../../basics/error-type';
import { suffixToken } from '../../basics/token';
import { FUNCTION_NAMES_LOOKUP } from '../../functions/lookup/function-names';
import { FUNCTION_NAMES_META } from '../../functions/meta/function-names';
import { IFunctionService } from '../../services/function.service';
import { LexerNode } from '../analysis/lexer-node';
import { ErrorValueObject } from '../value-object/base-value-object';
import { NumberValueObject } from '../value-object/primitive-object';
import { BaseAstNode, ErrorNode } from './base-ast-node';
import { BaseAstNodeFactory, DEFAULT_AST_NODE_FACTORY_Z_INDEX } from './base-ast-node-factory';
import { NODE_ORDER_MAP, NodeType } from './node-type';

export class SuffixNode extends BaseAstNode {
    constructor(
        private _operatorString: string,
        private _functionExecutor: BaseFunction
    ) {
        super(_operatorString);
    }

    override get nodeType() {
        return NodeType.SUFFIX;
    }

    override execute(dateSystem: DateSystem = DateSystem.Date1900, regionalContext?: ICalculationLocale) {
        const children = this.getChildren();
        let value = children[0]?.getValue();
        let result: FunctionVariantType;
        if (value == null) {
            this.setValue(ErrorValueObject.create(ErrorType.ERROR));
            return;
        }

        if (this._operatorString === suffixToken.PERCENTAGE) {
            if (value.isReferenceObject()) {
                value = (value as BaseReferenceObject).withDateSystem(dateSystem, regionalContext).toArrayValueObject();
            }
            result = this._functionExecutor.calculate(
                (value as BaseValueObject).withDateSystem(dateSystem, regionalContext),
                NumberValueObject.create(100)
            ) as FunctionVariantType;
        } else if (this._operatorString === suffixToken.POUND) {
            result = this._handlerPound(value);
        } else {
            result = ErrorValueObject.create(ErrorType.VALUE);
        }
        this.setValue(result.withDateSystem(dateSystem, regionalContext));
    }

    private _handlerPound(value: FunctionVariantType): FunctionVariantType {
        if (!value.isReferenceObject()) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }
        const reference = value as BaseReferenceObject;
        const { startRow, startColumn } = reference.getRangePosition();
        this._functionExecutor.setRefInfo(reference.getUnitId(), reference.getSheetId(), startRow, startColumn);
        return (this._functionExecutor as Anchorarray).calculate(reference);
    }
}

export class SuffixNodeFactory extends BaseAstNodeFactory {
    constructor(
        @IFunctionService private readonly _functionService: IFunctionService
    ) {
        super();
    }

    override get zIndex() {
        return NODE_ORDER_MAP.get(NodeType.SUFFIX) || DEFAULT_AST_NODE_FACTORY_Z_INDEX;
    }

    override checkAndCreateNodeType(param: LexerNode | string) {
        if (!(param instanceof LexerNode)) {
            return;
        }

        const tokenTrim = param.getToken().trim();

        if (tokenTrim.charAt(0) === '"' && tokenTrim.charAt(tokenTrim.length - 1) === '"') {
            return;
        }

        let functionName = '';
        if (tokenTrim === suffixToken.PERCENTAGE) {
            functionName = FUNCTION_NAMES_META.DIVIDED;
        } else if (tokenTrim === suffixToken.POUND) {
            functionName = FUNCTION_NAMES_LOOKUP.ANCHORARRAY;
        } else {
            return;
        }

        const functionExecutor = this._functionService.getExecutor(functionName);
        if (!functionExecutor) {
            console.error(`No function ${param}`);
            return ErrorNode.create(ErrorType.NAME);
        }
        return new SuffixNode(tokenTrim, functionExecutor);
    }
}
