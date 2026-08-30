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

import { MobileActionRow } from '@univerjs/design';

interface IMobileCellLinkPopupProps {
    name: string;
    copyText: string;
    editText: string;
    removeText: string;
    invalid: boolean;
    copyPermission: boolean;
    editPermission: boolean;
    onNavigate: () => void;
    onCopy: () => void;
    onEdit: () => void;
    onRemove: () => void;
}

export function MobileCellLinkPopup(props: IMobileCellLinkPopupProps) {
    return (
        <div className="univer-flex univer-flex-col univer-gap-2">
            <MobileActionRow
                title={<span className="univer-truncate">{props.name}</span>}
                aria-label={props.name}
                variant="subtle"
                disabled={props.invalid}
                onClick={props.onNavigate}
            />
            {props.copyPermission && (
                <MobileActionRow
                    title={props.copyText}
                    aria-label={props.copyText}
                    variant="subtle"
                    disabled={props.invalid}
                    onClick={props.onCopy}
                />
            )}
            {props.editPermission && (
                <>
                    <MobileActionRow title={props.editText} aria-label={props.editText} variant="subtle" onClick={props.onEdit} />
                    <MobileActionRow title={props.removeText} aria-label={props.removeText} variant="subtle" onClick={props.onRemove} />
                </>
            )}
        </div>
    );
}
