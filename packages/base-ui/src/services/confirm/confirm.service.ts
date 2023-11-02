import { createIdentifier, IDisposable } from '@wendellhu/redi';
import { type Subject } from 'rxjs';

import { type IConfirmPartMethodOptions } from '../../views/components/confirm-part/interface';

export const IConfirmService = createIdentifier<IConfirmService>('univer.confirm-service');

export interface IConfirmService {
    open(params: IConfirmPartMethodOptions): IDisposable;

    close(): void;

    getObservableConfirm(): Subject<IConfirmPartMethodOptions>;
}
