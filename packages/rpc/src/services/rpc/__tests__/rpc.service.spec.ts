/* eslint-disable no-magic-numbers */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Observable, of, Subject } from 'rxjs';
import { beforeEach, describe, expect, it } from 'vitest';

import { ChannelClient, ChannelServer, fromModule, IMessageProtocol, toModule } from '../rpc.service';

describe('Test ChannelClient & ChannelServer', () => {
    let clientProtocol: TestMessageProtocolForClient;
    let serverProtocol: TestMessageProtocolForServer;

    let client: ChannelClient;
    let server: ChannelServer;

    class TestMessageProtocolForClient implements IMessageProtocol {
        private readonly _message$ = new Subject<any>();
        onMessage = this._message$.asObservable();

        send(message: any): void {
            serverProtocol.mockSendMessage(message);
        }

        mockSendMessage(message: any): void {
            this._message$.next(message);
        }
    }

    class TestMessageProtocolForServer implements IMessageProtocol {
        private readonly _message$ = new Subject<any>();
        onMessage = this._message$.asObservable();

        send(message: any): void {
            clientProtocol.mockSendMessage(message);
        }

        mockSendMessage(message: any): void {
            this._message$.next(message);
        }
    }

    beforeEach(() => {
        clientProtocol = new TestMessageProtocolForClient();
        serverProtocol = new TestMessageProtocolForServer();

        client = new ChannelClient(clientProtocol);
        server = new ChannelServer(serverProtocol);
    });

    describe('Test fromService and toService', async () => {
        it('Should remote call work', async () => {
            interface INameService {
                getName(): Promise<string>;
                getCount$(): Observable<number>;
            }

            const clientService = toModule<INameService>(client.getChannel('test'));
            server.registerChannel(
                'test',
                fromModule({
                    async getName(): Promise<string> {
                        return 'service';
                    },
                    getCount$(): Observable<number> {
                        return of(1, 2, 3);
                    },
                } as INameService)
            );

            const name = await clientService.getName();
            expect(name).toBe('service');

            // Should not emit any value when the returned observable is not subscribe.
            const values: number[] = [];
            const observable = clientService.getCount$();
            await timer(300);
            expect(values).toEqual([]);

            // Should send request only after the observable is subscribed.
            const subscription = observable.subscribe((value) => values.push(value));
            await timer(300);
            expect(values).toEqual([1, 2, 3]);
            expect(subscription.closed).toBe(true);
        });
    });
});

function timer(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
