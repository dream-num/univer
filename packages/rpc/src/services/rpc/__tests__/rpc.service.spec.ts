/* eslint-disable @typescript-eslint/no-explicit-any */
import { Subject } from 'rxjs';
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

    describe('Test fromService and toService', () => {
        it('Should remote call work', async () => {
            interface INameService {
                getName(): Promise<string>;
            }

            const clientService = toModule<INameService>(client.getChannel('test'));
            server.registerChannel(
                'test',
                fromModule({
                    async getName(): Promise<string> {
                        return 'service';
                    },
                } as INameService)
            );

            const name = await clientService.getName();
            expect(name).toBe('service');
        });
    });
});
