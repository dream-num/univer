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

import { Disposable, ErrorService, Inject } from '@univerjs/core';
import { MessageType } from '@univerjs/design';

import { IMessageService } from '../../services/message/message.service';

export class ErrorController extends Disposable {
    constructor(
        @Inject(ErrorService) private readonly _errorService: ErrorService,
        @IMessageService private readonly _messageService: IMessageService
    ) {
        super();

        this.disposeWithMe(this._errorService.error$.subscribe((error) => {
            this._messageService.show({
                content: error.errorKey,
                type: MessageType.Error,
            });
        }));
    }
}
