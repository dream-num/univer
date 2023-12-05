import type { IDisposable } from '@wendellhu/redi';
import { createIdentifier } from '@wendellhu/redi';
import { type Subject } from 'rxjs';

import { type IConfirmPartMethodOptions } from '../../views/components/confirm-part/interface';

export const IConfirmService = createIdentifier<IConfirmService>('univer.confirm-service');

export interface IConfirmService {
    readonly confirmOptions$: Subject<IConfirmPartMethodOptions[]>;

    open(params: IConfirmPartMethodOptions): IDisposable;

    confirm(params: IConfirmPartMethodOptions): Promise<boolean>;

    close(id: string): void;
}
