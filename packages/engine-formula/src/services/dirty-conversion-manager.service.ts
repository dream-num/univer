import type { ICommandInfo, IUnitRange, Nullable } from '@univerjs/core';
import { Disposable } from '@univerjs/core';
import { createIdentifier } from '@wendellhu/redi';

import type { IDirtyUnitFeatureMap, IDirtyUnitSheetNameMap } from '../basics/common';

export interface IDirtyConversionManagerParams {
    commandId: string;
    getDirtyData: (command: ICommandInfo) => {
        dirtyRanges?: IUnitRange[];
        dirtyNameMap?: IDirtyUnitSheetNameMap;
        dirtyUnitFeatureMap?: IDirtyUnitFeatureMap;
    };
}

export interface IDirtyConversionManagerService {
    dispose(): void;

    remove(commandId: string): void;

    get(commandId: string): Nullable<IDirtyConversionManagerParams>;

    has(featureId: string): boolean;

    register(featureId: string, dirtyConversion: IDirtyConversionManagerParams): void;

    getDirtyConversionMap(): Map<string, IDirtyConversionManagerParams>;
}

/**
 * Actively mark as dirty, calculate the dirty area based on the command,
 * and plugins can register the ref range they affect into the formula engine.
 */
export class DirtyConversionManagerService extends Disposable implements IDirtyConversionManagerService {
    private _dirtyConversionMap: Map<string, IDirtyConversionManagerParams> = new Map();

    override dispose(): void {
        this._dirtyConversionMap.clear();
    }

    remove(commandId: string) {
        this._dirtyConversionMap.delete(commandId);
    }

    get(commandId: string) {
        return this._dirtyConversionMap.get(commandId);
    }

    has(commandId: string) {
        return this._dirtyConversionMap.has(commandId);
    }

    register(commandId: string, dirtyConversion: IDirtyConversionManagerParams) {
        this._dirtyConversionMap.set(commandId, dirtyConversion);
    }

    getDirtyConversionMap() {
        return this._dirtyConversionMap;
    }
}

export const IDirtyConversionManagerService = createIdentifier<DirtyConversionManagerService>(
    'univer.formula.dirty-conversion-manager.service'
);
