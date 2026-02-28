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

import { CommandType, ICommandService, Inject } from '@univerjs/core';
import { Observable } from 'rxjs';

export class RecordController {
    constructor(@Inject(ICommandService) private _commandService: ICommandService) {
        // empty
    }

    record() {
        return new Observable<{ type: 'start' } | { type: 'finish'; data: Blob }>((subscribe) => {
            navigator.mediaDevices.getDisplayMedia({ video: true }).then((stream) => {
                subscribe.next({ type: 'start' });
                const mime = MediaRecorder.isTypeSupported('video/webm; codecs=vp9')
                    ? 'video/webm; codecs=vp9'
                    : 'video/webm';
                const mediaRecorder = new MediaRecorder(stream, { mimeType: mime });

                const chunks: Blob[] = [];
                mediaRecorder.addEventListener('dataavailable', function (e) {
                    chunks.push(e.data);
                });

                mediaRecorder.addEventListener('stop', function () {
                    const blob = new Blob(chunks, { type: chunks[0].type });
                    subscribe.next({ type: 'finish', data: blob });
                    subscribe.complete();
                });

                mediaRecorder.start();
            });
        });
    }

    startSaveCommands() {
        type SecondsString = string & {};
        type CommandString = string & {};
        type TypeString = string & {};
        type ParamsString = string & {};
        const result: Array<[SecondsString, CommandString, TypeString, ParamsString]> = [];
        const startTime = performance.now();
        const disposable = this._commandService.beforeCommandExecuted((commandInfo) => {
            try {
                result.push([
                    String((performance.now() - startTime) / 1000),
                    commandInfo.id,
                    String(commandInfo.type || CommandType.COMMAND),
                    JSON.stringify(commandInfo.params || ''),
                ]);
            } catch (err) {
                console.error(`${commandInfo.id}  unable to serialize`);
                console.error(err);
            }
        });
        return () => {
            disposable.dispose();
            return result;
        };
    }
}
