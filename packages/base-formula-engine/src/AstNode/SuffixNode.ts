import { IAccessor, Inject, Injector } from '@wendellhu/redi';

import { LexerTreeMaker } from '../Analysis/Lexer';
import { LexerNode } from '../Analysis/LexerNode';
import { ErrorType } from '../Basics/ErrorType';
import { suffixToken } from '../Basics/Token';
import { BaseFunction } from '../Functions/BaseFunction';
import { ErrorValueObject } from '../OtherObject/ErrorValueObject';
import { BaseReferenceObject, FunctionVariantType } from '../ReferenceObject/BaseReferenceObject';
import { CellReferenceObject } from '../ReferenceObject/CellReferenceObject';
import { ICurrentConfigService } from '../Service/current-data.service';
import { IFunctionService } from '../Service/function.service';
import { NumberValueObject } from '../ValueObject/PrimitiveObject';
import { BaseAstNode, ErrorNode } from './BaseAstNode';
import { BaseAstNodeFactory, DEFAULT_AST_NODE_FACTORY_Z_INDEX } from './BaseAstNodeFactory';
import { NODE_ORDER_MAP, NodeType } from './NodeType';

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

        const currentConfigService = this._accessor.get(ICurrentConfigService);

        const lexerTreeMaker = this._accessor.get(LexerTreeMaker);

        const cellValue = value as CellReferenceObject;
        const range = cellValue.getRangeData();
        const unitId = cellValue.getUnitId();
        const sheetId = cellValue.getSheetId();
        const formulaData = currentConfigService.getFormulaData();

        const formulaString = formulaData?.[unitId]?.[sheetId]?.[range.startRow]?.[range.startColumn]?.f;

        if (!formulaString) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const lexerNode = lexerTreeMaker.treeMaker(formulaString);

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
            functionName = 'DIVIDED';
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
