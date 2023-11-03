import { createIdentifier, IDisposable } from '@wendellhu/redi';
import { type Subject } from 'rxjs';

import { type IDialogPartMethodOptions } from '../../views/components/dialog-part/interface';

export const IDialogService = createIdentifier<IDialogService>('univer.dialog-service');

export interface IDialogService {
    open(params: IDialogPartMethodOptions): IDisposable;

    close(id: string): void;

    getObservableDialog(): Subject<IDialogPartMethodOptions[]>;
}
