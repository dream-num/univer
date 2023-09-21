import { IKeyType, IKeyValue, Nullable } from '../../Shared/Types';
import { LocaleType } from '../Enum';
import { INamedRange } from './INamedRange';
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
    namedRanges: INamedRange[];
    sheetOrder: string[]; // sheet id order list ['xxxx-sheet3', 'xxxx-sheet1','xxxx-sheet2']
    sheets: { [sheetId: string]: Partial<IWorksheetConfig> };
    styles: IKeyType<Nullable<IStyleData>>;
    timeZone: string;
}