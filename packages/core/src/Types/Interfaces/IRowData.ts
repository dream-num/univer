import { BooleanNumber } from '../Enum';

/**
 * Properties of row data
 */
export interface IRowData {
    /**
     * height in pixel
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
