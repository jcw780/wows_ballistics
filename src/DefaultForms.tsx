import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';

class DefaultForm extends React.Component
<{handleValueChange: Function, controlId: string, label : string, }> {
	form = React.createRef<HTMLSelectElement>()
	state = {options: []};
	constructor(props){
		super(props);
		this.state = {options: []};
		this.form = React.createRef();
	}

	handleChange = (event) => {
		event.stopPropagation();
		this.props.handleValueChange(event.target.value, this.props.controlId);
	}

	updateOptions = (newOptions) => {
		this.setState((state) => {
			return {options: newOptions};
		});
	}

	render(){
		return (
			<Form.Group className="form-inline">
				<Form.Label column sm="6">{this.props.label}</Form.Label>
				<Col sm="2">
					<Form.Control as="select" placeholder="" 
					onChange={this.handleChange} ref={this.form}>
						{this.state.options.map((value ,i) => {return (<option key={i}>{value}</option>);})}
					</Form.Control>
				</Col>
			</Form.Group>
		);
	}

	componentDidUpdate(){
		this.props.handleValueChange(this.form!.current!.value, this.props.controlId);
	}
}

const dataURL = "https://jcw780.github.io/wows_ballistics/static/data/"

function fetchJson(target, onSucess){
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

function fetchJsonData(target){
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

interface defaultFormType{
	version: [string, string, React.RefObject<DefaultForm>, number];
	nation: [string, string, React.RefObject<DefaultForm>, number];
	shipType: [string, string, React.RefObject<DefaultForm>, number];
	ship: [string, string, React.RefObject<DefaultForm>, number];
	artillery: [string, string, React.RefObject<DefaultForm>, number];
	shellType: [string, string, React.RefObject<DefaultForm>, number];
}

class DefaultShips extends React.Component
<{sendDefault: Function, }> {
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
		this.defaultForms[id][1] = value;
		const queryIndex = this.defaultForms[id][3];
		switch(queryIndex){
			case 0:
				this.queryNation();
				break;
			case 1:
				this.queryType();
				break;
			case 2:
				this.queryShip();
				break;
			case 3:
				this.queryArtillery();
				break;
			case 4:
				this.queryShellType();
				break;
			case 5:
				this.sendData();
				break;
			default:
				break;
		}
	}
	updateForm = (target, options) => {
		this.defaultForms[target][2].current.updateOptions(options);
	}
	queryVersion = () => {
		const updateForm = this.updateForm;
		fetchJson(dataURL + "versions.json", function(data){
			var dataSorted = data.reverse();
			updateForm('version', dataSorted);
		});
	}
	queryNation = () => {
		const updateForm = this.updateForm;
		const previousValue = this.defaultForms.version[1];
		fetchJson(dataURL + previousValue
			+ "/nations.json", function (data) {
			updateForm('nation', data);
		});
	}
	queryType = () => {
		const updateForm = this.updateForm;
		const previousValues = [this.defaultForms.version[1], this.defaultForms.nation[1]];
		fetchJson(dataURL + previousValues[0] + "/" + previousValues[1] + "/shiptypes.json",
		function (data) {
			updateForm('shipType', data);
		});
	}
	queryShip = async function() {
		const previousValues = [this.defaultForms.version[1], this.defaultForms.nation[1], this.defaultForms.shipType[1]];
		const data = await fetchJsonData(
			dataURL + previousValues[0] + "/" + previousValues[1] + "/" + previousValues[1] + "_" + previousValues[2] + ".json");
		this.queriedData = data;
		var sorted = Object.keys(data);
		sorted.sort(function(a, b){return data[a]['Tier'] - data[b]['Tier']});
		this.updateForm('ship', sorted);
	}
	queryArtillery = () => {
		const shipName : string = this.defaultForms.ship[1];
		const shipInfo = this.queriedData[shipName];
		var options: string[] = [];
		Object.keys(shipInfo).forEach((key : string) : void => {
			if(key.includes('Artillery')){
				options.push(key);
			}
		});
		this.updateForm('artillery', options);
	}
	queryShellType = () => {
		const input = this.queriedData[this.defaultForms.ship[1]][this.defaultForms.artillery[1]];
		this.updateForm('shellType', Object.keys(input));
	}
	sendData = () => {
		this.props.sendDefault(
			this.queriedData[this.defaultForms.ship[1]][this.defaultForms.artillery[1]][this.defaultForms.shellType[1]],
			this.defaultForms.ship[1]
		);
	}
	render(){
		return(
			<Form>
				{Object.entries(this.defaultForms).map( ([k, v], i) => {
					this.defaultForms[k][3] = i;
					return (<DefaultForm label={v[0]} key={i} controlId={k}
					handleValueChange={this.changeForm} ref={v[2]}> </DefaultForm>);
				})}
			</Form>
		);
	}
}

export default DefaultShips;