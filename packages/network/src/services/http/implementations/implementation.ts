/* eslint-disable @typescript-eslint/no-explicit-any */
import { createIdentifier } from '@wendellhu/redi';
import { Observable } from 'rxjs';

import { HTTPRequest } from '../request';
import { HTTPEvent } from '../response';

/**
 * HTTP service could be implemented differently on platforms.
 */
export interface IHTTPImplementation {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // There may be stream response so the return value is an observable.
    send(request: HTTPRequest): Observable<HTTPEvent<any>>;
}
export const IHTTPImplementation = createIdentifier<IHTTPImplementation>('univer-pro.network.http-implementation');
