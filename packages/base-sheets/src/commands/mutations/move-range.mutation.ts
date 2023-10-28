import {
    CommandType,
    ICellData,
    IMutation,
    IUniverInstanceService,
    ObjectMatrix,
    ObjectMatrixPrimitiveType,
} from '@univerjs/core';

export interface MoveRangeMutationParams {
    workbookId: string;
    worksheetId: string;
    from: ObjectMatrixPrimitiveType<ICellData | null>;
    to: ObjectMatrixPrimitiveType<ICellData | null>;
}

export const MoveRangeMutation: IMutation<MoveRangeMutationParams, boolean> = {
    id: 'sheet.mutation.move-range',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const { from, to } = params;

        if (!from || !to) {
            return false;
        }

        const univerInstanceService = accessor.get(IUniverInstanceService);
        const workbook = univerInstanceService.getCurrentUniverSheetInstance();
        if (!workbook) {
            return false;
        }

        const worksheet = workbook.getSheetBySheetId(params.worksheetId);
        if (!worksheet) {
            return false;
        }

        const cellMatrix = worksheet.getCellMatrix();

        new ObjectMatrix<ICellData | null>(from).forValue((row, col, newVal) => {
            cellMatrix.setValue(row, col, newVal);
        });

        new ObjectMatrix<ICellData | null>(to).forValue((row, col, newVal) => {
            cellMatrix.setValue(row, col, newVal);
        });

        return true;
    },
};
