import { Disposable } from '@univerjs/core';
import { createIdentifier } from '@wendellhu/redi';

export interface IDefinedNamesService {
    registerDefinedName(name: string, reference: string): void;

    getDefinedNameMap(): Map<string, string>;
}

export class DefinedNamesService extends Disposable implements IDefinedNamesService {
    // 18.2.6 definedNames (Defined Names)
    private _definedNameMap: Map<string, string> = new Map();

    override dispose(): void {
        this._definedNameMap.clear();
    }

    registerDefinedName(name: string, reference: string) {
        this._definedNameMap.set(name, reference);
    }

    getDefinedNameMap() {
        return this._definedNameMap;
    }
}

export const IDefinedNamesService = createIdentifier<DefinedNamesService>('univer.formula.defined-names.service');
