import { Workbook } from '../Domain';

export function SetZoomRatio(
    workbook: Workbook,
    sheetId: string,
    zoom: number
): number {
    const worksheet = workbook.getSheetBySheetId(sheetId);
    if (worksheet) {
        const order = worksheet.getConfig().zoomRatio;
        worksheet.getConfig().zoomRatio = zoom;
        return order;
    }
    return 1;
}
