import { suffixToken } from '../Basics/Token';
import { FORMULA_AST_NODE_REGISTRY } from '../Basics/Registry';
import { BaseAstNode, ErrorNode } from './BaseAstNode';
import { NodeType, NODE_ORDER_MAP } from './NodeType';
import { ParserDataLoader } from '../Basics/ParserDataLoader';
import { ErrorType } from '../Basics/ErrorType';
import { BaseFunction } from '../Functions/BaseFunction';
import { NumberValueObject } from '../ValueObject/PrimitiveObject';
import { IInterpreterDatasetConfig } from '../Basics/Common';
import { ErrorValueObject } from '../OtherObject/ErrorValueObject';
import { LexerNode } from '../Analysis/LexerNode';
import { BaseReferenceObject, FunctionVariantType } from '../ReferenceObject/BaseReferenceObject';
import { CellReferenceObject } from '../ReferenceObject/CellReferenceObject';
import { LexerTreeMaker } from '../Analysis/Lexer';
import { BaseAstNodeFactory } from './BaseAstNodeFactory';

export class SuffixNode extends BaseAstNode {
    constructor(private _operatorString: string, private _functionExecutor?: BaseFunction) {
        super(_operatorString);
    }

    override get nodeType() {
        return NodeType.SUFFIX;
    }

    override execute(interpreterCalculateProps?: IInterpreterDatasetConfig) {
        const children = this.getChildren();
        const value = children[0].getValue();
        let result: FunctionVariantType;
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
        const rangeData = cellValue.getRangeData();
        const unitId = cellValue.getUnitId();
        const sheetId = cellValue.getSheetId();
        const formulaData = interpreterDatasetConfig?.formulaData;

        const formulaString = formulaData?.[unitId]?.[sheetId]?.[rangeData.startRow]?.[rangeData.startColumn]?.formula;

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
            return false;
        }

        const tokenTrim = param.getToken().trim();

        if (tokenTrim.charAt(0) === '"' && tokenTrim.charAt(tokenTrim.length - 1) === '"') {
            return false;
        }

        let functionName = '';
        if (tokenTrim === suffixToken.PERCENTAGE) {
            functionName = 'DIVIDED';
        } else if (tokenTrim === suffixToken.POUND) {
            return new SuffixNode(tokenTrim);
        } else {
            return false;
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
