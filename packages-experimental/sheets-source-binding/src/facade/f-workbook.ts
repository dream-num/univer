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

import type { DataBindingNodeTypeEnum, ISourceBindingInfo, SourceModelBase } from '@univerjs/sheets-source-binding';
import { SheetsSourceBindService, SheetsSourceManager } from '@univerjs/sheets-source-binding';
import { FWorkbook } from '@univerjs/sheets/facade';

export interface IFWorkbookSourceBindingMixin {
    /**
     * Create a source model with the specified type.
     * @param {DataBindingNodeTypeEnum} type The source type.
     * @param {boolean} [isListObject] Whether the source is a list object.
     * @param {string} [id] The source id.
     * @returns {SourceModelBase} The source data of sheet.
     */
    createSource(type: DataBindingNodeTypeEnum, isListObject?: boolean, id?: string | undefined): SourceModelBase;
    /**
     * Switch to path mode.In this mode, the path will show in cell.
     */
    usePathMode(): void;
    /**
     * Switch to value mode.This is the default mode. In this mode, the cell value will fulfill by source values.
     */
    useValueMode(): void;
    /**
     * Get the source model by the specified source id.
     * @param {string} sourceId The source id.
     */
    getSource(sourceId: string): SourceModelBase | undefined;
    /**
     * Set the source data by the specified source id.
     * @param {string} sourceId - The source id which you want to set data.
     * @param data - The source data. If the source is a list object, the data should be an array of objects.
     * If the isListObject is false, the data should look like below:
     * ```typescript
     * {
     *   fields: ['name', 'age'],
     *   records: [['Tom', 18], ['Jerry', 20]]
     * }
     * ```
     * If the isListObject is true, the data should look like below:
     * ```typescript
     * {
     *   fields: ['name', 'age'],
     *   records: [{name: 'Tom', age: 18}, {name: 'Jerry', age: 20}]
     * }
     * ```
     */
    setSourceData(sourceId: string, data: any): void;

    loadSourceBindingPathInfo(obj: ISourceBindingInfo): void;

    saveSourceBindingPathInfo(): ISourceBindingInfo;
}

export class FWorkbookSourceBinding extends FWorkbook implements IFWorkbookSourceBindingMixin {
    override createSource(type: DataBindingNodeTypeEnum, isListObject?: boolean, id?: string | undefined): SourceModelBase {
        const injector = this._injector;
        const sheetsSourceBindService = injector.get(SheetsSourceBindService);
        return sheetsSourceBindService.createSource(this.getId(), type, isListObject, id);
    }

    override getSource(sourceId: string): SourceModelBase | undefined {
        const injector = this._injector;
        const sheetsSourceBindService = injector.get(SheetsSourceBindService);
        return sheetsSourceBindService.getSource(this.getId(), sourceId);
    }

    override setSourceData(sourceId: string, data: any): void {
        const injector = this._injector;
        const sheetsSourceManager = injector.get(SheetsSourceManager);
        sheetsSourceManager.updateSourceData(this.getId(), sourceId, data);
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

    override loadSourceBindingPathInfo(obj: ISourceBindingInfo): void {
        const injector = this._injector;
        const sheetsSourceBindService = injector.get(SheetsSourceBindService);
        sheetsSourceBindService.loadSourceBindingPathInfo(this.getId(), obj);
    }

    override saveSourceBindingPathInfo(): ISourceBindingInfo {
        const injector = this._injector;
        const sheetsSourceBindService = injector.get(SheetsSourceBindService);
        return sheetsSourceBindService.getSourceBindingPathInfo(this.getId());
    }
}

FWorkbook.extend(FWorkbookSourceBinding);

declare module '@univerjs/sheets/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FWorkbook extends IFWorkbookSourceBindingMixin { }
}
