import { IAccessor, Inject, Injector } from '@wendellhu/redi';

import { LexerTreeBuilder } from '../Analysis/Lexer';
import { LexerNode } from '../Analysis/LexerNode';
import { ErrorType } from '../Basics/ErrorType';
import {
    $SUPER_TABLE_COLUMN_REGEX,
    REFERENCE_REGEX_SINGLE_COLUMN,
    REFERENCE_REGEX_SINGLE_ROW,
    REFERENCE_SINGLE_RANGE_REGEX,
} from '../Basics/Regex';
import { BaseReferenceObject } from '../ReferenceObject/BaseReferenceObject';
import { CellReferenceObject } from '../ReferenceObject/CellReferenceObject';
import { ColumnReferenceObject } from '../ReferenceObject/ColumnReferenceObject';
import { RowReferenceObject } from '../ReferenceObject/RowReferenceObject';
import { TableReferenceObject } from '../ReferenceObject/TableReferenceObject';
import { IFormulaCurrentConfigService } from '../Service/current-data.service';
import { IDefinedNamesService } from '../Service/defined-names.service';
import { IFormulaRuntimeService } from '../Service/runtime.service';
import { ISuperTableService } from '../Service/super-table.service';
import { BaseAstNode, ErrorNode } from './BaseAstNode';
import { BaseAstNodeFactory, DEFAULT_AST_NODE_FACTORY_Z_INDEX } from './BaseAstNodeFactory';
import { NODE_ORDER_MAP, NodeType } from './NodeType';

export class ReferenceNode extends BaseAstNode {
    constructor(
        private _accessor: IAccessor,
        private _operatorString: string,
        private _referenceObject: BaseReferenceObject
    ) {
        super(_operatorString);
    }

    override get nodeType() {
        return NodeType.REFERENCE;
    }

    override execute() {
        const currentConfigService = this._accessor.get(IFormulaCurrentConfigService);
        const runtimeService = this._accessor.get(IFormulaRuntimeService);

        this._referenceObject.setUnitData(currentConfigService.getUnitData());
        this._referenceObject.setForcedSheetId(currentConfigService.getSheetNameMap());

        this._referenceObject.setDefaultSheetId(runtimeService.currentSheetId);
        this._referenceObject.setDefaultUnitId(runtimeService.currentUnitId);
        this._referenceObject.setRuntimeData(runtimeService.getUnitData());

        this.setValue(this._referenceObject);
    }
}

export class ReferenceNodeFactory extends BaseAstNodeFactory {
    constructor(
        @IDefinedNamesService private readonly _definedNamesService: IDefinedNamesService,
        @ISuperTableService private readonly _superTableService: ISuperTableService,
        @Inject(LexerTreeBuilder) private readonly _lexerTreeBuilder: LexerTreeBuilder,
        @Inject(Injector) private readonly _injector: Injector
    ) {
        super();
    }

    override get zIndex() {
        return NODE_ORDER_MAP.get(NodeType.REFERENCE) || DEFAULT_AST_NODE_FACTORY_Z_INDEX;
    }

    override checkAndCreateNodeType(param: LexerNode | string) {
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
            return;
        }

        if (new RegExp(REFERENCE_SINGLE_RANGE_REGEX).test(tokenTrim)) {
            return new ReferenceNode(this._injector, tokenTrim, new CellReferenceObject(tokenTrim));
        }

        if (isLexerNode && new RegExp(REFERENCE_REGEX_SINGLE_ROW).test(tokenTrim)) {
            return new ReferenceNode(this._injector, tokenTrim, new RowReferenceObject(tokenTrim));
        }

        if (isLexerNode && new RegExp(REFERENCE_REGEX_SINGLE_COLUMN).test(tokenTrim)) {
            return new ReferenceNode(this._injector, tokenTrim, new ColumnReferenceObject(tokenTrim));
        }

        const nameMap = this._definedNamesService.getDefinedNameMap();

        if (!isLexerNode && nameMap.has(tokenTrim)) {
            const nameString = nameMap.get(tokenTrim)!;
            const lexerNode = this._lexerTreeBuilder.treeBuilder(nameString);
            /** todo */
            return new ErrorNode(ErrorType.VALUE);
        }

        // parserDataLoader.get

        const tableMap = this._superTableService.getTableMap();
        const $regex = $SUPER_TABLE_COLUMN_REGEX;
        const tableName = tokenTrim.replace($regex, '');
        if (!isLexerNode && tableMap.has(tableName)) {
            const columnResult = $regex.exec(tokenTrim);
            let columnDataString = '';
            if (columnResult) {
                columnDataString = columnResult[0];
            }
            const tableData = tableMap.get(tableName)!;
            const tableOption = this._superTableService.getTableOptionMap();
            return new ReferenceNode(
                this._injector,
                tokenTrim,
                new TableReferenceObject(tokenTrim, tableData, columnDataString, tableOption)
            );
        }
    }
}
