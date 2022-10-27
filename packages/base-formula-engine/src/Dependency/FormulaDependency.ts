import { IGridRange, IRangeData, ObjectMatrix } from '@univer/core';
import { generateAstNode } from '../Analysis/Tools';
import { FunctionNode, PrefixNode, ReferenceNode, SuffixNode, UnionNode } from '../AstNode';
import { BaseAstNode } from '../AstNode/BaseAstNode';
import { NodeType } from '../AstNode/NodeType';
import { FormulaDataType, IInterpreterDatasetConfig } from '../Basics/Common';
import { REFERENCE_FUNCTION_SET } from '../Basics/SpecialFunction';
import { prefixToken, suffixToken } from '../Basics/Token';
import { Interpreter } from '../Interpreter/Interpreter';
import { FormulaDependencyTree } from './DependencyTree';

type PreCalculateNodeType = ReferenceNode | UnionNode | PrefixNode | SuffixNode;

export class FormulaDependencyGenerator {
    private _updateRangeFlattenCache = new Map<string, ObjectMatrix<boolean>>();

    constructor(private _formulaData: FormulaDataType) {}

    updateRangeFlatten(updateRangeList: IGridRange[]) {
        for (let i = 0; i < updateRangeList.length; i++) {
            const gridRange = updateRangeList[i];
            const range = gridRange.rangeData;
            const sheetId = gridRange.sheetId;

            this._addFlattenCache(sheetId, range);
        }
    }

    private _addFlattenCache(sheetId: string, rangeData: IRangeData) {
        let matrix = this._updateRangeFlattenCache.get(sheetId);
        if (!matrix) {
            matrix = new ObjectMatrix<boolean>();
            this._updateRangeFlattenCache.set(sheetId, matrix);
        }

        // don't use destructuring assignment
        const startRow = rangeData.startRow;

        const startColumn = rangeData.startColumn;

        const endRow = rangeData.endRow;

        const endColumn = rangeData.endColumn;

        // don't use chained calls
        for (let r = startRow; r <= endRow; r++) {
            for (let c = startColumn; c <= endColumn; c++) {
                matrix.setValue(r, c, true);
            }
        }
    }

    private _isPreCalculateNode(node: BaseAstNode) {
        if (node.nodeType === NodeType.UNION) {
            return true;
        }

        if (node.nodeType === NodeType.PREFIX && (node as PrefixNode).getToken() === prefixToken.AT) {
            return true;
        }

        if (node.nodeType === NodeType.SUFFIX && (node as SuffixNode).getToken() === suffixToken.POUND) {
            return true;
        }

        return false;
    }

    private _nodeTraversalRef(node: BaseAstNode, result: PreCalculateNodeType[]) {
        const children = node.getChildren();
        const childrenCount = children.length;
        for (let i = 0; i < childrenCount; i++) {
            const item = children[i];
            if (this._isPreCalculateNode(node)) {
                result.push(item as PreCalculateNodeType);
                continue;
            } else if (item.nodeType === NodeType.REFERENCE) {
                result.push(item as PreCalculateNodeType);
            }
            this._nodeTraversalRef(item, result);
        }
    }

    private _nodeTraversalReferenceFunction(node: BaseAstNode, result: FunctionNode[]) {
        const children = node.getChildren();
        const childrenCount = children.length;
        for (let i = 0; i < childrenCount; i++) {
            const item = children[i];
            if (item.nodeType === NodeType.FUNCTION && REFERENCE_FUNCTION_SET.has((item as FunctionNode).getToken())) {
                result.push(item as FunctionNode);
                continue;
            }
            this._nodeTraversalReferenceFunction(item, result);
        }
    }

    private async _getRangeListByNode(node: BaseAstNode, formulaInterpreter: Interpreter) {
        // ref function in offset indirect INDEX
        const preCalculateNodeList: PreCalculateNodeType[] = [];
        const referenceFunctionList: FunctionNode[] = [];

        this._nodeTraversalRef(node, preCalculateNodeList);

        this._nodeTraversalReferenceFunction(node, referenceFunctionList);

        const rangeList = [];

        for (let i = 0, len = preCalculateNodeList.length; i < len; i++) {
            const node = preCalculateNodeList[i];

            const value = await formulaInterpreter.execute(node);
        }
    }

    async generate(updateRangeList: IGridRange[] = [], interpreterDatasetConfig?: IInterpreterDatasetConfig) {
        this.updateRangeFlatten(updateRangeList);

        const FDtree = new FormulaDependencyTree();

        const formulaInterpreter = Interpreter.create(interpreterDatasetConfig);

        const formulaDataKeys = Object.keys(this._formulaData);

        for (let sheetId of formulaDataKeys) {
            const matrixData = new ObjectMatrix(this._formulaData[sheetId]);

            matrixData.forEach((row, rangeRow) => {
                rangeRow.forEach((column, formulaData) => {
                    const formulaString = formulaData.formula;
                    const node = generateAstNode(formulaString);
                });
            });
        }
    }

    static create(formulaData: FormulaDataType) {
        return new FormulaDependencyGenerator(formulaData);
    }
}
