import { ISheetActionData } from '../Command';
import { ServerBase } from './ServerBase';

/**
 * Http wrapper
 */
export class ServerHttp extends ServerBase {
    pushMessageQueue(data: ISheetActionData[]): void {
        throw new Error('Method not implemented.');
    }
}
