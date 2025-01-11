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

import type { DataBindingNodeTypeEnum, SourceModelBase } from '@univerjs/sheets-source-binding';
import { SheetsSourceBindService } from '@univerjs/sheets-source-binding';
import { FWorkbook } from '@univerjs/sheets/facade';

export interface IFWorkbookSourceBindingMixin {
    createSource(type: DataBindingNodeTypeEnum): SourceModelBase;
    usePathMode(): void;
    useValueMode(): void;
}

export class FWorkbookSourceBinding extends FWorkbook implements IFWorkbookSourceBindingMixin {
    override createSource(type: DataBindingNodeTypeEnum): SourceModelBase {
        const injector = this._injector;
        const sheetsSourceBindService = injector.get(SheetsSourceBindService);
        return sheetsSourceBindService.createSource(this.getId(), type);
    }

    override usePathMode(): void {
        const injector = this._injector;
        const sheetsSourceBindService = injector.get(SheetsSourceBindService);
        sheetsSourceBindService.usePathMode();
    }

    override useValueMode(): void {
        const injector = this._injector;
        const sheetsSourceBindService = injector.get(SheetsSourceBindService);
        sheetsSourceBindService.useValueMode();
    }
}

FWorkbook.extend(FWorkbookSourceBinding);

declare module '@univerjs/sheets/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FWorkbook extends IFWorkbookSourceBindingMixin { }
}
