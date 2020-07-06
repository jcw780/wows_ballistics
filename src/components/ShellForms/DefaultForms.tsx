import React from 'react';
import {Form} from 'react-bootstrap';
import * as T from '../commonTypes';
import * as S from './Types';

interface defaultFormProps{
	controlId: string, keyProp: number, ariaLabel : string, children : string | JSX.Element, 
	defaultValue: string, defaultOptions: string[], defaultValues: string[], onChange: Function,
}
interface defaultFormState{
	options: string[], value: string
}
export class DefaultForm extends React.PureComponent<defaultFormProps, defaultFormState> {
	public static defaultProps = {
		defaultValue : "", defaultOptions: [],
	}
	updated = false;
	form = React.createRef<HTMLSelectElement>();
	state = {options: this.props.defaultOptions, value: this.props.defaultValue};
	handleChange = (event) => {
		event.stopPropagation();
		const newValue = event.target.value;
		this.setState((current) => {
			return {...current, value: newValue};
		});
		this.props.onChange(newValue, this.props.controlId);
	}
	updateOptions = (newOptions, newValue) => {
		this.setState((current) => {
			return {options: newOptions, value: newValue};
		});
	}
	private addOptions = () => {
		const singleOption = (option,i) => {
			return (<option aria-label={option} key={i}>{option}</option>);
		}
		return () => this.state.options.map(singleOption);
	}
	render(){
		const props = this.props;
		return (
			<Form.Group className="form-inline" style={{marginBottom: ".25rem"}}>
				<Form.Label column sm="3">{props.children}</Form.Label>
				<Form.Control as="select" 
					aria-label={props.ariaLabel}
					onChange={this.handleChange} 
					ref={this.form} 
					style={{width: "70%"}} 
					value={this.state.value}>
					{this.addOptions()()}
				</Form.Control>
			</Form.Group>
		);
	}
	//componentDidUpdate(){}
}

const dataURL = "https://jcw780.github.io/LiveGameData2/data_uncompressed/"

const fetchJsonData = (target) => {
    return fetch(target)
        .then((response) => {
            if (!response.ok) {
            throw new Error('Network response was not ok');
			}
            return response.json();
		})
        .catch((error) => {
            console.error('There has been a problem with your fetch operation:', error);
        }
    );
}

enum singleFormIndex {name, ref, queryIndex}
type singleFormT = [string, React.RefObject<DefaultForm>, number]
type defaultFormType = T.defaultFormGeneric<singleFormT>

