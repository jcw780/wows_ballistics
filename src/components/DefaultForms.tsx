import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Form, Container} from 'react-bootstrap';
import pako from 'pako';
//import TargetFormsContainer from 'TargetForms';
import * as T from './commonTypes';

interface defaultFormProps{
	controlId: string, keyProp: number, ariaLabel : string, children : string | JSX.Element, 
	defaultValue: string, defaultOptions: string[], defaultValues: string[], handleValueChange: Function,
}

export class DefaultForm extends React.PureComponent<defaultFormProps> {
	public static defaultProps = {
		defaultValue : "", defaultOptions: [],
	}
	updated = false;
	form = React.createRef<HTMLSelectElement>();
	state = {options: this.props.defaultOptions, values: this.props.defaultValues};
	handleChange = (event) => {
		event.stopPropagation();
		this.props.handleValueChange(event.target.value, this.props.controlId);
	}

	updateOptions = (newOptions, newValues) => {
		this.updated = true;
		this.setState((state) => {return {options: newOptions, values: newValues};});
	}
	private addOptions = () => {
		const singleOption = (value,i) => {
			return (<option aria-label={value} value={this.state.values[i]} key={i}>{value}</option>);
		}
		const run = () => this.state.options.map(singleOption); return run();
	}
	render(){
		const props = this.props;
		return (
			<Form.Group className="form-inline" style={{marginBottom: ".25rem"}}>
				<Form.Label column sm="3">{props.children}</Form.Label>
				<Form.Control as="select" placeholder="" defaultValue={props.defaultValue} aria-label={props.ariaLabel}
				onChange={this.handleChange} ref={this.form} style={{width: "70%"}}>
					{this.addOptions()}
				</Form.Control>
			</Form.Group>
		);
	}
	componentDidUpdate(){
		// Prevents subsequent updates unless externally rerendered
		if(this.updated){
			this.props.handleValueChange(this.form!.current!.value, this.props.controlId);
			this.updated = false;
		}
	}
}

const dataURL = "https://jcw780.github.io/LiveGameData2/data/"

const fetchJson = (target, onSucess) => {
    fetch(target)
        .then((response) => {
            if (!response.ok) {
            throw new Error('Network response was not ok');
			}
            return response.json();
        })
        .then(onSucess)
        .catch((error) => {
            console.error('There has been a problem with your fetch operation:', error);
        }
    );
}

//File is compressed
const fetchJsonData = async (target) => {
    return fetch(target)
        .then((response) => {
            if (!response.ok) {
            throw new Error('Network response was not ok');
			}
            return response;
		})
		.then(async (response) => {
			const Abuffer = await response.arrayBuffer();
			const enc = new TextDecoder("utf-8");
			const outputStr = enc.decode(pako.inflate(Abuffer));
			const output = JSON.parse(outputStr);
			return output;
		})
        .catch((error) => {
            console.error('There has been a problem with your fetch operation:', error);
        }
    );
}

enum singleFormIndex {name, ref, queryIndex}
type singleFormT = [string, React.RefObject<DefaultForm>, number]
type defaultFormType = T.defaultFormGeneric<singleFormT>

