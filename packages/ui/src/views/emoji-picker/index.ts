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

export {
    EMOJI_CATEGORIES,
    EMOJI_RECENT_LIMIT,
    getAllEmojis,
    getDefaultRecentEmojis,
    getEmojiLocaleData,
    getLocalizedEmojiTitle,
    getRandomEmoji,
    parseStoredRecentEmojis,
    promoteRecentEmoji,
    searchEmojis,
} from './emoji-picker-utils';
export type { EmojiCategory, IEmojiItem, IEmojiLocaleData } from './emoji-picker-utils';
export { EMOJI_PICKER_COMPONENT, EmojiPicker } from './EmojiPicker';
export type { IEmojiPickerPopupProps } from './EmojiPicker';
