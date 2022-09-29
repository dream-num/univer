import { BooleanNumber } from '../Enum';

/**
 * Properties of row data
 */
export interface IRowData {
    /**
     * height
     */
    h: number;
    /**
     * auto height
     */
    ah?: number;
    /**
     * hidden
     */
    hd: BooleanNumber;
}