class DefaultShips extends React.PureComponent
<{sendDefault: Function, reset: Function, index: number, keyProp: number, defaultData: T.defaultDataT}> {
	defaultForms : defaultFormType = Object.seal({
		version:   ['Version'   , React.createRef<DefaultForm>(), 0],
		nation:    ['Nation'    , React.createRef<DefaultForm>(), 1], 
		shipType:  ['Type'      , React.createRef<DefaultForm>(), 2], 
		ship:      ['Ship'      , React.createRef<DefaultForm>(), 3], 
		artillery: ['Artillery' , React.createRef<DefaultForm>(), 4], 
		shellType: ['Shell Type', React.createRef<DefaultForm>(), 5],
	})
	changeForm = (value, id : keyof(defaultFormType)) => {
		//this.defaultForms[id][singleFormIndex.value] = value;
		const defaultData = this.props.defaultData;
		defaultData[id][T.singleDefaultDataIndex.value] = value;
		const queryIndex = this.defaultForms[id][singleFormIndex.queryIndex];
		const queries = [
			this.queryNation, this.queryType, this.queryShip,
			this.queryArtillery, this.queryShellType, this.sendData
		]
		if(queryIndex in queries){queries[queryIndex]();}
	}
	updateForm = (target : keyof(defaultFormType), options, values) => {
		const refCurrent = this.defaultForms[target][singleFormIndex.ref].current;
		if(refCurrent){ 
			//apparently prevents async calls from updating deleted refs I guess...
			//fixes delete ship crash bug
			this.props.defaultData[target][T.singleDefaultDataIndex.options] = options;
			this.props.defaultData[target][T.singleDefaultDataIndex.values] = values;
			refCurrent.updateOptions(options, values);
		}
	}
	queryVersion = () => {
		fetchJson(dataURL + "versions.json", (data) => {
			let dataSorted = data.reverse();
			this.updateForm('version', dataSorted, dataSorted);
		});
	}
	queryNation = async () => {
		const defaultData = this.props.defaultData;
		const data = await fetchJsonData(`${dataURL}${defaultData.version[T.singleDefaultDataIndex.value]}_s.gz`);
		this.props.defaultData.queriedData = data;
		const options = Object.keys(data.ships);
		this.updateForm('nation', options, options);
	}
	queryType = () => {
		const dData = this.props.defaultData;
		const nation = dData.nation[T.singleDefaultDataIndex.value];
		const qDataS = dData.queriedData.ships;
		const options = Object.keys(qDataS[nation]);
		this.updateForm('shipType', options, options);
	}
	queryShip = async () => {
		const dData = this.props.defaultData, qDataS = dData.queriedData.ships;
		const sDI = T.singleDefaultDataIndex.value;
		const nation = dData.nation[sDI], type = dData.shipType[sDI];
		const ships = qDataS[nation][type];
		let values = Object.keys(ships), options : string[] = [];
		values.sort((a, b) => {return ships[a]['Tier'] - ships[b]['Tier']});
		values.forEach((ship, i) => {options.push(`(${ships[ship]['Tier']}) ${ship}`);});
		this.updateForm('ship', options, values);
	}
	queryArtillery = () => {
		const dData = this.props.defaultData, qDataS = dData.queriedData.ships;
		const sDI = T.singleDefaultDataIndex.value;
		const nation = dData.nation[sDI], type = dData.shipType[sDI], ship = dData.ship[sDI];
		const options = Object.keys(qDataS[nation][type][ship].artillery);
		this.updateForm('artillery', options, options);
	}
	queryShellType = () => {
		const dData = this.props.defaultData, qDataS = dData.queriedData.ships;
		const sDI = T.singleDefaultDataIndex.value;
		const nation = dData.nation[sDI], type = dData.shipType[sDI];
		const ship = dData.ship[sDI], artillery = dData.artillery[sDI];
		const options = Object.keys(qDataS[nation][type][ship].artillery[artillery]);
		this.updateForm('shellType', options, options);
	}
	sendData = () => {
		const dData = this.props.defaultData, qDataS = dData.queriedData.ships;
		const sDI = T.singleDefaultDataIndex.value;
		const nation = dData.nation[sDI], type = dData.shipType[sDI], ship = dData.ship[sDI];
		const artillery = dData.artillery[sDI], shellType = dData.shellType[sDI];
		const shellName = qDataS[nation][type][ship].artillery[artillery][shellType];
		this.props.sendDefault(dData.queriedData.shells[shellName], ship);
	}
	private addDefaultForms = () => {
		const defaultData = this.props.defaultData;
		const singleForm = ([name, v] : [string, singleFormT], i) : JSX.Element => {
			const defaultDataN = defaultData[name];
			return (<DefaultForm key={i} keyProp={this.props.keyProp} controlId={name} ref={v[singleFormIndex.ref]}
			ariaLabel={v[singleFormIndex.name]} handleValueChange={this.changeForm} 
			defaultValue={defaultDataN[T.singleDefaultDataIndex.value]} 
			defaultOptions={defaultDataN[T.singleDefaultDataIndex.options]}
			defaultValues={defaultDataN[T.singleDefaultDataIndex.values]}>
				{v[singleFormIndex.name]}
			</DefaultForm>);
		}
		const run = () => Object.entries(this.defaultForms).map(singleForm); return run();
	}
	render(){
		return(
			<Container style={{paddingLeft: 0, paddingRight: 0}}>
				{this.addDefaultForms()}
			</Container>
		);
	}
	//componentDidUpdate(){}
}

export default DefaultShips;