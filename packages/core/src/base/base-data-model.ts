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

import type { Observable } from 'rxjs';
import type { BaseSnapshot } from './typedef';
import { BehaviorSubject } from 'rxjs';
import { UnitModel, UniverInstanceType } from '../common/unit';
import { Tools } from '../shared/tools';

export class BaseDataModel extends UnitModel<BaseSnapshot, UniverInstanceType.UNIVER_BASE> {
    override readonly type: UniverInstanceType.UNIVER_BASE = UniverInstanceType.UNIVER_BASE;

    private readonly _name$: BehaviorSubject<string>;
    override readonly name$: Observable<string>;
    private _snapshot: BaseSnapshot;

    constructor(snapshot: Partial<BaseSnapshot> = {}) {
        super();

        const now = Date.now();
        this._snapshot = Tools.commonExtend({
            id: '',
            name: '',
            schemaVersion: 1,
            tables: {},
            tableOrder: [],
            createdAt: now,
            updatedAt: now,
            rev: 1,
        } as BaseSnapshot, snapshot);

        if (!this._snapshot.id) {
            this._snapshot.id = `base-${Math.random().toString(36).slice(2, 10)}`;
        }

        this._name$ = new BehaviorSubject<string>(this._snapshot.name);
        this.name$ = this._name$.asObservable();
    }

    override getUnitId(): string {
        return this._snapshot.id;
    }

    override setName(name: string): void {
        this._snapshot.name = name;
        this._snapshot.updatedAt = Date.now();
        this._name$.next(name);
    }

    override getSnapshot(): BaseSnapshot {
        return this._snapshot;
    }

    setSnapshot(snapshot: BaseSnapshot): void {
        this._snapshot = snapshot;
        this._name$.next(snapshot.name);
    }

    override getRev(): number {
        return this._snapshot.rev ?? 1;
    }

    override incrementRev(): void {
        this._snapshot.rev = this.getRev() + 1;
    }

    override setRev(rev: number): void {
        this._snapshot.rev = rev;
    }

    override dispose(): void {
        super.dispose();
        this._name$.complete();
    }
}
