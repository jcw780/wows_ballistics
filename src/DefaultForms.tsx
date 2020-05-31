import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Form, Container} from 'react-bootstrap';

class DefaultForm extends React.Component
<{handleValueChange: Function, controlId: string, label : string, }> {
	form = React.createRef<HTMLSelectElement>();
	state = {options: []};
	handleChange = (event) => {
		event.stopPropagation();
		this.props.handleValueChange(event.target.value, this.props.controlId);
	}

	updateOptions = (newOptions) => {this.setState((state) => {return {options: newOptions};});}

	render(){
		return (
			<Form.Group className="form-inline" style={{marginBottom: ".25rem"}}>
				<Form.Label column sm="3">{this.props.label}</Form.Label>
				<Form.Control as="select" placeholder="" 
				onChange={this.handleChange} ref={this.form} style={{width: "70%"}}>
					{this.state.options.map((value,i) => {return (<option aria-label={value} key={i}>{value}</option>);})}
				</Form.Control>
			</Form.Group>
		);
	}
	componentDidUpdate(){this.props.handleValueChange(this.form!.current!.value, this.props.controlId);}
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

export{DefaultForm};

enum singleFormIndex {name, value, ref, queryIndex}
type singleFormT = [string, string, React.RefObject<DefaultForm>, number]
interface defaultFormType{
	version: singleFormT, nation: singleFormT, shipType: singleFormT, 
	ship: singleFormT, artillery: singleFormT, shellType: singleFormT,
}

class DefaultShips extends React.Component
<{sendDefault: Function, reset: Function, index: number}> {
	defaultForms : defaultFormType = Object.seal({
		version:   ['Version'   , '', React.createRef<DefaultForm>(), 0],
		nation:    ['Nation'    , '', React.createRef<DefaultForm>(), 0], 
		shipType:  ['Type'      , '', React.createRef<DefaultForm>(), 0], 
		ship:      ['Ship'      , '', React.createRef<DefaultForm>(), 0], 
		artillery: ['Artillery' , '', React.createRef<DefaultForm>(), 0], 
		shellType: ['Shell Type', '', React.createRef<DefaultForm>(), 0],
	})
	queriedData = {}
	changeForm = (value, id) => {
		this.defaultForms[id][singleFormIndex.value] = value;
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
			refCurrent.updateOptions(options);
		}
	}
	queryVersion = () => {
		fetchJson(dataURL + "versions.json", (data) => {
			var dataSorted = data.reverse();
			this.updateForm('version', dataSorted);
		});
	}
	queryNation = () => {
		fetchJson(dataURL + this.defaultForms.version[singleFormIndex.value] + "/nations.json", 
			(data) => {this.updateForm('nation', data);}
		);
	}
	queryType = () => {
		fetchJson(dataURL + this.defaultForms.version[singleFormIndex.value] + "/" + 
			this.defaultForms.nation[singleFormIndex.value] + "/shiptypes.json",
			(data) => {this.updateForm('shipType', data);}
		);
	}
	queryShip = async () => {
		const data = await fetchJsonData(
			dataURL + this.defaultForms.version[singleFormIndex.value] + "/" + this.defaultForms.nation[singleFormIndex.value] + 
			"/" + this.defaultForms.nation[singleFormIndex.value] + "_" + this.defaultForms.shipType[singleFormIndex.value] + ".json");
		this.queriedData = data; var sorted = Object.keys(data);
		sorted.sort((a, b) => {return data[a]['Tier'] - data[b]['Tier']}); this.updateForm('ship', sorted);
	}
	queryArtillery = () => {
		const shipName : string = this.defaultForms.ship[singleFormIndex.value];
		const shipInfo = this.queriedData[shipName];
		var options: string[] = [];
		Object.keys(shipInfo).forEach((key : string) : void => {
			if(key.includes('Artillery')){options.push(key);}
		});
		this.updateForm('artillery', options);
	}
	queryShellType = () => {
		const input = this.queriedData[this.defaultForms.ship[singleFormIndex.value]][this.defaultForms.artillery[singleFormIndex.value]];
		this.updateForm('shellType', Object.keys(input));
	}
	sendData = () => {
		this.props.sendDefault(
			this.queriedData[this.defaultForms.ship[singleFormIndex.value]][this.defaultForms.artillery[singleFormIndex.value]]
			[this.defaultForms.shellType[singleFormIndex.value]], this.defaultForms.ship[singleFormIndex.value]
		);
	}
	render(){
		return(
			<Container style={{paddingLeft: 0, paddingRight: 0}}>
				{Object.entries(this.defaultForms).map( ([k, v], i) => {
					v[singleFormIndex.queryIndex] = i;
					return (<DefaultForm label={v[0]} key={i} controlId={k}
					handleValueChange={this.changeForm} ref={v[2]}> </DefaultForm>);
				})}
			</Container>
		);
	}
	//componentDidUpdate(){}
}

export default DefaultShips;