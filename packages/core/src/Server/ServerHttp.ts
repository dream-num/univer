import { IActionData } from '../Command';
import { ServerBase } from './ServerBase';

/**
 * Http wrapper
 */
export class ServerHttp extends ServerBase {
    pushMessageQueue(data: IActionData[]): void {
        throw new Error('Method not implemented.');
    }
}
