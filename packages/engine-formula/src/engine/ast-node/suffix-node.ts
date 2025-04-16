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

import type { BaseFunction } from '../../functions/base-function';

import type { BaseReferenceObject, FunctionVariantType } from '../reference-object/base-reference-object';
import type { CellReferenceObject } from '../reference-object/cell-reference-object';
import type { BaseValueObject } from '../value-object/base-value-object';
import { Inject } from '@univerjs/core';
import { ErrorType } from '../../basics/error-type';
import { suffixToken } from '../../basics/token';
import { FUNCTION_NAMES_META } from '../../functions/meta/function-names';
import { IFormulaCurrentConfigService } from '../../services/current-data.service';
import { IFunctionService } from '../../services/function.service';
import { Lexer } from '../analysis/lexer';
import { LexerNode } from '../analysis/lexer-node';
import { ErrorValueObject } from '../value-object/base-value-object';
import { NumberValueObject } from '../value-object/primitive-object';
import { BaseAstNode, ErrorNode } from './base-ast-node';
import { BaseAstNodeFactory, DEFAULT_AST_NODE_FACTORY_Z_INDEX } from './base-ast-node-factory';
import { NODE_ORDER_MAP, NodeType } from './node-type';

export class SuffixNode extends BaseAstNode {
    constructor(
        private _currentConfigService: IFormulaCurrentConfigService,
        private _lexer: Lexer,
        private _operatorString: string,
        private _functionExecutor?: BaseFunction
    ) {
        super(_operatorString);
    }

    override get nodeType() {
        return NodeType.SUFFIX;
    }

    override execute() {
        const children = this.getChildren();
        let value = children[0].getValue();
        let result: FunctionVariantType;
        if (value == null) {
            throw new Error('object is null');
        }

        if (this._operatorString === suffixToken.PERCENTAGE) {
            if (value.isReferenceObject()) {
                value = (value as BaseReferenceObject).toArrayValueObject();
            }
            result = this._functionExecutor!.calculate(
                value as BaseValueObject,
                NumberValueObject.create(100)
            ) as FunctionVariantType;

            // set number format
            if ((result as NumberValueObject).isNumber()) {
                const value = Number((result as NumberValueObject).getValue());
                result = NumberValueObject.create(value, '0.00%');
            }
        } else if (this._operatorString === suffixToken.POUND) {
            result = this._handlerPound(value);
        } else {
            result = ErrorValueObject.create(ErrorType.VALUE);
        }
        this.setValue(result);
    }

    private _handlerPound(value: FunctionVariantType) {
        // const sheetData = interpreterDatasetConfig.sheetData;
        // if (!sheetData) {
        //     return false;
        // }

        if (!value.isReferenceObject()) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        if (!(value as BaseReferenceObject).isCell()) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        // const currentConfigService = this._accessor.get(IFormulaCurrentConfigService);

        // const lexer = this._accessor.get(Lexer);

        const cellValue = value as CellReferenceObject;
        const range = cellValue.getRangePosition();
        const unitId = cellValue.getUnitId();
        const sheetId = cellValue.getSheetId();
        const formulaData = this._currentConfigService.getFormulaData();

        const formulaString = formulaData?.[unitId]?.[sheetId]?.[range.startRow]?.[range.startColumn]?.f;

        if (!formulaString) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const lexerNode = this._lexer.treeBuilder(formulaString);

        return ErrorValueObject.create(ErrorType.VALUE);
        /** todo */
    }
}

export class SuffixNodeFactory extends BaseAstNodeFactory {
    constructor(
        @IFunctionService private readonly _functionService: IFunctionService,
        @Inject(Lexer) private readonly _lexer: Lexer,
        @IFormulaCurrentConfigService private readonly _currentConfigService: IFormulaCurrentConfigService
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
            return new SuffixNode(this._currentConfigService, this._lexer, tokenTrim);
        } else {
            return;
        }

        const functionExecutor = this._functionService.getExecutor(functionName);
        if (!functionExecutor) {
            console.error(`No function ${param}`);
            return ErrorNode.create(ErrorType.NAME);
        }
        return new SuffixNode(this._currentConfigService, this._lexer, tokenTrim, functionExecutor);
    }
}
