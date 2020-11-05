import * as T from '../commonTypes';
export {SettingsBar} from './SettingsBar';

export interface settingsBarProps{
    settings: T.settingsT, updateColors: Function, updateCharts: Function
}