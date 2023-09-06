import { CommandType, ICommand } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { UploadService } from '../services/upload.service';

export const UploadCommand: ICommand = {
    id: 'image.command.upload',
    type: CommandType.OPERATION,
    handler: async (accessor: IAccessor) => {
        const uploadService = accessor.get(UploadService);
        uploadService.upload();
        return true;
    },
};
