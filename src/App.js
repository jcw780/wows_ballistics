import React from 'react';
//import logo from './logo.svg';
import './App.css';

import 'bootstrap/dist/css/bootstrap.min.css';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
//import Container from 'react-bootstrap/Container';

function App() {
	return (
		<div className="App">
			<ShellForms index="1"/>
		</div>
	);
}

class DefaultForm extends React.Component {
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
		this.props.handleValueChange(this.form.current.value, this.props.controlId);
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


class DefaultShips extends React.Component {
	defaultForms = Object.seal({
		version: ['Version', '', React.createRef(), 0],
		nation: ['Nation', '', React.createRef(), 0], 
		shipType: ['Type', '', React.createRef(), 0], 
		ship: ['Ship', '', React.createRef(), 0], 
		artillery: ['Artillery', '', React.createRef(), 0], 
		shellType: ['Shell Type', '', React.createRef(), 0],
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
		var sorted = []
		for(let ship in data){
			sorted.push(ship);
		}
		sorted.sort(function(a, b){return data[a]['Tier'] - data[b]['Tier']});
		this.updateForm('ship', sorted);
	}
	queryArtillery = () => {
		const shipName = this.defaultForms.ship[1];
		const shipInfo = this.queriedData[shipName];
		var options = [];
		for(let shell in shipInfo){
			if(shell.includes('Artillery')){
				options.push(shell);
			}
		}
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

	componentDidMount(){
		this.queryVersion();
	}
}

class NumericForm extends React.Component {
	constructor(props){
		super(props);
		this.state = {value: 0};
	}
	handleChange = (event) => {
		this.props.handleValueChange(event.target.value, this.props.controlId);
	}
	updateValue = (newValue) => {
		this.setState((state) => {
			return {options: newValue};
		});
	}
	render(){
		return (
			<Form.Group className="form-inline">
				<Form.Label column sm="6">{this.props.label}</Form.Label>
				<Col sm="2">
					<Form.Control type="number" placeholder={this.state.value} 
					onChange={this.handleChange}/>
				</Col>
			</Form.Group>
		);
	}
}

class ShellParameters extends React.Component{
	constructor(props){
		super(props);
		this.nameForm = React.createRef();
	}
	handleValueChange = (value, k) => {
		this.props.handleValueChange(value, k);
	}
	handleNameChange = (event) => {
		this.props.handleNameChange(event.target.value);
	}
	updateShells = (data) => {
		
	}
	render() {
		return(
			<Form>
			<Form.Group className="form-inline" controlId='shipName'>
				<Form.Label column sm="6">Ship Label</Form.Label>
				<Col sm="2">
					<Form.Control type="text" placeholder="" 
					ref={this.nameForm} onChange={this.handleNameChange}/>
				</Col>
			</Form.Group>
				{this.props.formLabels.map((value, i) => {
					return (<NumericForm label={value[0]} key={i} controlId={value[1]}
					handleValueChange={this.handleValueChange}></NumericForm>);
				})}	
			</Form>
		);
	}
}

class ShellForms extends React.Component {
	constructor(props){
		super(props);
		this.values = Object.seal({
			caliber: 0, muzzleVelocity: 0, dragCoefficient: 0,
			mass: 0, krupp: 0, fusetime: 0, threshold: 0, 
			normalization: 0, ra0: 0, ra1: 0, HESAP: 0,
			name: ''
		});
		this.name = '';
	}
	shellFormValues = Object.freeze([
		['Caliber (m)', 'caliber'],
		['Muzzle Velocity', 'muzzleVelocity'],
		['Drag Coefficient', 'dragCoefficient'],
		['Mass (kg)', 'mass'],
		['Krupp', 'krupp'],
		['Fusetime (s)', 'fusetime'],
		['Fusing Threshold (mm)', 'threshold'],
		['Normalization (°)', 'normalization'],
		['Start Ricochet (°)', 'ra0'],
		['Always Ricochet (°)', 'ra1'],
		['HE/SAP penetration (mm)', 'HESAP'],
	])
	handleValueChange = (value, k) => {
		this.values[k] = parseFloat(value);
	}
	handleNameChange = (value) => {
		this.values.name = value;
	}
	getDefaultData = (data, name) => {
		console.log(data, name);
	}
	render() {
		return(
			<Col sm='4'>
				<h4>Ship {this.props.index}</h4>
				<Accordion defaultActiveKey="1">
					<Card>
						<Card.Header>
							<Accordion.Toggle as={Button} variant="link" eventKey="0">
								Show In-Game Ships
							</Accordion.Toggle>
						</Card.Header>
						<Accordion.Collapse eventKey="0">
							<Card.Body>
								<DefaultShips sendDefault={this.getDefaultData}/>
							</Card.Body>
						</Accordion.Collapse>
					</Card>
				</Accordion>
				<Accordion defaultActiveKey="1">
					<Card>
						<Card.Header>
							<Accordion.Toggle as={Button} variant="link" eventKey="0">
								Show Detailed Parameters
							</Accordion.Toggle>
						</Card.Header>
						<Accordion.Collapse eventKey="0">
							<Card.Body>
								<ShellParameters handleValueChange={this.handleValueChange}
								handleNameChange={this.handleNameChange}
								formLabels={this.shellFormValues}/>
							</Card.Body>
						</Accordion.Collapse>
					</Card>
				</Accordion>
			</Col>
		);
	}
}
export default App;
