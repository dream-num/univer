import { IStyleSheet } from '../../services/theme/theme.service';
import { ILocales } from '../../shared/locale';
import { LocaleType } from '../enum';

export interface IUniverData {
    theme: IStyleSheet;
    locale: LocaleType;
    locales: ILocales;
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
