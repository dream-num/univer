/* eslint-disable no-magic-numbers */
// Useful keyboard event inspection tool https://www.toptal.com/developers/keycode

/** KeyCode that maps to browser standard keycode. */
export const enum KeyCode {
    UNKNOWN = 0,

    BACKSPACE = 8,
    TAB = 9,

    ENTER = 13,
    ESC = 27,
    SPACE = 32,

    ARROW_LEFT = 37,
    ARROW_UP = 38,
    ARROW_RIGHT = 39,
    ARROW_DOWN = 40,
    INSERT = 45,
    DELETE = 46,

    Digit0 = 48,
    Digit1,
    Digit2,
    Digit3,
    Digit4,
    Digit5,
    Digit6,
    Digit7,
    Digit8,
    Digit9,

    A = 65,
    B,
    C,
    D,
    E,
    F,
    G,
    H,
    I,
    J,
    K,
    L,
    M,
    N,
    O,
    P,
    Q,
    R,
    S,
    T,
    U,
    V,
    W,
    X,
    Y,
    Z,

    F1 = 112,
    F2 = 113,
    F3 = 114,
    F4 = 115,
    F5 = 116,
    F6 = 117,
    F7 = 118,
    F8 = 119,
    F9 = 120,
    F10 = 121,
    F11 = 122,
    F12 = 123,
    NUM_LOCK = 144,
    SCROLL_LOCK = 145,

    MINUS = 189,
    EQUAL = 187,
}

export const enum MetaKeys {
    SHIFT = 1 << 10,
    /** Option key on MacOS. Alt key on other systems. */
    ALT = 1 << 11,
    /** Command key on MacOS. Ctrl key on other systems. */
    CTRL_COMMAND = 1 << 12,
    MAC_CTRL = 1 << 13,
}
