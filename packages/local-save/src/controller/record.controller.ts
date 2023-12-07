import { CommandType, ICommandService } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

export class RecordController {
    constructor(@Inject(ICommandService) private _commandService: ICommandService) {}

    record() {
        return new Promise<Blob>((resolve) => {
            navigator.mediaDevices.getDisplayMedia({ video: true }).then((stream) => {
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
                    resolve(blob);
                });

                mediaRecorder.start();
            });
        });
    }

    startSaveCommands() {
        type TimeString = string & {};
        type CommandString = string & {};
        type TypeString = string & {};
        type ParamsString = string & {};
        const result: Array<[TimeString, CommandString, TypeString, ParamsString]> = [];

        const disposable = this._commandService.onCommandExecuted((commandInfo) => {
            new Date().toDateString();
            result.push([
                String(Number(new Date())),
                commandInfo.id,
                String(commandInfo.type || CommandType.COMMAND),
                JSON.stringify(commandInfo.params || ''),
            ]);
        });
        return () => {
            disposable.dispose();
            return result;
        };
    }
}
