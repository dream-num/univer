import { IUnitRange } from '@univerjs/core';
import { Dependency, Inject, Injector } from '@wendellhu/redi';

import { LexerTreeMaker } from '../Analysis/Lexer';
import { AstTreeMaker } from '../Analysis/Parser';
import { FormulaDataType, IInterpreterDatasetConfig } from '../Basics/Common';
import { FormulaDependencyGenerator } from '../Dependency/FormulaDependency';
import { Interpreter } from '../Interpreter/Interpreter';
import { FunctionVariantType } from '../ReferenceObject/BaseReferenceObject';

export class FormulaEngineService {
    constructor(@Inject(Injector) readonly _injector: Injector) {
        this._initializeDependencies(this._injector);
    }

    /**
     *
     * @param unitId
     * @param formulaData
     * @param interpreterDatasetConfig
     * @param forceCalculate force calculate all formula, and ignore dependency relationship
     * @param updateRangeList input external unit data for multi workbook
     * @returns
     */
    async execute(
        unitId: string,
        formulaData: FormulaDataType,
        interpreterDatasetConfig?: IInterpreterDatasetConfig,
        forceCalculate = false,
        updateRangeList: IUnitRange[] = []
    ) {
        const dependencyGenerator = FormulaDependencyGenerator.create(formulaData, forceCalculate);

        const treeList = await dependencyGenerator.generate(updateRangeList, interpreterDatasetConfig);

        const interpreter = Interpreter.create(interpreterDatasetConfig);

        for (let i = 0, len = treeList.length; i < len; i++) {
            const tree = treeList[i];
            const astNode = tree.node;
            let value: FunctionVariantType;

            if (astNode == null) {
                throw new Error('astNode is null');
            }

            interpreter.setCurrentPosition(tree.row, tree.column, tree.sheetId, tree.unitId);

            if (interpreter.checkAsyncNode(astNode)) {
                value = await interpreter.executeAsync(astNode);
            } else {
                value = interpreter.execute(astNode);
            }
            interpreter.setRuntimeData(tree.row, tree.column, tree.sheetId, tree.unitId, value);
        }

        return {
            sheetData: interpreter.getSheetData(unitId),
            arrayFormulaData: interpreter.getSheetArrayFormula(unitId),
        };
    }

    calculate(formulaString: string) {
        // TODO how to observe @alex
        // this.getObserver('onBeforeFormulaCalculateObservable')?.notifyObservers(formulaString);
        const lexerTreeMaker = new LexerTreeMaker(formulaString);
        const lexerNode = lexerTreeMaker.treeMaker();
        lexerTreeMaker.suffixExpressionHandler(lexerNode); // suffix Express, 1+(3*4=4)*5+1 convert to 134*4=5*1++
        console.log('lexerNode', lexerNode.serialize());

        // this.getObserver('onAfterFormulaLexerObservable')?.notifyObservers(lexerNode);

        const astTreeMaker = new AstTreeMaker();

        const astNode = astTreeMaker.parse(lexerNode);

        console.log('astNode', astNode?.serialize());

        // const interpreter = Interpreter.create();

        // if (astNode == null) {
        //     return;
        // }

        // if (interpreter.checkAsyncNode(astNode)) {
        //     const resultPromise = interpreter.executeAsync(astNode);

        //     resultPromise.then((value) => {
        //         console.log('formulaResult', value);
        //     });
        // } else {
        //     console.log(interpreter.execute(astNode));
        // }
    }

    private _initializeDependencies(injector: Injector) {
        const dependencies: Dependency[] = [
            // services
            // [BorderStyleManagerService],
            // [SelectionManagerService],
            // [RefRangeService],
        ];

        dependencies.forEach((d) => {
            injector.add(d);
        });
    }
}
