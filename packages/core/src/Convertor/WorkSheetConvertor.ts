import { ConvertorBase } from './ConvertorBase';

/**
 * Data conversion methods related to worksheets
 */
export class WorkSheetConvertor extends ConvertorBase {
    constructor(
        operation: string,
        attribute: string = '',
        key: string = '',
        value: string = ''
    ) {
        super(operation, 'worksheet', attribute, key, value);
    }
}
