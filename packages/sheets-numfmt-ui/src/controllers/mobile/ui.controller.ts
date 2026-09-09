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

import type { Workbook } from '@univerjs/core';
import type { ISetNumfmtMutationParams } from '@univerjs/sheets';
import { Disposable, ICommandService, Inject, IUniverInstanceService, LocaleService, UniverInstanceType } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { RemoveNumfmtMutation, SetNumfmtMutation } from '@univerjs/sheets';
import { SheetsNumfmtCellContentController } from '@univerjs/sheets-numfmt';
import { SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import { merge, Observable } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { SetMobileNumfmtCommand } from '../../commands/commands/set-mobile-numfmt.command';

export class SheetNumfmtMobileUIController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @Inject(SheetsNumfmtCellContentController)
        private readonly _sheetsNumfmtCellContentController: SheetsNumfmtCellContentController
    ) {
        super();

        this.disposeWithMe(this._commandService.registerCommand(SetMobileNumfmtCommand));
        this._initNumfmtLocalChange();
        this._initCommandExecutedListener();
    }

    private _initNumfmtLocalChange(): void {
        this.disposeWithMe(
            merge(
                this._sheetsNumfmtCellContentController.locale$,
                this._localeService.currentLocale$
            ).subscribe(() => this._forceUpdate())
        );
    }

    private _initCommandExecutedListener(): void {
        const commandList = [RemoveNumfmtMutation.id, SetNumfmtMutation.id];
        this.disposeWithMe(
            new Observable<string>((subscribe) => {
                const disposable = this._commandService.onCommandExecuted((command) => {
                    if (commandList.includes(command.id)) {
                        const params = command.params as ISetNumfmtMutationParams;
                        subscribe.next(params.unitId);
                    }
                });
                return () => disposable.dispose();
            }).pipe(debounceTime(16)).subscribe((unitId) => this._forceUpdate(unitId))
        );
    }

    private _forceUpdate(unitId?: string): void {
        const resolvedUnitId = unitId ?? this._univerInstanceService
            .getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)
            ?.getUnitId();
        if (!resolvedUnitId) {
            return;
        }

        const renderUnit = this._renderManagerService.getRenderUnitById(resolvedUnitId);
        renderUnit?.with(SheetSkeletonManagerService).reCalculate();
        renderUnit?.mainComponent?.makeDirty();
    }
}
