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

import type { IDisposable, Nullable } from '@univerjs/core';
import { Disposable, FORMULA_EDITOR_ACTIVATED, ICommandService, IContextService, ILogService, Inject } from '@univerjs/core';
import { makeSelection } from '@univerjs/docs';
import { DocCanvasPopManagerService } from '@univerjs/docs-ui';
import { BehaviorSubject, Subject } from 'rxjs';
import type { IShortcutItem } from '@univerjs/ui';
import { IShortcutService, KeyCode } from '@univerjs/ui';
import { FORMULA_PROMPT_ACTIVATED } from '@univerjs/sheets-formula';
import { UniFormulaService } from '@univerjs/uni-formula';
import type { IAddDocUniFormulaCommandParams } from '../commands/command';
import { AddDocUniFormulaCommand } from '../commands/command';
import { ConfirmFormulaPopupCommand } from '../commands/operation';

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
    get popupLocked(): boolean { return this._popupLocked; }

    private readonly _popupHovered$ = new Subject<boolean>();
    readonly popupHovered$ = this._popupHovered$.asObservable();

    private _cachedFormulaString = '';

    constructor(
        @Inject(DocCanvasPopManagerService) private readonly _docCanvasPopupManagerService: DocCanvasPopManagerService,
        @Inject(UniFormulaService) private readonly _uniFormulaService: UniFormulaService,
        @IContextService private readonly _contextService: IContextService,
        @ILogService private readonly _logService: ILogService,
        @ICommandService private readonly _commandService: ICommandService,
        @IShortcutService private readonly _shortcutService: IShortcutService
    ) {
        super();

        const UniFormulaConfirmShortcut: IShortcutItem = {
            id: ConfirmFormulaPopupCommand.id,
            binding: KeyCode.ENTER,
            description: 'shortcut.doc.confirm-formula-popup',
            preconditions: (contextService) =>
                !contextService.getContextValue(FORMULA_PROMPT_ACTIVATED) && this.canConfirmPopup(),
            priority: 10000,
        };

        this.disposeWithMe(this._shortcutService.registerShortcut(UniFormulaConfirmShortcut));
    }

    override dispose(): void {
        super.dispose();

        this._popupInfo$.next(null);
        this._popupInfo$.complete();

        this._popupHovered$.complete();
    }

    cacheFormulaString(f: string): void {
        this._cachedFormulaString = f;
    }

    hoverPopup(hovered: boolean): void {
        this._popupHovered$.next(hovered);
    }

    showPopup(unitId: string, startIndex: number, type: 'new'): boolean;
    showPopup(unitId: string, startIndex: number, type: 'existing', rangeId: string): boolean;
    showPopup(unitId: string, startIndex: number, type: 'new' | 'existing', rangeId?: string): boolean;
    showPopup(unitId: string, startIndex: number, type: 'new' | 'existing', rangeId?: string): boolean {
        this.closePopup();

        const f = (rangeId && type === 'existing')
            ? this._uniFormulaService.getFormulaWithRangeId(unitId, rangeId)?.f ?? '='
            : '=';
        const disposable = this._docCanvasPopupManagerService.attachPopupToRange(makeSelection(startIndex), {
            componentKey: DOC_FORMULA_POPUP_KEY,
            onClickOutside: () => this.closePopup(), // user may update ref range selections
            direction: 'top',
        });

        this._popupInfo$.next({ unitId, disposable, type, f, startIndex });
        return true;
    }

    lockPopup(): void {
        this._popupLocked = true;
        this._contextService.setContextValue(FORMULA_EDITOR_ACTIVATED, true);
    }

    canConfirmPopup(): boolean {
        return this._cachedFormulaString !== '';
    }

    async confirmPopup(): Promise<boolean> {
        const info = this.popupInfo;
        if (!info) return true;

        const f = this._cachedFormulaString;
        if (!f) {
            this._logService.warn('[FormulaPopupService]: cannot write empty formula into the field.');
            return false;
        }

        this.unlockPopup();
        this.closePopup();

        // write this formula string to doc
        return this._commandService.executeCommand(AddDocUniFormulaCommand.id, {
            unitId: info.unitId,
            f,
            startIndex: info.startIndex,
        } as IAddDocUniFormulaCommandParams);
    }

    unlockPopup(): void {
        this._popupLocked = false;
    }

    closePopup(force = false): boolean {
        if (this._popupLocked && !force) return false;

        this._popupLocked = false;
        this._cachedFormulaString = '';

        this.popupInfo?.disposable.dispose();
        this._popupInfo$.next(null);
        this._popupHovered$.next(false);

        this._contextService.setContextValue(FORMULA_EDITOR_ACTIVATED, false);

        return true;
    }
}

