import { Disposable, IRange, IUnitRange, LifecycleStages, Nullable, ObjectMatrix, OnLifecycle } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import { LexerTreeBuilder } from '../analysis/lexer';
import { LexerNode } from '../analysis/lexer-node';
import { AstTreeBuilder } from '../analysis/parser';
import { AstRootNode, FunctionNode, PrefixNode, SuffixNode } from '../ast-node';
import { BaseAstNode, ErrorNode } from '../ast-node/base-ast-node';
import { FormulaASTCache } from '../ast-node/cache-lru';
import { NodeType } from '../ast-node/node-type';
import { ErrorType } from '../basics/error-type';
import { PreCalculateNodeType } from '../basics/node-type';
import { prefixToken, suffixToken } from '../basics/token';
import { Interpreter } from '../interpreter/interpreter';
import { BaseReferenceObject } from '../reference-object/base-reference-object';
import { IFormulaCurrentConfigService } from '../services/current-data.service';
import { IFormulaRuntimeService } from '../services/runtime.service';
import { FormulaDependencyTree } from './dependency-tree';

@OnLifecycle(LifecycleStages.Rendered, FormulaDependencyGenerator)
export class FormulaDependencyGenerator extends Disposable {
    private _updateRangeFlattenCache = new Map<string, Map<string, IRange>>();

    constructor(
        @IFormulaCurrentConfigService private readonly _currentConfigService: IFormulaCurrentConfigService,
        @IFormulaRuntimeService private readonly _runtimeService: IFormulaRuntimeService,
        @Inject(Interpreter) private readonly _interpreter: Interpreter,
        @Inject(AstTreeBuilder) private readonly _astTreeBuilder: AstTreeBuilder,
        @Inject(LexerTreeBuilder) private readonly _lexerTreeBuilder: LexerTreeBuilder
    ) {
        super();
    }

    override dispose(): void {
        this._updateRangeFlattenCache.clear();
        FormulaASTCache.clear();
    }

    updateRangeFlatten() {
        const forceCalculate = this._currentConfigService.isForceCalculate();
        const updateRangeList = this._currentConfigService.getUpdateRangeList();
        if (forceCalculate) {
            return;
        }
        this._updateRangeFlattenCache = new Map<string, Map<string, IRange>>();
        for (let i = 0; i < updateRangeList.length; i++) {
            const gridRange = updateRangeList[i];
            const range = gridRange.range;
            const sheetId = gridRange.sheetId;
            const unitId = gridRange.unitId;

            this._addFlattenCache(unitId, sheetId, range);
        }
    }

    async generate() {
        this.updateRangeFlatten();

        // const formulaInterpreter = Interpreter.create(interpreterDatasetConfig);

        const formulaData = this._currentConfigService.getFormulaData();

        const formulaDataKeys = Object.keys(formulaData);

        const treeList: FormulaDependencyTree[] = [];

        for (const unitId of formulaDataKeys) {
            const sheetData = formulaData[unitId];

            const sheetDataKeys = Object.keys(sheetData);

            for (const sheetId of sheetDataKeys) {
                const matrixData = new ObjectMatrix(sheetData[sheetId]);

                matrixData.forValue((row, column, formulaDataItem) => {
                    const formulaString = formulaDataItem.f;
                    const node = this._generateAstNode(formulaString);

                    const FDtree = new FormulaDependencyTree();

                    FDtree.node = node;
                    FDtree.formula = formulaString;
                    FDtree.unitId = unitId;
                    FDtree.sheetId = sheetId;
                    FDtree.row = row;
                    FDtree.column = column;

                    treeList.push(FDtree);
                });
            }
        }

        for (let i = 0, len = treeList.length; i < len; i++) {
            const tree = treeList[i];

            this._runtimeService.setCurrent(tree.row, tree.column, tree.sheetId, tree.unitId);

            if (tree.node == null) {
                throw new Error('tree node is null');
            }

            const rangeList = await this._getRangeListByNode(tree.node);

            for (let r = 0, rLen = rangeList.length; r < rLen; r++) {
                tree.pushRangeList(rangeList[r]);
            }
        }

        const updateTreeList = this._getUpdateTreeListAndMakeDependency(treeList);

        return Promise.resolve(this._calculateRunList(updateTreeList));
    }

    private _generateAstNode(formulaString: string) {
        let astNode: Nullable<AstRootNode> = FormulaASTCache.get(formulaString);

        if (astNode) {
            return astNode;
        }

        const lexerNode = this._lexerTreeBuilder.treeBuilder(formulaString);

        if ((lexerNode as ErrorType) in ErrorType) {
            return ErrorNode.create(lexerNode as ErrorType);
        }

        // suffix Express, 1+(3*4=4)*5+1 convert to 134*4=5*1++

        astNode = this._astTreeBuilder.parse(lexerNode as LexerNode);

        if (astNode == null) {
            throw new Error('astNode is null');
        }

        FormulaASTCache.set(formulaString, astNode);

        return astNode;
    }

