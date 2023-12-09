import type { IAccessor } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';

import { ErrorType } from '../../basics/error-type';
import { suffixToken } from '../../basics/token';
import type { BaseFunction } from '../../functions/base-function';
import { FUNCTION_NAMES_META } from '../../functions/meta/function-names';
import { IFormulaCurrentConfigService } from '../../services/current-data.service';
import { IFunctionService } from '../../services/function.service';
import { LexerTreeBuilder } from '../analysis/lexer';
import { LexerNode } from '../analysis/lexer-node';
import { ErrorValueObject } from '../other-object/error-value-object';
import type { BaseReferenceObject, FunctionVariantType } from '../reference-object/base-reference-object';
import type { CellReferenceObject } from '../reference-object/cell-reference-object';
import { NumberValueObject } from '../value-object/primitive-object';
import { BaseAstNode, ErrorNode } from './base-ast-node';
import { BaseAstNodeFactory, DEFAULT_AST_NODE_FACTORY_Z_INDEX } from './base-ast-node-factory';
import { NODE_ORDER_MAP, NodeType } from './node-type';

export class SuffixNode extends BaseAstNode {
    constructor(
        private _accessor: IAccessor,
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
        const value = children[0].getValue();
        let result: FunctionVariantType;
        if (value == null) {
            throw new Error('object is null');
        }
        if (this._operatorString === suffixToken.PERCENTAGE) {
            result = this._functionExecutor!.calculate(value, new NumberValueObject(100)) as FunctionVariantType;
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

        const currentConfigService = this._accessor.get(IFormulaCurrentConfigService);

        const lexerTreeBuilder = this._accessor.get(LexerTreeBuilder);

        const cellValue = value as CellReferenceObject;
        const range = cellValue.getRangeData();
        const unitId = cellValue.getUnitId();
        const sheetId = cellValue.getSheetId();
        const formulaData = currentConfigService.getFormulaData();

        const formulaString = formulaData?.[unitId]?.[sheetId]?.[range.startRow]?.[range.startColumn]?.f;

        if (!formulaString) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const lexerNode = lexerTreeBuilder.treeBuilder(formulaString);

        return ErrorValueObject.create(ErrorType.VALUE);
        /** todo */
    }
}

export class SuffixNodeFactory extends BaseAstNodeFactory {
    constructor(
        @IFunctionService private readonly _functionService: IFunctionService,
        @Inject(Injector) private readonly _injector: Injector
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
            return new SuffixNode(this._injector, tokenTrim);
        } else {
            return;
        }

        const functionExecutor = this._functionService.getExecutor(functionName);
        if (!functionExecutor) {
            console.error(`No function ${param}`);
            return ErrorNode.create(ErrorType.NAME);
        }
        return new SuffixNode(this._injector, tokenTrim, functionExecutor);
    }
}
