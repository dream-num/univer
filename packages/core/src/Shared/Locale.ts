export interface ILanguagePack {
    [key: string]: string | ILanguagePack;
}

export interface ILocales {
    [key: string]: ILanguagePack;
}
