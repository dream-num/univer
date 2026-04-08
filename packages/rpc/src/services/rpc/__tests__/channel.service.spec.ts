/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { IMessageProtocol } from '../rpc.service';
import { Observable, Subject } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { ChannelService } from '../channel.service';
import { fromModule } from '../rpc.service';

function flushPromises() {
    return new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 0);
    });
}

describe('ChannelService', () => {
    it('should register channel, request channel, and dispose', async () => {
        const message$ = new Subject<unknown>();
        const protocol: IMessageProtocol = {
            send(message: unknown): void {
                message$.next(message);
            },
            onMessage: message$.asObservable(),
        };

        const service = new ChannelService(protocol);

        service.registerChannel('math', fromModule({
            add(a: number, b: number) {
                return a + b;
            },
            values$() {
                return new Observable<number>((subscriber) => {
                    subscriber.next(1);
                    subscriber.complete();
                });
            },
        }));

        const channel = service.requestChannel('math');
        await expect(channel.call<number>('add', [2, 3])).resolves.toBe(5);

        const values: number[] = [];
        channel.subscribe<number>('values$').subscribe((value) => values.push(value));
        await flushPromises();
        expect(values).toEqual([1]);

        service.dispose();
    });
});
