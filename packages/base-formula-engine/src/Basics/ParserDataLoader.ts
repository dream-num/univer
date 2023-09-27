import '../Functions';

import { Nullable } from '@univerjs/core';

import { LambdaRuntime } from '../AstNode/LambdaRuntime';
import { BaseFunction } from '../Functions/BaseFunction';
import { ISuperTable, TableOptionType } from './Common';
import { FORMULA_FUNCTION_REGISTRY } from './Registry';

export class ParserDataLoader {
    private _functionMap: Map<string, BaseFunction> = new Map();

    // 18.5.1.2 table (Table)
    private _tableMap: Map<string, ISuperTable> = new Map();

    // 18.5.1.2 table (Table) for I18N
    private _tableOptionMap: Map<string, TableOptionType> = new Map();

    // 18.2.6 definedNames (Defined Names)
    private _definedNameMap: Map<string, string> = new Map();

    private _lambdaRuntime: Nullable<LambdaRuntime>;

    registerFunction(...functions: BaseFunction[]) {
        for (let i = 0; i < functions.length; i++) {
            const func = functions[i];
            this._functionMap.set(func.name, func);
        }
    }

    registerTable(tableName: string, reference: ISuperTable) {
        this._tableMap.set(tableName, reference);
    }

    registerDefinedName(name: string, reference: string) {
        this._definedNameMap.set(name, reference);
    }

    registerTableOptionMap(tableOption: string, tableOptionType: TableOptionType) {
        this._tableOptionMap.set(tableOption, tableOptionType);
    }

    getTableOptionMap() {
        return this._tableOptionMap;
    }

    getFunctionMap() {
        return this._functionMap;
    }

    getTableMap() {
        return this._tableMap;
    }

    getDefinedNameMap() {
        return this._definedNameMap;
    }

    getExecutor(functionToken: string) {
        return this._functionMap.get(functionToken);
    }

    getLambdaRuntime() {
        return this._lambdaRuntime;
    }

    setLambdaRuntime(lambdaRuntime: LambdaRuntime) {
        this._lambdaRuntime = lambdaRuntime;
    }

    hasLambdaRuntime() {
        return this._lambdaRuntime != null;
    }

    hasExecutor(functionToken: string) {
        return this._functionMap.has(functionToken);
    }

    initialize() {
        this._initialFunction();
    }

    private _initialFunction() {
        this._functionMap = FORMULA_FUNCTION_REGISTRY.getData();
    }
}
