import React from 'react';

import {SingleChart} from './Charts';
import ShellFormsContainer from './ShellForms/ShellForms';
import TargetFormsContainer from './TargetForms';
import SettingsBar from './SettingsBar/SettingsBar';
//Collapsible Titles - General
export type collapseTitlesT = [string, string]

//ParameterForm
export interface styleT{
	formGroup?: React.CSSProperties, formLabel?: React.CSSProperties, inputGroup?: React.CSSProperties, 
	formControl?: React.CSSProperties, inputGroupAppend?: React.CSSProperties
}

export type handleValueChangeT = (value: string, id: string | number) => void | string;

//DefaultForms
export interface defaultFormGeneric<T>{
    version: T, nation: T, shipType: T, 
	ship: T, artillery: T, shellType: T,
}

//Target Data
export interface targetDataNoAngleT {
    armor: number, inclination: number, width: number, 
}
export interface targetAngleT {
    angles: Array<number>, refAngles: number[], refLabels: string[]
}
export type targetDataT = targetDataNoAngleT & targetAngleT

//Site settings
export interface distanceSettingsT {
    min: number | undefined, max: number | undefined, stepSize: number | undefined
}
export interface calculationSettingsT {
    calculationMethod: number, timeStep: number, 
    launchAngle: {min: number, max: number, precision: number}
}
export interface colorSettingsT{
    hueMin: number, hueMax: number,
    chromaMin: number, chromaMax: number,
    lightMin: number, lightMax: number,
}
export interface lineSettingsT {
    showLine: boolean, pointRadius: number, pointHitRadius: number,
}
export interface formatSettingsT {
    rounding: number | null, shortNames: boolean,
    colors: colorSettingsT
}
export interface settingsT{
    distance: distanceSettingsT, calculationSettings: calculationSettingsT,
    format: formatSettingsT, line: lineSettingsT
}

//Generated / Calculated Data
export interface scatterPoint {x: number, y: number}
export type pointArrays = Array<Array<scatterPoint>>;
export interface impactData {
    rawPen : pointArrays,
    ePenHN : pointArrays, impactAHD : pointArrays,
    ePenDN : pointArrays, impactADD : pointArrays,
    impactV : pointArrays, tToTargetA : pointArrays,
}
export interface angleData {
    armorD : pointArrays, fuseD : pointArrays,
    ra0D : pointArrays, ra1D : pointArrays,
}
export interface postData {
    shipWidth : pointArrays, notFused : pointArrays,
    fused : pointArrays,
}
export interface calculatedData {
    impact: impactData, angle: angleData, post: postData, numShells: number, 
    names: Array<string>, colors: Array<Array<string>>, targets: Array<targetDataNoAngleT>, 
    angles: Array<number>, refAngles : pointArrays, refLabels : string[]
}

//Chart Types
export type chartT = 'impact' | 'angle' | 'post';
export type chartRefT = React.RefObject<SingleChart>;

//Navbar Links
export enum singleLinkIndex {name, ref}
export type singleLinkT = [string, chartRefT | parameterRefT];
export type parameterRefT = React.RefObject<ShellFormsContainer 
| TargetFormsContainer | SettingsBar>;
export type linkKeyT = chartT | 'parameters';
export interface linkT {
    impact: singleLinkT[], angle: singleLinkT[], 
    post: singleLinkT[], parameters: singleLinkT[],
}
