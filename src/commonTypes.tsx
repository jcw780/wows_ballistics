import React from 'react';

import {ChartGroup, SingleChart} from 'Charts';
import ShellFormsContainer from 'ShellForms';
import TargetFormsContainer from 'TargetForms';

export interface styleT{
	formGroup?: React.CSSProperties, formLabel?: React.CSSProperties, inputGroup?: React.CSSProperties, 
	formControl?: React.CSSProperties, inputGroupAppend?: React.CSSProperties
}

export type handleValueChangeT = (value: string, id: string) => void | string;

export interface distanceSettingsT {
    min: number | undefined, max: number | undefined, stepSize: number | undefined
}
export interface calculationSettingsT {
    calculationMethod: number, timeStep: number, 
    launchAngle: {min: number, max: number}
}
export interface formatSettingsT {
    rounding: number | null, shortNames: boolean, 
    colors: {saturation: number, light: number, batch: boolean}
}
export interface settingsT{
    distance: distanceSettingsT, calculationSettings: calculationSettingsT,
    format: formatSettingsT
}


export type chartT = 'impact' | 'angle' | 'post';
export type chartRefT = React.RefObject<SingleChart>;

export type singleLinkT = [string, chartRefT | parameterRefT];
export type parameterRefT = React.RefObject<ShellFormsContainer 
| TargetFormsContainer>;
export type linkKeyT = chartT | 'parameters';
export interface linkT {
    impact: singleLinkT[], angle: singleLinkT[], 
    post: singleLinkT[], parameters: singleLinkT[],
}
