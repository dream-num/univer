import { SetWorksheetNameCommand } from '@univerjs/base-sheets';
// import { useObservable } from '@univerjs/base-ui';
import { ICommandService, IUniverInstanceService } from '@univerjs/core';
import { useDependency } from '@wendellhu/redi/react-bindings';
import { useEffect, useRef, useState } from 'react';

import { ISheetBarService } from '../../../services/sheetbar/sheetbar.service';

interface IBaseInputProps {
    sheetId: string | undefined;
    sheetName: string;
}
export const InputEdit: React.FC<IBaseInputProps> = (props) => {
    const spanRef = useRef<HTMLSpanElement>(null);
    const [editable, setEditable] = useState(false);
    const sheetbarService = useDependency(ISheetBarService);
    const commandService = useDependency(ICommandService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    // const renameId = useObservable(sheetbarService.renameId$, '');
    const oldValue = props.sheetName;
    const [val, setVal] = useState(props.sheetName || '');

    useEffect(() => {
        sheetbarService.renameId$.subscribe((renameId) => {
            if (renameId === props.sheetId) {
                setEditable(true);

                setTimeout(() => {
                    if (!spanRef?.current) return;
                    spanRef.current.focus();

                    const selection = window.getSelection();
                    if (!selection) return;

                    const range = document.createRange();
                    range.selectNodeContents(spanRef.current);

                    selection.removeAllRanges();
                    selection.addRange(range);
                }, 1);

                console.info(spanRef.current, renameId);
            }
        });
    }, []);
    const changeValue = (e: React.ChangeEvent<HTMLInputElement>) => {
        setVal(e.target.value);
    };
    const blur = () => {
        submit();
    };

    const submit = () => {
        if (val !== oldValue) {
            const workbookId = univerInstanceService.getCurrentUniverSheetInstance()?.getUnitId();
            commandService.executeCommand(SetWorksheetNameCommand.id, {
                worksheetId: props.sheetId,
                workbookId,
                name: val,
            });
        }

        // sheetbarService.setRenameId('');
        setEditable(false);
    };

    const keydown = (ev: React.KeyboardEvent<HTMLInputElement>) => {
        if (ev.key !== undefined && ev.key === 'Enter') {
            return submit();
        }
        if (ev.keyCode !== undefined && ev.keyCode === 13) {
            return submit();
        }

        // Support left and right keys, choose all, delete
        if (ev.key !== undefined && ['ArrowLeft', 'ArrowRight', 'Delete', 'Backspace'].includes(ev.key)) {
            ev.stopPropagation();
        }

        // The interception content cannot exceed 50 characters
        if (val.length >= 50) {
            ev.preventDefault();
        }
    };

    return (
        <span
            ref={spanRef}
            contentEditable={editable}
            suppressContentEditableWarning={true}
            draggable={false}
            onMouseDown={(e) => {
                e.stopPropagation();
            }}
            autoFocus
            onChange={changeValue}
            onBlur={blur}
            onKeyDown={keydown}
            onClick={(e) => {
                e.stopPropagation();
            }}
        >
            {val}
        </span>
    );
};
