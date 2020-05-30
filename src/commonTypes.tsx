import React from 'react';

import {ChartGroup, SingleChart} from 'Charts';
import ShellFormsContainer from 'ShellForms';
import TargetFormsContainer from 'TargetForms';
import SettingsBar from 'SettingsBar';

export interface styleT{
	formGroup?: React.CSSProperties, formLabel?: React.CSSProperties, inputGroup?: React.CSSProperties, 
	formControl?: React.CSSProperties, inputGroupAppend?: React.CSSProperties
}

export type handleValueChangeT = (value: string, id: string) => void | string;

export interface targetDataNoAngleT {
    armor: number, inclination: number, width: number
}
export interface targetAngleT {
    angles: Array<number>
}
export type targetDataT = targetDataNoAngleT & targetAngleT

export interface distanceSettingsT {
    min: number | undefined, max: number | undefined, stepSize: number | undefined
}
export interface calculationSettingsT {
    calculationMethod: number, timeStep: number, 
    launchAngle: {min: number, max: number, precision: number}
}
export interface formatSettingsT {
    rounding: number | null, shortNames: boolean, 
    colors: {saturation: number, light: number, batch: boolean}
}
export interface settingsT{
    distance: distanceSettingsT, calculationSettings: calculationSettingsT,
    format: formatSettingsT
}

export interface scatterPoint {x: number, y: number}
export interface impactData {
    ePenHN : Array<Array<scatterPoint>>, impactAHD : Array<Array<scatterPoint>>,
    ePenDN : Array<Array<scatterPoint>>, impactADD : Array<Array<scatterPoint>>,
    impactV : Array<Array<scatterPoint>>, tToTargetA : Array<Array<scatterPoint>>,
}
export interface angleData {
    armorD : Array<Array<scatterPoint>>, fuseD : Array<Array<scatterPoint>>,
    ra0D : Array<Array<scatterPoint>>, ra1D : Array<Array<scatterPoint>>,
}
export interface postData {
    shipWidth : Array<Array<scatterPoint>>, notFused : Array<Array<scatterPoint>>,
    fused : Array<Array<scatterPoint>>,
}
export interface calculatedData {
    impact: impactData, angle: angleData, post: postData, numShells: number, 
    names: Array<string>, colors: Array<Array<string>>, targets: Array<targetDataNoAngleT>, 
    angles: Array<number>
}

export type chartT = 'impact' | 'angle' | 'post';
export type chartRefT = React.RefObject<SingleChart>;

export type singleLinkT = [string, chartRefT | parameterRefT];
export type parameterRefT = React.RefObject<ShellFormsContainer 
| TargetFormsContainer | SettingsBar>;
export type linkKeyT = chartT | 'parameters';
export interface linkT {
    impact: singleLinkT[], angle: singleLinkT[], 
    post: singleLinkT[], parameters: singleLinkT[],
}
