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

import { Disposable, ErrorService, Inject, IPermissionService, LocaleService } from '@univerjs/core';
import { MessageType } from '@univerjs/design';
import { IMessageService } from '../../services/message/message.service';

const PERMISSION_MESSAGE_ID = 'ui.permission-denied';
const PERMISSION_MESSAGE_DURATION = 3000;

export class ErrorController extends Disposable {
    private _lastPermissionAttempt = Number.NEGATIVE_INFINITY;
    private _lastPermissionTarget: string | undefined;

    constructor(
        @Inject(ErrorService) private readonly _errorService: ErrorService,
        @IMessageService private readonly _messageService: IMessageService,
        @IPermissionService private readonly _permissionService: IPermissionService,
        @Inject(LocaleService) private readonly _localeService: LocaleService
    ) {
        super();

        this.disposeWithMe(this._errorService.error$.subscribe((error) => {
            if (error.code === 'PERMISSION_DENIED') {
                if (!this._permissionService.getShowComponents()) {
                    return;
                }
                const now = Date.now();
                const repeated = error.permissionTarget === this._lastPermissionTarget
                    && now - this._lastPermissionAttempt < PERMISSION_MESSAGE_DURATION;
                this._lastPermissionAttempt = now;
                this._lastPermissionTarget = error.permissionTarget;
                if (!repeated) {
                    this._messageService.show({
                        id: PERMISSION_MESSAGE_ID,
                        content: this._localeService.t('ui.objectPermission.operationDenied'),
                        type: MessageType.Warning,
                        duration: PERMISSION_MESSAGE_DURATION,
                    });
                }
                return;
            }
            this._messageService.show({
                content: error.errorKey,
                type: MessageType.Error,
            });
        }));
    }

    override dispose(): void {
        this._messageService.remove(PERMISSION_MESSAGE_ID);
        super.dispose();
    }
}
