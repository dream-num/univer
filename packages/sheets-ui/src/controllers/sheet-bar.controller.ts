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

import { Disposable, IUniverInstanceService, LifecycleStages, OnLifecycle, toDisposable } from '@univerjs/core';
import { SelectionManagerService, SheetInterceptorService } from '@univerjs/sheets';
import { IDialogService } from '@univerjs/ui';
import { Inject, Injector } from '@wendellhu/redi';

import { ISheetBarService } from '../services/sheet-bar/sheet-bar.service';

@OnLifecycle(LifecycleStages.Ready, SheetBarController)
export class SheetBarController extends Disposable {
    constructor(
        @Inject(Injector) private _injector: Injector,
        @Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService,
        @Inject(SelectionManagerService) private _selectionManagerService: SelectionManagerService,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService,
        @ISheetBarService private _sheetBarService: ISheetBarService,
        @IDialogService private _dialogService: IDialogService
    ) {
        super();
        this._initialize();
    }

    private _initialize() {
        this.disposeWithMe(
            toDisposable(
                this._sheetBarService.removeId$.subscribe((id) => {
                    console.info('id===', id);
                    this._dialogService.open({
                        id,
                        children: { title: 'Dialog Content' },
                        footer: { title: 'Dialog Footer' },
                        title: { title: 'Dialog Title' },
                        draggable: false,
                        onClose: () => {
                            this._dialogService.close(id);
                        },
                        onConfirm: () => {
                            this._dialogService.close(id);
                        },
                    });
                })
            )
        );
    }
}
