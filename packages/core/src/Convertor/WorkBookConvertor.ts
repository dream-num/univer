import { ConvertorBase } from './ConvertorBase';

/**
 * Data transformation methods related to workbooks
 */
export class WorkBookConvertor extends ConvertorBase {
    constructor(operation: string, attribute: string, key?: string, value?: string) {
        super(operation, 'workbook', attribute, key, value);
    }
}
