/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { Nullable } from '@univerjs/core';
import { Disposable, ICommandService } from '@univerjs/core';
import { makeSelection } from '@univerjs/docs';
import { DocCanvasPopManagerService } from '@univerjs/docs-ui';
import type { IDisposable } from '@wendellhu/redi';
import { Inject } from '@wendellhu/redi';
import { BehaviorSubject } from 'rxjs';

import type { IAddDocUniFormulaCommandParams } from '../commands/command';
import { AddDocUniFormulaCommand } from '../commands/command';

export const DOC_FORMULA_POPUP_KEY = 'DOC_FORMULA_POPUP' as const;

export interface IDocFormulaPopupInfo {
    unitId: string;

    /** If the popup is for inserting a formula or inspecting an existing formula. */
    type: 'new' | 'existing';

    f: Nullable<string>;

    disposable: IDisposable;

    startIndex: number;
}

export class DocFormulaPopupService extends Disposable {
    private readonly _popupInfo$ = new BehaviorSubject<Nullable<IDocFormulaPopupInfo>>(null);
    readonly popupInfo$ = this._popupInfo$.asObservable();
    get popupInfo(): Nullable<IDocFormulaPopupInfo> { return this._popupInfo$.getValue(); }

    private _popupLocked = false;

    constructor(
        @Inject(DocCanvasPopManagerService) private readonly _docCanvasPopupManagerService: DocCanvasPopManagerService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();
    }

    override dispose(): void {
        super.dispose();

        this._popupInfo$.next(null);
        this._popupInfo$.complete();
    }

    cancel(): void {
        this.unlockPopup();
        this.closePopup();
    }

    writeFormulaString(f: Nullable<string>): void {
        const info = this.popupInfo;
        if (!info) return;

        this.unlockPopup();
        this.closePopup();

        // write this formula string to doc
        this._commandService.executeCommand(AddDocUniFormulaCommand.id, {
            unitId: info.unitId,
            f,
            startIndex: info.startIndex,
        } as IAddDocUniFormulaCommandParams);
    }

    showPopup(unitId: string, startIndex: number, type: 'new' | 'existing'): boolean {
        this.closePopup();

        const disposable = this._docCanvasPopupManagerService.attachPopupToRange(makeSelection(startIndex), {
            componentKey: DOC_FORMULA_POPUP_KEY,
            onClickOutside: () => this.closePopup(), // user may update ref range selections
            direction: 'top',
        });

        // TODO: write formula string
        this._popupInfo$.next({ unitId, disposable, type, f: '', startIndex });

        return true;
    }

    lockPopup(): void {
        this._popupLocked = true;
    }

    unlockPopup(): void {
        this._popupLocked = false;
    }

    closePopup(): boolean {
        if (this._popupLocked) return false;

        this.popupInfo?.disposable.dispose();
        this._popupInfo$.next(null);
        return true;
    }
}

