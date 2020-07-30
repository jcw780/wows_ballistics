import * as T from '../commonTypes';
import {ParameterForm} from '../UtilityComponents';

export enum labelI {name, unit, ref, description}
export type labelT = [string, string,React.RefObject<ParameterForm>, string | JSX.Element];
export interface formTemplate<K>{
	caliber: K, muzzleVelocity: K, dragCoefficient: K, mass: K,
	krupp: K, fusetime: K, threshold: K, normalization: K, 
	ra0: K, ra1: K, HESAP: K, 
	delim?: K, idealRadius?: K, minRadius?: K, radiusOnDelim?: K, 
	radiusOnMax?: K, radiusOnZero?: K, sigmaCount?: K, taperDist?: K,

}
export type formLabelsT = formTemplate<labelT>;
export type formsT = keyof(formLabelsT);

export interface formDataT extends formTemplate<number>{name: string, colors: string[]}

export enum DefaultDataRowI {value, options, values}
export type DefaultDataRowT = [string, string[], string[]]
interface queriedDataT {queriedData: Record<string, Record<string, any>>}
export type defaultDataT = T.defaultFormGeneric<DefaultDataRowT> & queriedDataT