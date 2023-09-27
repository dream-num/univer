export interface ILanguagePack {
    [key: string]: string | Array<{ name: string; value: string }> | ILanguagePack;
}

export interface ILocales {
    [key: string]: ILanguagePack;
}
