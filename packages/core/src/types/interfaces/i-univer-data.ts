import type { IStyleSheet } from '../../services/theme/theme.service';
import type { ILocales } from '../../shared/locale';
import type { LocaleType } from '../enum';

export interface IUniverData {
    theme: IStyleSheet;
    locale: LocaleType;
    locales: ILocales;
    enableLog: boolean;
    id: string;
}

/**
 * Toolbar Observer generic interface, convenient for plug-ins to define their own types
 */
export interface UIObserver<T = string> {
    /**
     * fontSize, fontFamily,color...
     */
    name: string;

    /**
     * fontSize:number, fontFamily:string ...
     */
    value?: T;
}
