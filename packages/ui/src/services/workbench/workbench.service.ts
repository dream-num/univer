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

import type { ICreateUnitOptions, IDisposable, UniverInstanceType } from '@univerjs/core';
import type { Observable } from 'rxjs';
import { createIdentifier, Disposable, Inject, isInternalEditorID, IUniverInstanceService, toDisposable } from '@univerjs/core';
import { BehaviorSubject, Subscription } from 'rxjs';

export interface IWorkbenchService {
    readonly rootUnitType$: Observable<UniverInstanceType | null>;
    readonly skeletonVisible$: Observable<boolean>;

    acquireSkeleton(): IDisposable;
}

export const IWorkbenchService = createIdentifier<IWorkbenchService>('univer.ui.workbench.service');

export class WorkbenchService extends Disposable implements IWorkbenchService {
    private readonly _tokens = new Set<symbol>();
    private readonly _subscriptions = new Subscription();
    private _rootUnitId: string | null = null;
    private readonly _rootUnitType$ = new BehaviorSubject<UniverInstanceType | null>(null);
    private readonly _skeletonVisible$ = new BehaviorSubject(false);

    readonly rootUnitType$ = this._rootUnitType$.asObservable();
    readonly skeletonVisible$ = this._skeletonVisible$.asObservable();

    constructor(@Inject(IUniverInstanceService) univerInstanceService: IUniverInstanceService) {
        super();

        this._subscriptions.add(univerInstanceService.unitAdded$.subscribe(({ unit, options }) => {
            const unitId = unit.getUnitId();
            if (options?.makeCurrent === false || !isWorkbenchRootUnit(unitId, options)) {
                return;
            }

            this._setRootUnit(unitId, unit.type);
        }));

        this._subscriptions.add(univerInstanceService.focused$.subscribe((unitId) => {
            if (!unitId) {
                return;
            }

            const options = univerInstanceService.getUnitCreateOptions(unitId);
            const rootId = options?.workbenchHostUnitId ?? unitId;
            const root = univerInstanceService.getUnit(rootId);
            const rootOptions = rootId === unitId ? options : univerInstanceService.getUnitCreateOptions(rootId);
            if (root && isWorkbenchRootUnit(rootId, rootOptions ?? undefined)) {
                this._setRootUnit(rootId, root.type);
            }
        }));

        this._subscriptions.add(univerInstanceService.unitDisposed$.subscribe((unit) => {
            const unitId = unit.getUnitId();
            if (this._rootUnitId === unitId) {
                this._setRootUnit(null, null);
            }
        }));
    }

    private _setRootUnit(unitId: string | null, unitType: UniverInstanceType | null): void {
        this._rootUnitId = unitId;
        if (this._rootUnitType$.getValue() !== unitType) {
            this._rootUnitType$.next(unitType);
        }
    }

    acquireSkeleton(): IDisposable {
        const token = Symbol('workbench-skeleton');
        this._tokens.add(token);
        if (this._tokens.size === 1) {
            this._skeletonVisible$.next(true);
        }

        const disposable = toDisposable(() => {
            if (!this._tokens.delete(token) || this._tokens.size > 0) {
                return;
            }

            this._skeletonVisible$.next(false);
        });
        return this.disposeWithMe(disposable);
    }

    override dispose(): void {
        this._subscriptions.unsubscribe();
        this._tokens.clear();
        this._rootUnitId = null;
        this._rootUnitType$.complete();
        this._skeletonVisible$.complete();
        super.dispose();
    }
}

function isWorkbenchRootUnit(unitId: string, options?: ICreateUnitOptions): boolean {
    return !options?.workbenchHostUnitId && !isInternalEditorID(unitId) && !options?.skipAutoRender && !options?.embeddedRender;
}
