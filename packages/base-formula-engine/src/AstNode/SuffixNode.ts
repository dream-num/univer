import { LexerTreeMaker } from '../Analysis/Lexer';
import { LexerNode } from '../Analysis/LexerNode';
import { IInterpreterDatasetConfig } from '../Basics/Common';
import { ErrorType } from '../Basics/ErrorType';
import { ParserDataLoader } from '../Basics/ParserDataLoader';
import { FORMULA_AST_NODE_REGISTRY } from '../Basics/Registry';
import { suffixToken } from '../Basics/Token';
import { BaseFunction } from '../Functions/BaseFunction';
import { ErrorValueObject } from '../OtherObject/ErrorValueObject';
import { BaseReferenceObject, FunctionVariantType } from '../ReferenceObject/BaseReferenceObject';
import { CellReferenceObject } from '../ReferenceObject/CellReferenceObject';
import { NumberValueObject } from '../ValueObject/PrimitiveObject';
import { BaseAstNode, ErrorNode } from './BaseAstNode';
import { BaseAstNodeFactory } from './BaseAstNodeFactory';
import { NODE_ORDER_MAP, NodeType } from './NodeType';

export class SuffixNode extends BaseAstNode {
    constructor(
        private _operatorString: string,
        private _functionExecutor?: BaseFunction
    ) {
        super(_operatorString);
    }

    override get nodeType() {
        return NodeType.SUFFIX;
    }

    override execute(interpreterCalculateProps?: IInterpreterDatasetConfig) {
        const children = this.getChildren();
        const value = children[0].getValue();
        let result: FunctionVariantType;
        if (value == null) {
            throw new Error('object is null');
        }
        if (this._operatorString === suffixToken.PERCENTAGE) {
            result = this._functionExecutor!.calculate(value, new NumberValueObject(100)) as FunctionVariantType;
        } else if (this._operatorString === suffixToken.POUND) {
            result = this._handlerPound(value, interpreterCalculateProps);
        } else {
            result = ErrorValueObject.create(ErrorType.VALUE);
        }
        this.setValue(result);
    }

    private _handlerPound(value: FunctionVariantType, interpreterDatasetConfig?: IInterpreterDatasetConfig) {
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

        const cellValue = value as CellReferenceObject;
        const range = cellValue.getRangeData();
        const unitId = cellValue.getUnitId();
        const sheetId = cellValue.getSheetId();
        const formulaData = interpreterDatasetConfig?.formulaData;

        const formulaString = formulaData?.[unitId]?.[sheetId]?.[range.startRow]?.[range.startColumn]?.formula;

        if (!formulaString) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const lexerTreeMaker = new LexerTreeMaker(formulaString);
        const lexerNode = lexerTreeMaker.treeMaker();
        lexerTreeMaker.suffixExpressionHandler(lexerNode);

        return ErrorValueObject.create(ErrorType.VALUE);
        /** todo */
    }
}

export class SuffixNodeFactory extends BaseAstNodeFactory {
    override get zIndex() {
        return NODE_ORDER_MAP.get(NodeType.SUFFIX) || 100;
    }

    override checkAndCreateNodeType(param: LexerNode | string, parserDataLoader: ParserDataLoader) {
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
            return new SuffixNode(tokenTrim);
        } else {
            return;
        }

        const functionExecutor = parserDataLoader.getExecutor(functionName);
        if (!functionExecutor) {
            console.error(`No function ${param}`);
            return ErrorNode.create(ErrorType.NAME);
        }
        return new SuffixNode(tokenTrim, functionExecutor);
    }
}

FORMULA_AST_NODE_REGISTRY.add(new SuffixNodeFactory());
