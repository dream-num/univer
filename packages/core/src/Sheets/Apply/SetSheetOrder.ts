import { Workbook1 } from '../Domain';

export function SetSheetOrder(
    workbook: Workbook1,
    sheetId: string,
    order: number
): number {
    const config = workbook.getConfig();
    const oldIndex = config.sheetOrder.findIndex((current) => current === sheetId);
    const exclude = config.sheetOrder.filter((currentId) => currentId !== sheetId);
    exclude.splice(order, 0, sheetId);
    config.sheetOrder = exclude;
    return oldIndex;
}
