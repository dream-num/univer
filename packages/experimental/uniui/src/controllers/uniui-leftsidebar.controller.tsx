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

import type { ISidebarService } from '@univerjs/ui';
import { Disposable, Inject, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { ComponentManager, ILeftSidebarService } from '@univerjs/ui';
import { distinctUntilChanged, map } from 'rxjs';
import { Outline } from '../views/outline/Outline';

const OUTLINE_COMPONENT = 'OUTLINE_COMPONENT';

export class UniuiLeftSidebarController extends Disposable {
    constructor(
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @ILeftSidebarService private readonly _leftSidebarService: ISidebarService
    ) {
        super();

        this._initComponents();
        this._initShowOutlineListener();
    }

    private _initComponents(): void {
        this.disposeWithMe(this._componentManager.register(OUTLINE_COMPONENT, Outline));
    }

    private _initShowOutlineListener(): void {
        this.disposeWithMe(this._univerInstanceService.focused$.pipe(
            map((unitId) => !unitId ? false : this._univerInstanceService.getUnit(unitId)?.type !== UniverInstanceType.UNIVER_DOC),
            distinctUntilChanged()
        ).subscribe((showOutline) => {
            if (showOutline) {
                this._leftSidebarService.open({
                    children: { label: OUTLINE_COMPONENT },
                    visible: true,
                    width: 185,
                });
            } else {
                this._leftSidebarService.close();
            }
        }));

        this.disposeWithMe(this._univerInstanceService.unitDisposed$.pipe(
            distinctUntilChanged()
        ).subscribe(() => {
            this._leftSidebarService.close();
        }));
    }
}
