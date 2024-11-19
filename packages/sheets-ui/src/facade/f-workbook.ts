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

import type { IHoverRichTextInfo, IHoverRichTextPosition } from '../services/hover-manager.service';
import { type IDisposable, ILogService, toDisposable } from '@univerjs/core';
import { FWorkbook } from '@univerjs/sheets/facade';
import { HoverManagerService } from '@univerjs/sheets-ui';
import { type IDialogPartMethodOptions, IDialogService, type ISidebarMethodOptions, ISidebarService } from '@univerjs/ui';
import { filter } from 'rxjs';

interface IFWorkbookSheetsUIMixin {
    /**
     * Open a sidebar.
     *
     * @deprecated
     *
     * @param params the sidebar options
     * @returns the disposable object
     */
    openSiderbar(params: ISidebarMethodOptions): IDisposable;

    /**
     * Open a dialog.
     *
     * @deprecated
     *
     * @param dialog the dialog options
     * @returns the disposable object
     */
    openDialog(dialog: IDialogPartMethodOptions): IDisposable;

    /**
     * Subscribe to cell click events
     *
     * @param callback - The callback function to be called when a cell is clicked
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    onCellClick(callback: (cell: IHoverRichTextInfo) => void): IDisposable;

    /**
     * Subscribe cell hover events
     *
     * @param callback - The callback function to be called when a cell is hovered
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    onCellHover(callback: (cell: IHoverRichTextPosition) => void): IDisposable;
}

class FWorokbookSheetsUIMixin extends FWorkbook implements IFWorkbookSheetsUIMixin {
    override openSiderbar(params: ISidebarMethodOptions): IDisposable {
        this._logDeprecation('openSiderbar');

        const sideBarService = this._injector.get(ISidebarService);
        return sideBarService.open(params);
    }

    override openDialog(dialog: IDialogPartMethodOptions): IDisposable {
        this._logDeprecation('openDialog');

        const dialogService = this._injector.get(IDialogService);
        const disposable = dialogService.open({
            ...dialog,
            onClose: () => {
                disposable.dispose();
            },
        });

        return disposable;
    }

    private _logDeprecation(name: string): void {
        const logService = this._injector.get(ILogService);

        logService.warn('[FWorkbook]', `${name} is deprecated. Please use the function of the same name on "FUniver".`);
    }

    override onCellClick(callback: (cell: IHoverRichTextInfo) => void): IDisposable {
        const hoverManagerService = this._injector.get(HoverManagerService);
        return toDisposable(
            hoverManagerService.currentClickedCell$
                .pipe(filter((cell) => !!cell))
                .subscribe(callback)
        );
    }

    override onCellHover(callback: (cell: IHoverRichTextPosition) => void): IDisposable {
        const hoverManagerService = this._injector.get(HoverManagerService);
        return toDisposable(
            hoverManagerService.currentRichText$
                .pipe(filter((cell) => !!cell))
                .subscribe(callback)
        );
    }
}

FWorkbook.extend(FWorokbookSheetsUIMixin);
declare module '@univerjs/sheets/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FWorkbook extends IFWorkbookSheetsUIMixin {}
}

