import { createIdentifier } from '@wendellhu/redi';

// import { UniverDoc } from '../../Basics/UniverDoc';
// import { UniverSheet } from '../../Basics/UniverSheet';
// import { UniverSlide } from '../../Basics/UniverSlide';
import { Disposable } from '../../Shared/lifecycle';
// import { ICurrentUniverService } from '../current.service';

export interface IContextService {
    getContextValue(key: string): boolean;
    setContextValue(key: string, value: boolean): void;

    // TODO: actually it should provide an `evaluate` method to evaluate the context value. An callback in shortcut service works but not looks nice.
}

export const IContextService = createIdentifier<IContextService>('univer.context-service');

export class ContextService extends Disposable implements IContextService {
    private readonly _contextMap = new Map<string, boolean>();

    getContextValue(key: string): boolean {
        return this._contextMap.get(key) ?? false;
    }

    setContextValue(key: string, value: boolean): void {
        this._contextMap.set(key, value);
    }

    // private handleFocusedUniverChange() {
    //     [FOCUSING_DOC, FOCUSING_SHEET, FOCUSING_SLIDE].forEach((k) => this.setContextValue(k, false));

    //     const current = this._currentUniverService.getFocusedUniverInstance();
    //     if (current instanceof UniverSheet) {
    //         this.setContextValue(FOCUSING_SHEET, true);
    //     } else if (current instanceof UniverDoc) {
    //         this.setContextValue(FOCUSING_DOC, true);
    //     } else if (current instanceof UniverSlide) {
    //         this.setContextValue(FOCUSING_SLIDE, true);
    //     }
    // }
}
