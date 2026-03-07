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

import { MessageType } from '@univerjs/design';
import { describe, expect, it, vi } from 'vitest';
import { CompleteRecordingActionCommand, StartRecordingActionCommand, StopRecordingActionCommand } from './record.command';
import { ReplayLocalRecordCommand, ReplayLocalRecordOnActiveCommand, ReplayLocalRecordOnNamesakeCommand } from './replay.command';

describe('action-recorder commands', () => {
    it('should handle record commands', () => {
        const startRecording = vi.fn();
        const completeRecording = vi.fn();
        const accessor = {
            get: vi.fn(() => ({
                startRecording,
                completeRecording,
            })),
        };

        expect(StartRecordingActionCommand.handler(accessor as never, { replaceId: true })).toBe(true);
        expect(startRecording).toHaveBeenCalledWith(true);
        expect(CompleteRecordingActionCommand.handler(accessor as never)).toBe(true);
        expect(StopRecordingActionCommand.handler(accessor as never)).toBe(true);
        expect(completeRecording).toHaveBeenCalledTimes(2);
    });

    it('should handle replay commands and success message branch', async () => {
        const show = vi.fn();
        const replayLocalJSON = vi.fn()
            .mockResolvedValueOnce(true)
            .mockResolvedValueOnce(false)
            .mockResolvedValueOnce(true)
            .mockResolvedValueOnce(false)
            .mockResolvedValueOnce(true);
        const accessor = {
            get: vi.fn()
                .mockImplementationOnce(() => ({ replayLocalJSON }))
                .mockImplementationOnce(() => ({ show }))
                .mockImplementationOnce(() => ({ replayLocalJSON }))
                .mockImplementationOnce(() => ({ replayLocalJSON }))
                .mockImplementationOnce(() => ({ show }))
                .mockImplementationOnce(() => ({ replayLocalJSON }))
                .mockImplementationOnce(() => ({ show })),
        };

        await expect(ReplayLocalRecordCommand.handler(accessor as never)).resolves.toBe(true);
        await expect(ReplayLocalRecordOnNamesakeCommand.handler(accessor as never)).resolves.toBe(false);
        await expect(ReplayLocalRecordOnActiveCommand.handler(accessor as never)).resolves.toBe(true);
        await expect(ReplayLocalRecordOnActiveCommand.handler(accessor as never)).resolves.toBe(false);

        expect(replayLocalJSON).toHaveBeenCalledTimes(4);
        expect(replayLocalJSON).toHaveBeenNthCalledWith(1);
        expect(replayLocalJSON).toHaveBeenNthCalledWith(2, 'name');
        expect(replayLocalJSON).toHaveBeenNthCalledWith(3, 'active');
        expect(replayLocalJSON).toHaveBeenNthCalledWith(4, 'active');
        expect(show).toHaveBeenNthCalledWith(1, {
            type: MessageType.Success,
            content: 'Successfully replayed local records',
        });
        expect(show).toHaveBeenNthCalledWith(2, {
            type: MessageType.Success,
            content: 'Successfully replayed local records',
        });
        expect(show).toHaveBeenCalledTimes(2);
    });

    it('should cover remaining replay command branches', async () => {
        const replayFalse = vi.fn().mockResolvedValue(false);
        const showFalse = vi.fn();
        const accessorFalse = {
            get: vi.fn()
                .mockImplementationOnce(() => ({ replayLocalJSON: replayFalse })),
        };
        await expect(ReplayLocalRecordCommand.handler(accessorFalse as never)).resolves.toBe(false);
        expect(showFalse).not.toHaveBeenCalled();

        const replayTrue = vi.fn().mockResolvedValue(true);
        const showTrue = vi.fn();
        const accessorTrue = {
            get: vi.fn()
                .mockImplementationOnce(() => ({ replayLocalJSON: replayTrue }))
                .mockImplementationOnce(() => ({ show: showTrue })),
        };
        await expect(ReplayLocalRecordOnNamesakeCommand.handler(accessorTrue as never)).resolves.toBe(true);
        expect(showTrue).toHaveBeenCalledWith({
            type: MessageType.Success,
            content: 'Successfully replayed local records',
        });
    });
});
