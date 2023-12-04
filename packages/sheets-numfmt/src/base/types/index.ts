import type { MutableRefObject } from 'react';

export interface IBusinessComponentProps {
    onChange: (result: string) => void;
    defaultValue: number;
    defaultPattern: string;
    action: MutableRefObject<() => string | null>;
}
