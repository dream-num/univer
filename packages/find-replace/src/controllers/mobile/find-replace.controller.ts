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

import { ICommandService, Inject, Injector, IUniverInstanceService, RxDisposable } from '@univerjs/core';
import { BuiltInUIPart, connectInjector, IDialogService, IMenuManagerService, IUIPartsService } from '@univerjs/ui';
import { takeUntil } from 'rxjs';
import { ReplaceAllMatchesCommand, ReplaceCurrentMatchCommand } from '../../commands/commands/replace.command';
import {
    CloseFindDialogOperation,
    FocusSelectionOperation,
    GoToNextMatchOperation,
    GoToPreviousMatchOperation,
    OpenFindDialogOperation,
    OpenReplaceDialogOperation,
} from '../../commands/operations/find-replace.operation';
import { MOBILE_FIND_REPLACE_SETTINGS_DIALOG_ID } from '../../const';
import { mobileMenuSchema } from '../../menu/mobile-schema';
import { IFindReplaceService } from '../../services/find-replace.service';
import { MobileFindReplaceBar } from '../../views/mobile/MobileFindReplaceBar';

export class FindReplaceMobileController extends RxDisposable {
    constructor(
        @Inject(Injector) injector: Injector,
        @ICommandService commandService: ICommandService,
        @IDialogService dialogService: IDialogService,
        @IFindReplaceService findReplaceService: IFindReplaceService,
        @IMenuManagerService menuManagerService: IMenuManagerService,
        @IUniverInstanceService univerInstanceService: IUniverInstanceService,
        @IUIPartsService uiPartsService: IUIPartsService
    ) {
        super();

        [
            OpenFindDialogOperation,
            OpenReplaceDialogOperation,
            CloseFindDialogOperation,
            GoToNextMatchOperation,
            GoToPreviousMatchOperation,
            ReplaceAllMatchesCommand,
            ReplaceCurrentMatchCommand,
            FocusSelectionOperation,
        ].forEach((command) => this.disposeWithMe(commandService.registerCommand(command)));

        menuManagerService.mergeMenu(mobileMenuSchema);
        this.disposeWithMe(uiPartsService.registerComponent(
            BuiltInUIPart.FOOTER,
            () => connectInjector(MobileFindReplaceBar, injector)
        ));

        findReplaceService.stateUpdates$.pipe(takeUntil(this.dispose$)).subscribe((state) => {
            if (state.revealed === false) {
                dialogService.close(MOBILE_FIND_REPLACE_SETTINGS_DIALOG_ID);
            }
        });

        let sessionUnitId: string | null = null;
        findReplaceService.stateUpdates$.pipe(takeUntil(this.dispose$)).subscribe((state) => {
            if (state.revealed === true) {
                sessionUnitId = univerInstanceService.getFocusedUnit()?.getUnitId() ?? null;
            } else if (state.revealed === false) {
                sessionUnitId = null;
            }
        });

        univerInstanceService.focused$.pipe(takeUntil(this.dispose$)).subscribe((focused) => {
            if (sessionUnitId && focused !== sessionUnitId) {
                findReplaceService.terminate();
            }
        });
    }
}
