import { Worksheet } from '../Domain/Worksheet';
import { BooleanNumber } from '../../Types/Enum';
import { ISheetStatus } from '../Action';
import { ICurrentUniverService } from '../../Service/Current.service';

/**
 *
 * @param worksheet
 * @param status
 * @returns
 *
 * @internal
 */
export function SetWorkSheetActivate(
    worksheet: Worksheet,
    status: BooleanNumber,
    currentUniverService: ICurrentUniverService
): ISheetStatus {
    // store old status

    const oldSheet = currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet();
    let oldSheetId = '';
    const oldStatus = BooleanNumber.FALSE;
    if (oldSheet) {
        oldSheetId = oldSheet.getSheetId();
        // oldSheet.getStatus();
    }

    const sheets = currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getSheets();
    const currentSheetId = worksheet.getSheetId();

    sheets.forEach((sheet) => {
        const sheetId = sheet.getSheetId();
        if (sheetId === currentSheetId) {
            // set new status
            // sheet.setStatus(status);
            sheet.getConfig().status = BooleanNumber.TRUE;
        } else {
            // reset status
            // sheet.setStatus(BooleanNumber.FALSE);
            sheet.getConfig().status = BooleanNumber.FALSE;
        }
    });

    // return old status to undo
    return { oldSheetId, status: oldStatus };
}
