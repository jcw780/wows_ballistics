import ParameterForm from '../ParameterForm';

export enum labelI {name, unit, ref, description}
export type labelT = [string, string,React.RefObject<ParameterForm>, string | JSX.Element];
export interface formTemplate<K>{
	caliber: K, muzzleVelocity: K, dragCoefficient: K, mass: K,
	krupp: K, fusetime: K, threshold: K, normalization: K, 
	ra0: K, ra1: K, HESAP: K,
}
export type formLabelsT = formTemplate<labelT>;
export type formsT = keyof(formLabelsT);

export interface formDataT extends formTemplate<number>{name: string, colors: string[]}