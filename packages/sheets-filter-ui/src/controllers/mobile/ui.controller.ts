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

import type { Dependency } from '@univerjs/core';
import { ICommandService, Inject, Injector, LocaleService, RxDisposable, UniverInstanceType } from '@univerjs/core';
import { MessageType } from '@univerjs/design';
import { IRenderManagerService } from '@univerjs/engine-render';
import {
    ReCalcSheetsFilterMutation,
    RemoveSheetsFilterMutation,
    SetSheetsFilterCriteriaMutation,
    SetSheetsFilterRangeMutation,
    SheetsFilterService,
} from '@univerjs/sheets-filter';
import { SheetsRenderService } from '@univerjs/sheets-ui';
import { BuiltInUIPart, connectInjector, IMessageService, IUIPartsService } from '@univerjs/ui';
import {
    ChangeFilterByOperation,
    CloseFilterPanelOperation,
    OpenFilterPanelOperation,
} from '../../commands/operations/sheets-filter.operation';
import { MobileSheetsFilterPanel } from '../../views/mobile/MobileSheetsFilterPanel';
import { SheetsFilterRenderController } from '../../views/render-modules/sheets-filter.render-controller';

export class SheetsFilterUIMobileController extends RxDisposable {
    constructor(
        @Inject(Injector) injector: Injector,
        @ICommandService commandService: ICommandService,
        @Inject(LocaleService) localeService: LocaleService,
        @Inject(SheetsFilterService) sheetsFilterService: SheetsFilterService,
        @IMessageService messageService: IMessageService,
        @IUIPartsService uiPartsService: IUIPartsService,
        @IRenderManagerService renderManagerService: IRenderManagerService,
        @Inject(SheetsRenderService) sheetsRenderService: SheetsRenderService
    ) {
        super();

        [
            ChangeFilterByOperation,
            OpenFilterPanelOperation,
            CloseFilterPanelOperation,
        ].forEach((command) => {
            this.disposeWithMe(commandService.registerCommand(command));
        });

        [
            SetSheetsFilterRangeMutation,
            SetSheetsFilterCriteriaMutation,
            RemoveSheetsFilterMutation,
            ReCalcSheetsFilterMutation,
        ].forEach((mutation) => {
            this.disposeWithMe(sheetsRenderService.registerSkeletonChangingMutations(mutation.id));
        });

        this.disposeWithMe(renderManagerService.registerRenderModule(
            UniverInstanceType.UNIVER_SHEET,
            [SheetsFilterRenderController] as Dependency
        ));
        this.disposeWithMe(uiPartsService.registerComponent(
            BuiltInUIPart.GLOBAL,
            () => connectInjector(MobileSheetsFilterPanel, injector)
        ));
        this.disposeWithMe(sheetsFilterService.errorMsg$.subscribe((content) => {
            if (content) {
                messageService.show({
                    type: MessageType.Error,
                    content: localeService.t(content),
                });
            }
        }));
    }
}
