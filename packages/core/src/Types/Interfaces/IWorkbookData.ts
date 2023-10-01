import { IKeyType, Nullable } from '../../Shared/Types';
import { LocaleType } from '../Enum';
import { IStyleData } from './IStyleData';
import { IWorksheetConfig } from './IWorksheetData';

// TODO@wzhudev: there are some strange fields in this interface, such as `pluginMeta` and `skin`

/**
 * Properties of a workbook's configuration
 */
export interface IWorkbookConfig {
    appVersion: string;
    createdTime: string;
    creator: string;
    extensions: [];
    /**
     * unit id
     */
    id: string;
    lastModifiedBy: string;
    locale: LocaleType;
    modifiedTime: string;
    name: string;
    sheetOrder: string[]; // sheet id order list ['xxxx-sheet3', 'xxxx-sheet1','xxxx-sheet2']
    sheets: { [sheetId: string]: Partial<IWorksheetConfig> };
    namedRanges: any[];
    styles: IKeyType<Nullable<IStyleData>>;
    timeZone: string;
}
