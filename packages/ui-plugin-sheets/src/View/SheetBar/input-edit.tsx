import { SetWorksheetNameCommand } from '@univerjs/base-sheets';
import { AppContext } from '@univerjs/base-ui';
import { useObservable } from '@univerjs/base-ui/Components/hooks/observable.js';
import { ICommandService, ICurrentUniverService, ISheetBarService } from '@univerjs/core';
import { useContext, useState } from 'react';

interface IBaseInputProps {
    sheetId: string | undefined;
    sheetName: string;
}
export function InputEdit(props: IBaseInputProps) {
    const context = useContext(AppContext);
    const sheetbarService = context.injector.get(ISheetBarService);
    const renameId = useObservable(sheetbarService.renameId$, '');
    const oldValue = props.sheetName;
    const [val, setVal] = useState(props.sheetName || '');
    const changeValue = (e: React.ChangeEvent<HTMLInputElement>) => {
        setVal(e.target.value);
    };
    const blur = () => {
        submit();
    };

    const submit = () => {
        if (val !== oldValue) {
            const commandService = context.injector.get(ICommandService);
            const currentUniverService = context.injector.get(ICurrentUniverService);
            const workbookId = currentUniverService.getCurrentUniverSheetInstance()?.getUnitId();
            commandService.executeCommand(SetWorksheetNameCommand.id, {
                worksheetId: props.sheetId,
                workbookId,
                name: val,
            });
        }

        sheetbarService.setRenameId('');
    };

    const keydown = (ev: React.KeyboardEvent<HTMLInputElement>) => {
        if (ev.key !== undefined && ev.key === 'Enter') {
            return submit();
        }
        if (ev.keyCode !== undefined && ev.keyCode === 13) {
            return submit();
        }
    };

    const isRenaming = renameId === props.sheetId;
    return isRenaming ? (
        <input type="text" value={val} autoFocus onChange={changeValue} onBlur={blur} onKeyDown={keydown} />
    ) : (
        <span>{props.sheetName}</span>
    );
}
