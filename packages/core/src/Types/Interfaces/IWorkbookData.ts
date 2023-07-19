import { IKeyType, IKeyValue, Nullable } from '../../Shared/Types';
import { BooleanNumber, LocaleType } from '../Enum';
import { IStyleData } from './IStyleData';
import { IWorksheetConfig } from './IWorksheetData';
import { INamedRange } from './INamedRange';

/**
 * Properties of a workbook's configuration
 */
export interface IWorkbookConfig {
    appVersion: string;
    createdTime: string;
    creator: string;
    extensions: [];
    id: string; // unit id
    lastModifiedBy: string;
    locale: LocaleType;
    modifiedTime: string;
    name: string;
    namedRanges: INamedRange[];
    pluginMeta: IKeyValue;
    sheetOrder: string[]; // sheet id order list ['xxxx-sheet3', 'xxxx-sheet1','xxxx-sheet2']
    sheets: { [sheetId: string]: Partial<IWorksheetConfig> };
    skin: string;
    socketEnable: BooleanNumber; // 协同
    socketUrl: string; // 协同
    styles: IKeyType<Nullable<IStyleData>>;
    theme: string;
    timeZone: string;
}
