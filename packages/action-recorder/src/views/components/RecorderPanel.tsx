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

import { ICommandService } from '@univerjs/core';
import { Button } from '@univerjs/design';
import { RecordSingle } from '@univerjs/icons';
import { useDependency, useObservable } from '@univerjs/ui';
import { useCallback } from 'react';
import { CompleteRecordingActionCommand, StartRecordingActionCommand, StopRecordingActionCommand } from '../../commands/commands/record.command';
import { CloseRecordPanelOperation } from '../../commands/operations/operation';
import { ActionRecorderService } from '../../services/action-recorder.service';

export function RecorderPanel() {
    const s = useDependency(ActionRecorderService);
    const opened = useObservable(s.panelOpened$);

    if (!opened) return null;
    return <RecordPanelImpl />;
}

function RecordPanelImpl() {
    const commandService = useDependency(ICommandService);
    const actionRecorderService = useDependency(ActionRecorderService);

    const recording = useObservable(actionRecorderService.recording$);
    const recordedCommands = useObservable(actionRecorderService.recordedCommands$);
    const len = recordedCommands?.length ?? 0;

    const closePanel = useCallback(() => {
        if (!recording) commandService.executeCommand(CloseRecordPanelOperation.id);
    }, [commandService, recording]);

    const startRecording = useCallback((replaceId?: boolean) => {
        if (!recording) commandService.executeCommand(StartRecordingActionCommand.id, { replaceId });
    }, [commandService, recording]);

    const completeRecording = useCallback(() => {
        if (recording) commandService.executeCommand(CompleteRecordingActionCommand.id);
    }, [commandService, recording]);

    const stopRecording = useCallback(() => {
        if (recording) commandService.executeCommand(StopRecordingActionCommand.id);
    }, [commandService, recording]);

    const titleText = recording
        ? len === 0 ? 'Recording...' : (`${len}: ${recordedCommands![len - 1].id}`)
        : 'Start Recording';

    return (
        <div
            className={`
              univer-fixed univer-bottom-20 univer-left-1/2 univer-z-[1000] univer-flex univer-h-16 univer-w-[512px]
              -univer-translate-x-1/2 univer-items-center univer-rounded-lg univer-bg-white univer-px-5 univer-shadow-lg
            `}
        >
            <div className="univer-mr-2 univer-size-5 univer-shrink-0 univer-grow-0 univer-text-xl">
                <RecordSingle />
            </div>
            <div className="univer-flex-1 univer-text-sm">{titleText}</div>
            <div className="univer-flex univer-w-64 univer-shrink-0 univer-grow-0 univer-justify-between">
                <Button
                    className="univer-w-20"
                    onClick={recording ? stopRecording : closePanel}
                >
                    { recording ? 'Cancel' : 'Close' }
                </Button>
                <Button
                    className="univer-w-20"
                    variant="primary"
                    onClick={recording ? completeRecording : () => startRecording()}
                >
                    { recording ? 'Save' : 'Start' }
                </Button>
                { !recording && <Button variant="primary" onClick={() => startRecording(true)}>Start(N)</Button>}
            </div>
        </div>
    );
}