    private _addFlattenCache(unitId: string, sheetId: string, range: IRange) {
        let unitMatrix = this._updateRangeFlattenCache.get(unitId);
        if (!unitMatrix) {
            unitMatrix = new Map<string, IRange>();
            this._updateRangeFlattenCache.set(unitId, unitMatrix);
        }

        unitMatrix.set(sheetId, range);

        // let sheetMatrix = unitMatrix.get(sheetId);
        // if (!sheetMatrix) {
        //     sheetMatrix = new ObjectMatrix<IRange>();
        //     unitMatrix.set(sheetId, sheetMatrix);
        // }

        // // don't use destructuring assignment
        // const startRow = range.startRow;

        // const startColumn = range.startColumn;

        // const endRow = range.endRow;

        // const endColumn = range.endColumn;

        // // don't use chained calls
        // for (let r = startRow; r <= endRow; r++) {
        //     for (let c = startColumn; c <= endColumn; c++) {
        //         sheetMatrix.setValue(r, c, true);
        //     }
        // }
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
            if (this._isPreCalculateNode(item)) {
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
            if (item.nodeType === NodeType.FUNCTION && (item as FunctionNode).isAddress()) {
                result.push(item as FunctionNode);
                continue;
            }
            this._nodeTraversalReferenceFunction(item, result);
        }
    }

    private async _executeNode(node: PreCalculateNodeType | FunctionNode) {
        let value: BaseReferenceObject;
        if (this._interpreter.checkAsyncNode(node)) {
            value = (await this._interpreter.executeAsync(node)) as BaseReferenceObject;
        } else {
            value = this._interpreter.execute(node) as BaseReferenceObject;
        }
        return value;
    }

    private async _getRangeListByNode(node: BaseAstNode) {
        // ref function in offset indirect INDEX
        const preCalculateNodeList: PreCalculateNodeType[] = [];
        const referenceFunctionList: FunctionNode[] = [];

        this._nodeTraversalRef(node, preCalculateNodeList);

        this._nodeTraversalReferenceFunction(node, referenceFunctionList);

        const rangeList: IUnitRange[] = [];

        for (let i = 0, len = preCalculateNodeList.length; i < len; i++) {
            const node = preCalculateNodeList[i];

            const value: BaseReferenceObject = await this._executeNode(node);

            const gridRange = value.toUnitRange();

            rangeList.push(gridRange);
        }

        for (let i = 0, len = referenceFunctionList.length; i < len; i++) {
            const node = referenceFunctionList[i];
            const value: BaseReferenceObject = await this._executeNode(node);

            const gridRange = value.toUnitRange();

            rangeList.push(gridRange);
        }

        return rangeList;
    }

    private _includeTree(tree: FormulaDependencyTree) {
        const unitId = tree.unitId;
        const sheetId = tree.sheetId;

        if (!this._updateRangeFlattenCache.has(unitId)) {
            return false;
        }

        const sheetRangeMap = this._updateRangeFlattenCache.get(unitId)!;

        if (!sheetRangeMap.has(sheetId)) {
            return false;
        }

        const range = sheetRangeMap.get(sheetId)!;

        if (tree.compareRangeData(range)) {
            return true;
        }

        return false;
    }

    private _getUpdateTreeListAndMakeDependency(treeList: FormulaDependencyTree[]) {
        const newTreeList: FormulaDependencyTree[] = [];
        const existTree = new Set<FormulaDependencyTree>();
        const forceCalculate = this._currentConfigService.isForceCalculate();
        for (let i = 0, len = treeList.length; i < len; i++) {
            const tree = treeList[i];
            for (let m = 0, mLen = treeList.length; m < mLen; m++) {
                const treeMatch = treeList[m];
                if (tree === treeMatch) {
                    continue;
                }

                if (tree.dependency(treeMatch)) {
                    tree.pushChildren(treeMatch);
                }
            }

            /**
             * forceCalculate: Mandatory calculation, adding all formulas to dependencies
             * tree.dependencyRange: Formula dependent modification range
             * includeTree: modification range contains formula
             */
            if (
                (forceCalculate || tree.dependencyRange(this._updateRangeFlattenCache) || this._includeTree(tree)) &&
                !existTree.has(tree)
            ) {
                newTreeList.push(tree);
                existTree.add(tree);
            }
        }

        return newTreeList;
    }

    private _calculateRunList(treeList: FormulaDependencyTree[]) {
        let stack = treeList;
        const formulaRunList = [];
        while (stack.length > 0) {
            const tree = stack.pop();

            if (tree === undefined || tree.isSkip()) {
                continue;
            }

            if (tree.isAdded()) {
                formulaRunList.push(tree);
                continue;
            }

            const cacheStack: FormulaDependencyTree[] = [];

            for (let i = 0, len = tree.parents.length; i < len; i++) {
                const parentTree = tree.parents[i];
                cacheStack.push(parentTree);
            }

            if (cacheStack.length === 0) {
                formulaRunList.push(tree);
                tree.setSkip();
            } else {
                tree.setAdded();
                stack.push(tree);
                stack = stack.concat(cacheStack);
            }
        }

        return formulaRunList.reverse();
    }
}
