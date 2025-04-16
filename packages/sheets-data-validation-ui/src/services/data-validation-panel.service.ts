/**
 * Copyright 2023-present DreamNum Co., Ltd.
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

import type { IDataValidationRule, IDisposable, Nullable } from '@univerjs/core';
import { Disposable, IUniverInstanceService, toDisposable, UniverInstanceType } from '@univerjs/core';
import { ISidebarService } from '@univerjs/ui';
import { BehaviorSubject, distinctUntilChanged, filter } from 'rxjs';
import { DATA_VALIDATION_PANEL } from '../commands/operations/data-validation.operation';

export class DataValidationPanelService extends Disposable {
    private _open$ = new BehaviorSubject<boolean>(false);
    readonly open$ = this._open$.pipe(distinctUntilChanged());

    private _activeRule: Nullable<{ unitId: string; subUnitId: string; rule: IDataValidationRule }> = undefined;
    private _activeRule$ = new BehaviorSubject<Nullable<{ unitId: string; subUnitId: string; rule: IDataValidationRule }>>(undefined);
    readonly activeRule$ = this._activeRule$.asObservable();

    get activeRule() {
        return this._activeRule;
    }

    get isOpen(): boolean {
        return this._open$.getValue();
    }

    private _closeDisposable: Nullable<IDisposable> = null;

    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @ISidebarService private readonly _sidebarService: ISidebarService
    ) {
        super();

        this.disposeWithMe(
            this._univerInstanceService.getCurrentTypeOfUnit$(UniverInstanceType.UNIVER_SHEET)
                .pipe(filter((sheet) => !sheet)).subscribe(() => {
                    this.close();
                })
        );

        this.disposeWithMe(this._sidebarService.sidebarOptions$.subscribe((info) => {
            if (info.id === DATA_VALIDATION_PANEL) {
                if (!info.visible) {
                    setTimeout(() => {
                        this._sidebarService.sidebarOptions$.next({ visible: false });
                    });
                }
            }
        }));
    }

    override dispose(): void {
        super.dispose();

        this._open$.next(false);
        this._open$.complete();
        this._activeRule$.complete();
        this._closeDisposable?.dispose();
    }

    open(): void {
        this._open$.next(true);
    }

    close(): void {
        this._open$.next(false);
        this._closeDisposable?.dispose();
    }

    setCloseDisposable(disposable: IDisposable): void {
        this._closeDisposable = toDisposable(() => {
            disposable.dispose();
            this._closeDisposable = null;
        });
    }

    setActiveRule(rule: Nullable<{ unitId: string; subUnitId: string; rule: IDataValidationRule }>): void {
        this._activeRule = rule;
        this._activeRule$.next(rule);
    }
}
