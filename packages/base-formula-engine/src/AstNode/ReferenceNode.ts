import { LexerTreeMaker } from '../Analysis/Lexer';
import { LexerNode } from '../Analysis/LexerNode';
import { IInterpreterDatasetConfig, UnitDataType } from '../Basics/Common';
import { ErrorType } from '../Basics/ErrorType';
import { ParserDataLoader } from '../Basics/ParserDataLoader';
import { $SUPER_TABLE_COLUMN_REGEX, REFERENCE_REGEX_SINGLE_COLUMN, REFERENCE_REGEX_SINGLE_ROW, REFERENCE_SINGLE_RANGE_REGEX } from '../Basics/Regex';
import { FORMULA_AST_NODE_REGISTRY } from '../Basics/Registry';
import { BaseReferenceObject } from '../ReferenceObject/BaseReferenceObject';
import { CellReferenceObject } from '../ReferenceObject/CellReferenceObject';
import { ColumnReferenceObject } from '../ReferenceObject/ColumnReferenceObject';
import { RowReferenceObject } from '../ReferenceObject/RowReferenceObject';
import { TableReferenceObject } from '../ReferenceObject/TableReferenceObject';
import { BaseAstNode, ErrorNode } from './BaseAstNode';
import { BaseAstNodeFactory } from './BaseAstNodeFactory';
import { NODE_ORDER_MAP, NodeType } from './NodeType';

export class ReferenceNode extends BaseAstNode {
    constructor(private _operatorString: string, private _referenceObject: BaseReferenceObject) {
        super(_operatorString);
    }

    override get nodeType() {
        return NodeType.REFERENCE;
    }

    override execute(interpreterCalculateProps?: IInterpreterDatasetConfig, runtimeData?: UnitDataType) {
        const props = interpreterCalculateProps;
        if (props) {
            this._referenceObject.setUnitData(props.unitData);
            this._referenceObject.setDefaultSheetId(props.currentSheetId);
            this._referenceObject.setForcedSheetId(props.sheetNameMap);
            this._referenceObject.setRowCount(props.rowCount);
            this._referenceObject.setColumnCount(props.columnCount);
            this._referenceObject.setDefaultUnitId(props.currentUnitId);
        }

        if (runtimeData) {
            this._referenceObject.setRuntimeData(runtimeData);
        }

        this.setValue(this._referenceObject);
    }
}

export class ReferenceNodeFactory extends BaseAstNodeFactory {
    override get zIndex() {
        return NODE_ORDER_MAP.get(NodeType.REFERENCE) || 100;
    }

    override checkAndCreateNodeType(param: LexerNode | string, parserDataLoader: ParserDataLoader) {
        let isLexerNode = false;
        let tokenTrim: string;
        if (param instanceof LexerNode) {
            isLexerNode = true;
            tokenTrim = param.getToken().trim();
        } else {
            tokenTrim = param.trim();
        }

        // const tokenTrim = param.trim();
        // if (new RegExp(REFERENCE_MULTIPLE_RANGE_REGEX).test(tokenTrim)) {
        //     return true;
        // }

        if (!isLexerNode && tokenTrim.charAt(0) === '"' && tokenTrim.charAt(tokenTrim.length - 1) === '"') {
            return false;
        }

        if (new RegExp(REFERENCE_SINGLE_RANGE_REGEX).test(tokenTrim)) {
            return new ReferenceNode(tokenTrim, new CellReferenceObject(tokenTrim));
        }

        if (isLexerNode && new RegExp(REFERENCE_REGEX_SINGLE_ROW).test(tokenTrim)) {
            return new ReferenceNode(tokenTrim, new RowReferenceObject(tokenTrim));
        }

        if (isLexerNode && new RegExp(REFERENCE_REGEX_SINGLE_COLUMN).test(tokenTrim)) {
            return new ReferenceNode(tokenTrim, new ColumnReferenceObject(tokenTrim));
        }

        const nameMap = parserDataLoader.getDefinedNameMap();

        if (!isLexerNode && nameMap.has(tokenTrim)) {
            const nameString = nameMap.get(tokenTrim)!;
            const lexerTreeMaker = new LexerTreeMaker(nameString);
            const lexerNode = lexerTreeMaker.treeMaker();
            lexerTreeMaker.suffixExpressionHandler(lexerNode);
            /** todo */
            return new ErrorNode(ErrorType.VALUE);
        }

        // parserDataLoader.get

        const tableMap = parserDataLoader.getTableMap();
        const $regex = $SUPER_TABLE_COLUMN_REGEX;
        const tableName = tokenTrim.replace($regex, '');
        if (!isLexerNode && tableMap.has(tableName)) {
            const columnResult = $regex.exec(tokenTrim);
            let columnDataString = '';
            if (columnResult) {
                columnDataString = columnResult[0];
            }
            const tableData = tableMap.get(tableName)!;
            const tableOption = parserDataLoader.getTableOptionMap();
            return new ReferenceNode(tokenTrim, new TableReferenceObject(tokenTrim, tableData, columnDataString, tableOption));
        }

        return false;
    }
}

FORMULA_AST_NODE_REGISTRY.add(new ReferenceNodeFactory());
