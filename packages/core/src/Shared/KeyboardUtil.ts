import { KEYBOARD_KEYS } from '../Const/KEYBOARD_KEYS';

const allKeys = Object.keys(KEYBOARD_KEYS).reduce(
    (acc, category) => [...acc, ...KEYBOARD_KEYS[category]],
    [] as string[]
);

/**
 * Reference of non-printable Keyboard Event.key values
 *
 * https://www.aarongreenlee.com/blog/list-of-non-printable-keys-for-keyboard-events-when-using-event-key/
 */
export function isKeyPrintable(key: string) {
    return allKeys.indexOf(key) === -1;
}
