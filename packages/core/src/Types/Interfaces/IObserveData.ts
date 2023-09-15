import { Observable } from '../../Observer';
import { Worksheet } from '../../Sheets/Domain';

/**
 * Worksheet Observable Data
 */
export type IWorksheetObservableData = {
    onAfterSetSelectionObservable: Observable<Worksheet>;
};