export class DefaultShips extends React.PureComponent
<{sendDefault: Function, reset: Function, index: number, keyProp: number, defaultData: S.defaultDataT}> {
	defaultForms : defaultFormType = Object.seal({
		version:   ['Version'   , React.createRef<DefaultForm>(), 0],
		nation:    ['Nation'    , React.createRef<DefaultForm>(), 1], 
		shipType:  ['Type'      , React.createRef<DefaultForm>(), 2], 
		ship:      ['Ship'      , React.createRef<DefaultForm>(), 3], 
		artillery: ['Artillery' , React.createRef<DefaultForm>(), 4], 
		shellType: ['Shell Type', React.createRef<DefaultForm>(), 5],
	})
	changeForm = async (value, id : keyof(defaultFormType)) => {
		//this.defaultForms[id][singleFormIndex.value] = value;
		let queryIndex = this.defaultForms[id][singleFormIndex.queryIndex];
		const defaultData = this.props.defaultData;
		if(queryIndex === 0){
			defaultData.queriedData = await fetchJsonData(
				`${dataURL}${value}_s.json`);
		}else if (queryIndex === 3){
			value = defaultData[id][S.DefaultDataRowI.values][
				defaultData[id][S.DefaultDataRowI.options].indexOf(value)
			];
		}
		defaultData[id][S.DefaultDataRowI.value] = value;
		// Now iterative - instead of waiting for rerenders and clogging stack depth
		for(; queryIndex <= 5; queryIndex++){
			this.postVersion(queryIndex)();
		}
	}
	updateForm = (target : keyof(defaultFormType), options, values) => {
		const refCurrent = this.defaultForms[target][singleFormIndex.ref].current;
		if(refCurrent){ 
			//apparently prevents async calls from updating deleted refs I guess...
			//fixes delete ship crash bug
			const targetData = this.props.defaultData[target]
			let newValue = targetData[S.DefaultDataRowI.value];
			if(!options.includes(newValue)){
				newValue = options[0];
			}
			targetData[S.DefaultDataRowI.options] = options;
			targetData[S.DefaultDataRowI.values] = values;
			if(target === 'ship'){
				targetData[S.DefaultDataRowI.value] = targetData[S.DefaultDataRowI.values][
					targetData[S.DefaultDataRowI.options].indexOf(newValue)
				];
			}else{
				targetData[S.DefaultDataRowI.value] = newValue;
			}
			refCurrent.updateOptions(options, newValue);
		}
	}
	queryVersion = async () => { //probably should be called initialize since it is never called ever again...
		const data = await fetchJsonData(`${dataURL}versions.json`);
		const reversed = data.reverse();
		this.updateForm('version', reversed, reversed);
		this.changeForm(reversed[0], 'version');
	}
	postVersion = (index: number) => {
		const dData = this.props.defaultData, qDataS = dData.queriedData.ships, 
			sDI = S.DefaultDataRowI.value;
		const queryNation = () => {
			const options = Object.keys(dData.queriedData.ships);
			this.updateForm('nation', options, options);
		}
		//Aggressive length shortening
		const nation = dData.nation[sDI], type = dData.shipType[sDI],
			ship = dData.ship[sDI], artillery = dData.artillery[sDI];
		const queryType = () => {
			const options = Object.keys(qDataS[nation]);
			this.updateForm('shipType', options, options);
		}
		const queryShip = () => {
			const ships = qDataS[nation][type];
			let values = Object.keys(ships), options : string[] = [];
			values.sort((a, b) => {return ships[a]['Tier'] - ships[b]['Tier']});
			values.forEach((ship, i) => {options.push(`(${ships[ship]['Tier']}) ${ship}`);});
			this.updateForm('ship', options, values);
		}
		const queryArtillery = () => {
			const options = Object.keys(qDataS[nation][type][ship].artillery);
			this.updateForm('artillery', options, options);
		}
		const queryShellType = () => {
			const options = Object.keys(qDataS[nation][type][ship].artillery[artillery]);
			this.updateForm('shellType', options, options);
		}
		const sendData = () => {
			const shellType = dData.shellType[sDI];
			const shellName = qDataS[nation][type][ship].artillery[artillery][shellType];
			this.props.sendDefault(dData.queriedData.shells[shellName], ship);
		}
		const queries = [
			queryNation, queryType, queryShip,
			queryArtillery, queryShellType, sendData
		];
		return queries[index];
	}
	private addDefaultForms = () => {
		const defaultData = this.props.defaultData;
		const singleForm = ([name, v] : [string, singleFormT], i) : JSX.Element => {
			const defaultDataN = defaultData[name];
			let defaultValue = defaultDataN[S.DefaultDataRowI.value];
			if(name === 'ship'){
				defaultValue = defaultDataN[S.DefaultDataRowI.options][
					defaultDataN[S.DefaultDataRowI.values].indexOf(defaultValue)]
			}
			return (
			<DefaultForm key={i} 
				keyProp={this.props.keyProp} 
				controlId={name} 
				ref={v[singleFormIndex.ref]}
				ariaLabel={v[singleFormIndex.name]} 
				onChange={this.changeForm} 
				defaultValue={defaultValue}
				defaultOptions={defaultDataN[S.DefaultDataRowI.options]}
				defaultValues={defaultDataN[S.DefaultDataRowI.values]}>
				{v[singleFormIndex.name]}
			</DefaultForm>
			);
		}
		const run = () => Object.entries(this.defaultForms).map(singleForm); return run;
	}
	render(){
		return(<>{this.addDefaultForms()()}</>);
	}
	//componentDidUpdate(){}
}

export default DefaultShips;