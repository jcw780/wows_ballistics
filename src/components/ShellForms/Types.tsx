import * as T from '../commonTypes';
import {ParameterForm} from '../UtilityComponents';

export enum labelI {name, unit, ref, description}
export type labelT = [string, string,React.RefObject<ParameterForm>, string | JSX.Element];
export interface formTemplate<K>{
	caliber: K, muzzleVelocity: K, dragCoefficient: K, mass: K,
	krupp: K, fusetime: K, threshold: K, normalization: K, 
	ra0: K, ra1: K, HESAP: K, 
}

export interface dispersionTemplate<K>{
	delim: K, idealRadius: K, minRadius: K, idealDistance: K, radiusOnDelim: K, 
	radiusOnMax: K, radiusOnZero: K, maxDist: K, sigmaCount: K, taperDist: K,
}

export interface modifierTemplates<K>{
	GMIdealRadius: K, maxDistCoef: K
}

export type formLabelsT = formTemplate<labelT>;
export type dispersionLabelsT = dispersionTemplate<labelT>;
export type modifierLabelsT = modifierTemplates<labelT>;
export type formsT = keyof formLabelsT;

export interface formDataT extends formTemplate<number>, dispersionTemplate<number>, modifierTemplates<number>{
	name: string, colors: string[]
}

export interface defaultFormGeneric<T>{
    version: T, nation: T, shipType: T, 
	ship: T, artillery: T, shellType: T,
}

export enum DefaultDataRowI {value, options, values}
export type DefaultDataRowT = [string, string[], string[]]
interface queriedDataT {
	queriedData: Record<string, Record<string, any>>
}
interface upgradeDataT {
	upgrades: Record<string, [string, string, any][]>, values: Record<string, number>,
	components: Record<string, string[]>
}
export type defaultDataT = defaultFormGeneric<DefaultDataRowT> & queriedDataT & upgradeDataT