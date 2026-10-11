import { Platform, type TextStyle } from 'react-native';

const webOutlineReset = { outlineStyle: 'none' } as unknown as TextStyle;

export const noFocusOutline: TextStyle = Platform.OS === 'web' ? webOutlineReset : {};
