import { Worksheet } from '../Sheets/Domain';
import { Observable } from '../Observer';

/**
 * Worksheet Observable Data
 */
export type IWorksheetObservableData = {
    onAfterSetSelectionObservable: Observable<Worksheet>;
};
