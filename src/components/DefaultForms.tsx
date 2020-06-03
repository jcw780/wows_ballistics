import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Form, Container} from 'react-bootstrap';
//import TargetFormsContainer from 'TargetForms';
import * as T from './commonTypes';

export class DefaultForm extends React.Component
<{handleValueChange: Function, controlId: string, label : string, defaultValue: string, defaultOptions: string[], keyProp: number}> {
	public static defaultProps = {
		defaultValue : "", defaultOptions: [],
	}
	updated = false;
	form = React.createRef<HTMLSelectElement>();
	state = {options: this.props.defaultOptions};
	handleChange = (event) => {
		event.stopPropagation();
		this.props.handleValueChange(event.target.value, this.props.controlId);
	}

	updateOptions = (newOptions) => {
		this.updated = true;
		this.setState((state) => {return {options: newOptions};});
	}

	render(){
		return (
			<Form.Group className="form-inline" style={{marginBottom: ".25rem"}}>
				<Form.Label column sm="3">{this.props.label}</Form.Label>
				<Form.Control as="select" placeholder="" defaultValue={this.props.defaultValue}
				onChange={this.handleChange} ref={this.form} style={{width: "70%"}}>
					{this.state.options.map((value,i) => {return (<option aria-label={value} key={i}>{value}</option>);})}
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

const dataURL = "https://jcw780.github.io/LiveGameData/"

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

const fetchJsonData = async (target) => {
    return fetch(target)
        .then((response) => {
            if (!response.ok) {
            throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then((data) => {return data;})
        .catch((error) => {
            console.error('There has been a problem with your fetch operation:', error);
        }
    );
}

enum singleFormIndex {name, ref, queryIndex}
type singleFormT = [string, React.RefObject<DefaultForm>, number]
type defaultFormType = T.defaultFormGeneric<singleFormT>

class DefaultShips extends React.Component
<{sendDefault: Function, reset: Function, index: number, keyProp: number, defaultData: T.defaultDataT}> {
	defaultForms : defaultFormType = Object.seal({
		version:   ['Version'   , React.createRef<DefaultForm>(), 0],
		nation:    ['Nation'    , React.createRef<DefaultForm>(), 0], 
		shipType:  ['Type'      , React.createRef<DefaultForm>(), 0], 
		ship:      ['Ship'      , React.createRef<DefaultForm>(), 0], 
		artillery: ['Artillery' , React.createRef<DefaultForm>(), 0], 
		shellType: ['Shell Type', React.createRef<DefaultForm>(), 0],
	})
	changeForm = (value, id) => {
		//this.defaultForms[id][singleFormIndex.value] = value;
		this.props.defaultData[id][T.singleDefaultDataIndex.value] = value;
		const queryIndex = this.defaultForms[id][singleFormIndex.queryIndex];
		const queries = {
			0: this.queryNation, 1: this.queryType, 2: this.queryShip,
			3: this.queryArtillery, 4: this.queryShellType, 5: this.sendData
		}
		if(queryIndex in queries){queries[queryIndex]();}
	}
	updateForm = (target, options) => {
		const refCurrent = this.defaultForms[target][singleFormIndex.ref].current;
		if(refCurrent){ 
			//apparently prevents async calls from updating deleted refs I guess...
			//fixes delete ship crash bug
			this.props.defaultData[target][T.singleDefaultDataIndex.options] = options;
			refCurrent.updateOptions(options);
		}
	}
	queryVersion = () => {
		fetchJson(dataURL + "versions.json", (data) => {
			let dataSorted = data.reverse();
			this.updateForm('version', dataSorted);
		});
	}
	queryNation = () => {
		fetchJson(dataURL + this.props.defaultData.version[T.singleDefaultDataIndex.value] + "/nations.json", 
			(data) => {this.updateForm('nation', data);}
		);
	}
	queryType = () => {
		fetchJson(dataURL + this.props.defaultData.version[T.singleDefaultDataIndex.value] + "/" + 
		this.props.defaultData.nation[T.singleDefaultDataIndex.value] + "/shiptypes.json",
			(data) => {this.updateForm('shipType', data);}
		);
	}
	queryShip = async () => {
		const data = await fetchJsonData(
			dataURL + this.props.defaultData.version[T.singleDefaultDataIndex.value] + "/" + 
			this.props.defaultData.nation[T.singleDefaultDataIndex.value] + 
			"/" + this.props.defaultData.nation[T.singleDefaultDataIndex.value] + "_" + 
			this.props.defaultData.shipType[T.singleDefaultDataIndex.value] + ".json");
		this.props.defaultData.queriedData = data; 
		let sorted = Object.keys(data);
		sorted.sort((a, b) => {return data[a]['Tier'] - data[b]['Tier']}); 
		this.updateForm('ship', sorted);
	}
	queryArtillery = () => {
		const shipName : string = this.props.defaultData.ship[T.singleDefaultDataIndex.value];
		const shipInfo = this.props.defaultData.queriedData[shipName]; 
		let options: string[] = [];
		Object.keys(shipInfo!).forEach((key : string) : void => {
			if(key.includes('Artillery')){options.push(key);}
		});
		this.updateForm('artillery', options);
	}
	queryShellType = () => {
		const input = this.props.defaultData.queriedData[this.props.defaultData.ship[T.singleDefaultDataIndex.value]]
		[this.props.defaultData.artillery[T.singleDefaultDataIndex.value]];
		this.updateForm('shellType', Object.keys(input));
	}
	sendData = () => {
		this.props.sendDefault(
			this.props.defaultData.queriedData[this.props.defaultData.ship[T.singleDefaultDataIndex.value]]
			[this.props.defaultData.artillery[T.singleDefaultDataIndex.value]]
			[this.props.defaultData.shellType[T.singleDefaultDataIndex.value]], 
			this.props.defaultData.ship[T.singleDefaultDataIndex.value]
		);
	}
	render(){
		return(
			<Container style={{paddingLeft: 0, paddingRight: 0}}>
				{Object.entries(this.defaultForms).map( ([k, v], i) => {
					v[singleFormIndex.queryIndex] = i;
					return (<DefaultForm label={v[singleFormIndex.name]} key={i} controlId={k}
					handleValueChange={this.changeForm} ref={v[singleFormIndex.ref]} keyProp={this.props.keyProp}
					defaultValue={this.props.defaultData[k][T.singleDefaultDataIndex.value]}
					defaultOptions={this.props.defaultData[k][T.singleDefaultDataIndex.options]}> </DefaultForm>);
				})}
			</Container>
		);
	}
	//componentDidUpdate(){}
}

export default DefaultShips;