import { IKeyType, Nullable } from '../../Shared/Types';
import { LocaleType } from '../Enum';
import { IExtraModelConfig } from './IExtraModelConfig';
import { IStyleData } from './IStyleData';
import { IWorksheetConfig } from './IWorksheetData';

// TODO@wzhudev: there are some strange fields in this interface, such as `pluginMeta` and `skin`

/**
 * Properties of a workbook's configuration
 */
export interface IWorkbookConfig extends IExtraModelConfig {
    /**
     * unit id
     */
    id: string;

    /** Revision of this document. Would be used in collaborated editing. Starts with zero. */
    rev?: number;

    lastModifiedBy: string;
    appVersion: string;
    createdTime: string;
    creator: string;
    extensions: [];
    locale: LocaleType;
    modifiedTime: string;
    name: string;
    sheetOrder: string[]; // sheet id order list ['xxxx-sheet3', 'xxxx-sheet1','xxxx-sheet2']
    sheets: { [sheetId: string]: Partial<IWorksheetConfig> };
    styles: IKeyType<Nullable<IStyleData>>;
    timeZone: string;
}
