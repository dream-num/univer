import { Workbook, Worksheet } from '../Domain';
import { IWorksheetConfig } from '../../Types/Interfaces';
import { CommandManager, CommandUnit } from '../../Command';
import { IInsertSheetActionData } from '../Action';
import { ObserverManager } from '../../Observer';
import { ICurrentUniverService } from '../../Service/Current.service';


export function InsertSheetApply(unit: CommandUnit, data: IInsertSheetActionData, commandManager: CommandManager, observerManager: ObserverManager, currentUniverService: ICurrentUniverService) {
    const worksheet = unit.WorkBookUnit!.getSheetBySheetId(data.sheetId);
    const index = data.index;
    const worksheetConfig = data.sheet;

    const iSheets = unit.WorkBookUnit!.getWorksheets();
    const config = unit.WorkBookUnit!.getConfig();
    const { sheets, sheetOrder } = config;
    if (sheets[worksheetConfig.id]) {
        throw new Error(`Insert Sheet fail ${worksheetConfig.id} is already exist`);
    }
    sheets[worksheetConfig.id] = worksheetConfig;
    sheetOrder.splice(index, 0, worksheetConfig.id);
    iSheets.set(
        worksheetConfig.id,
        new Worksheet(worksheetConfig,commandManager, observerManager, currentUniverService)
    );
    return worksheetConfig.id;
}
