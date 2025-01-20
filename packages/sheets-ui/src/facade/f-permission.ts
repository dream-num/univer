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

import { FPermission } from '@univerjs/sheets/facade';

export interface IFPermissionSheetsUIMixin {
    /**
     * Set visibility of unauthorized pop-up window
     * @param {boolean} visible
     * @example
     * ```ts
     * univerAPI.getPermission().setPermissionDialogVisible(false);
     * ```
     */
    setPermissionDialogVisible(visible: boolean): void;
}

export class FPermissionSheetsUIMixin extends FPermission implements IFPermissionSheetsUIMixin {
    override setPermissionDialogVisible(visible: boolean): void {
        this._permissionService.setShowComponents(visible);
    }
}

FPermission.extend(FPermissionSheetsUIMixin);
declare module '@univerjs/sheets/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FPermission extends IFPermissionSheetsUIMixin {}
}
