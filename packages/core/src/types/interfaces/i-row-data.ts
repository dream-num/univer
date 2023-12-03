import type { BooleanNumber } from '../enum';

/**
 * Properties of row data
 */
export interface IRowData {
    /**
     * height in pixel
     */
    h: number;
    /**
     * is current row self-adaptive to its content, use `ah` to set row height when true, else use `h`.
     */
    isAutoHeight?: boolean;
    /**
     * auto height
     */
    ah?: number;
    /**
     * hidden
     */
    hd: BooleanNumber;
}
