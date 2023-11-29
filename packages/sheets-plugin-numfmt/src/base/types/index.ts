export type BusinessComponentProps = {
    onChange: (result: string) => void;
    defaultValue: number;
    defaultPattern: string;
};
export type NumfmtItem = {
    pattern: string;
};

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
