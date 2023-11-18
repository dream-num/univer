import { IKeyType, Nullable } from '../../shared/types';
import { LocaleType } from '../enum';
import { IExtraModelData } from './i-extra-model-data';
import { IStyleData } from './i-style-data';
import { IWorksheetData } from './i-worksheet-data';

/**
 * Properties of a workbook's configuration
 */
export interface IWorkbookData extends IExtraModelData {
    /** unit id */
    id: string;
    /** Revision of this document. Would be used in collaborated editing. Starts from one. */
    rev?: number;
    name: string;
    /** Version of Univer model definition. */
    appVersion: string;
    locale: LocaleType;

    /** Style reference. */
    styles: IKeyType<Nullable<IStyleData>>;
    sheetOrder: string[]; // sheet id order list ['xxxx-sheet3', 'xxxx-sheet1','xxxx-sheet2']
    sheets: { [sheetId: string]: Partial<IWorksheetData> };

    // NOTE@wzhudev: the following properties are not related to worksheet
    // business field and should be handled by other code.

    /** @deprecated */
    creator: string;
    /** @deprecated */
    createdTime: string;
    /** @deprecated */
    modifiedTime: string;
    /** @deprecated */
    timeZone: string;
    /** @deprecated */
    lastModifiedBy: string;
}
