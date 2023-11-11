export type BusinessComponentProps = {
    onChange: (result: string) => void;
    defaultValue?: number;
    defaultPattern?: string;
};
export interface NumfmtItem {
    pattern: string;
    type: FormatType;
}

export type FormatType =
    | 'currency'
    | 'date'
    | 'datetime'
    | 'error'
    | 'fraction'
    | 'general'
    | 'grouped'
    | 'number'
    | 'percent'
    | 'scientific'
    | 'text'
    | 'time'
    | 'unknown';
