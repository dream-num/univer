/* eslint-disable @typescript-eslint/no-explicit-any */
import { Observable } from 'rxjs';

/** This protocol is for transferring data from the two peer univer instance running in different locations. */
export interface IMessageProtocol {
    send(message: any): void;
    onMessage: Observable<any>;
}
