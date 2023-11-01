import { Disposable, ErrorService, LifecycleStages, OnLifecycle, toDisposable } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import { IMessageService, MessageType } from '../../services/message/message.service';

@OnLifecycle(LifecycleStages.Starting, ErrorController)
export class ErrorController extends Disposable {
    constructor(
        @Inject(ErrorService) private readonly _errorService: ErrorService,
        @IMessageService private readonly _messageService: IMessageService
    ) {
        super();

        this.disposeWithMe(
            toDisposable(
                this._errorService.error$.subscribe((error) => {
                    this._messageService.show({
                        content: error.errorKey,
                        type: MessageType.Error,
                    });
                })
            )
        );
    }
}
