import React from 'react';
//import logo from './logo.svg';
import './App.css';

import 'bootstrap/dist/css/bootstrap.min.css';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Dropdown from 'react-bootstrap/Dropdown';
import Modal from 'react-bootstrap/Modal';
import DefaultShips from 'DefaultForms'
import Button from 'react-bootstrap/Button';


class ParameterForm extends React.Component
<{newValue: any, controlId: string, handleValueChange: Function,
type: string, label: string}>{
	state = {value: ""};
	constructor(props){
		super(props);
		this.state = {value: this.props.newValue};
	}
	handleChange = (event) => {
		this.updateValue(event.target.value);
		this.props.handleValueChange(event.target.value, this.props.controlId);
	}
	updateValue = (newValue) => {
		this.setState((state) => {
			return {value: newValue};
		});
	}
	render(){
		return (
			<Form.Group className="form-inline">
				<Form.Label column sm="6">{this.props.label}</Form.Label>
				<Col sm="2">
					<Form.Control type={this.props.type} value={this.state.value} 
					onChange={this.handleChange}/>
				</Col>
			</Form.Group>
		);
	}
}

class ShellParameters extends React.Component<{handleValueChange: any,
	formLabels : any}>{
	nameForm = React.createRef<ParameterForm>()

	handleValueChange = (value, k) => {
		this.props.handleValueChange(value, k);
	}
	updateShells() {
		Object.entries(this.props.formLabels).forEach((kv : any): void => {
			const value = kv[1];
			value[2].current.updateValue(value[1]);
		});
	}
	render() {
		return(
			<Form>
				{Object.entries(this.props.formLabels).map((kv : any, i) => {
					const key: string = kv[0];
					const value = kv[1];
					return (<ParameterForm label={value[0]} key={i} controlId={key}
					handleValueChange={this.handleValueChange}
					type="number" newValue={value[1]}
					ref={this.props.formLabels[key][2]}></ParameterForm>);
				})}	
			</Form>
		);
	}
	componentDidUpdate(){
		this.updateShells();
	}
}

class ShellForms extends React.Component<{index: number, deleteShip : Function}> {
	parameters = React.createRef<ShellParameters>()
	defaults = React.createRef<DefaultShips>()
	values = Object.seal({
		caliber: ['Caliber (m)', 0, React.createRef()], 
		muzzleVelocity: ['Muzzle Velocity', 0, React.createRef()], 
		dragCoefficient: ['Drag Coefficient', 0, React.createRef()],
		mass: ['Mass (kg)', 0, React.createRef()], 
		krupp: ['Krupp', 0, React.createRef()], 
		fusetime: ['Fusetime (s)', 0, React.createRef()], 
		threshold: ['Fusing Threshold (mm)', 0, React.createRef()], 
		normalization: ['Normalization (°)', 0, React.createRef()], 
		ra0: ['Start Ricochet (°)', 0, React.createRef()], 
		ra1: ['Always Ricochet (°)', 0, React.createRef()], 
		HESAP: ['HE/SAP penetration (mm)', 0, React.createRef()],
	})
	name = ''
	nameForm = React.createRef<ParameterForm>()
	handleNameChange = (value, id) => {
		this.name = value;
	}

	handleValueChange = (value : string, k : string) => {
		this.values[k][1] = parseFloat(value);
	}
	getDefaultData = (data, name) => {
		this.values.caliber[1] = data.bulletDiametr;
		this.values.muzzleVelocity[1] = data.bulletSpeed;
		this.values.dragCoefficient[1] = data.bulletAirDrag;
		this.values.mass[1] = data.bulletMass;
		this.values.krupp[1] = data.bulletKrupp;
		this.values.fusetime[1] = data.bulletDetonator;
		this.values.threshold[1] = data.bulletDetonatorThreshold;
		this.values.normalization[1] = data.bulletCapNormalizeMaxAngle;
		this.values.ra0[1] = data.bulletRicochetAt;
		this.values.ra1[1] = data.bulletAlwaysRicochetAt;
		this.values.HESAP[1] = data.alphaPiercingHE;

		this.name = name;
		this.nameForm.current!.updateValue(name);

		if(data.alphaPiercingCS > this.values.HESAP[1]){
			this.values.HESAP[1] = data.alphaPiercingCS;
		}
		if(this.parameters.current){
			this.parameters.current!.updateShells();
		}

	}
	deleteShip = () => {
		this.props.deleteShip(this.props.index);
	}
	render() {
		return(
			<Modal.Dialog>
				<Modal.Header closeButton onClick={this.deleteShip}>
					<Modal.Title>Ship {this.props.index}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Col sm='4'>
						<ParameterForm label="Ship Label" controlId='shipName'
								handleValueChange={this.handleNameChange}
								type="text" newValue=""
								ref={this.nameForm}></ParameterForm>
						<DefaultShips sendDefault={this.getDefaultData} ref={this.defaults}/>
					</Col>
				</Modal.Body>
				<Modal.Footer>
					<Dropdown>
						<Dropdown.Toggle variant="success" id="dropdown-basic">
						Show Detailed Parameters
						</Dropdown.Toggle>
						<Dropdown.Menu>
							<Dropdown.Item>
								<Col sm="12">
								<ShellParameters handleValueChange={this.handleValueChange}
										formLabels={this.values} ref={this.parameters}/>
								</Col>
							</Dropdown.Item>
						</Dropdown.Menu>
					</Dropdown>
					<div className="rows">
						<div className="row">
							
						</div>
						<div className="row">

						</div>
					</div>
				</Modal.Footer>
			</Modal.Dialog>
		);
	}

	componentDidMount(){
		this.defaults.current!.queryVersion();
	}
}
export {ShellForms};

class ShellFormsContainer extends React.Component{
	state = {keys: new Set([0, 1])};

	addShip = () => {
		let index: number = 0;
		let listed: boolean = true;
		const set = this.state.keys;
		while(listed){
			if(set.has(index)){
				index++;
			}else{
				listed = false;
			}
		}
		this.setState((current) => {
			let set = current['keys'];
			return {keys: set.add(index)};
		});
	}

	deleteShip = (key) => {
		let set = this.state.keys;
		set.delete(key);
		this.setState((current) => {
			return {keys: set};
		})
	}

	render(){
		return(
			<>
				<div className='rows'>
					{Array.from(this.state.keys).map((value, i) => {
						return <div className='row' key={value.toString()}>
							<ShellForms index={i} deleteShip={this.deleteShip}/></div>;
					})}
				</div>
				<Button onClick={this.addShip}>Add Ship</Button>
			</>
		);
	}
}

export default ShellFormsContainer;