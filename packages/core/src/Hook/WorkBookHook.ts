import { Hook } from './Hook';

export class WorkSheetHook {
    setSheetOrder = new Hook<{ sheetId: string; order: number }, boolean>();
}
