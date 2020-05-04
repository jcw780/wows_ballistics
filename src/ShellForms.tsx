import React from 'react';
//import logo from './logo.svg';
import './App.css';

import 'bootstrap/dist/css/bootstrap.min.css';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Dropdown from 'react-bootstrap/Dropdown';
import DefaultShips from 'DefaultForms'


class ParameterForm extends React.Component
<{newValue: any, controlId: string, handleValueChange: Function,
type: string, label: string}>{
	state = {value: ""};
	constructor(props){
		super(props);
		this.state = {value: this.props.newValue};
	}
	handleChange = (event) => {
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
					<Form.Control type={this.props.type} placeholder={this.state.value} 
					onChange={this.handleChange}/>
				</Col>
			</Form.Group>
		);
	}
}

class ShellParameters extends React.Component<{handleValueChange: any, handleNameChange: any,
	formLabels : any}>{
	nameForm = React.createRef<ParameterForm>()

	handleValueChange = (value, k) => {
		this.props.handleValueChange(value, k);
	}
	handleNameChange = (event : any) => {
		this.props.handleNameChange(event.target.value);
	}
	updateShells(name : string) {
		Object.entries(this.props.formLabels).map(function (kv : any): void{
			const value = kv[1]; 
			value[2].current.updateValue(value[1]);
		});
		const updateValueTemp = this.nameForm.current!.updateValue;
		updateValueTemp(name);
	}
	render() {
		return(
			<Form>
				<ParameterForm label="Ship Label" controlId='shipName'
						handleValueChange={this.handleValueChange}
						type="text" newValue=""
						ref={this.nameForm}></ParameterForm>
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
}

class ShellForms extends React.Component<{index: string | number}> {
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

	handleValueChange = (value : string, k : string) => {
		this.values[k][1] = parseFloat(value);
	}
	handleNameChange = (value) => {
		//this.values.name = value;
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

		if(data.alphaPiercingCS > this.values.HESAP[1]){
			this.values.HESAP[1] = data.alphaPiercingCS;
		}
		if(this.parameters.current){
			this.parameters.current!.updateShells(name);
		}
	}
	render() {
		return(
			<Col sm='4'>
				<h4>Ship {this.props.index}</h4>
				<DefaultShips sendDefault={this.getDefaultData} ref={this.defaults}/>
				<Dropdown>
					<Dropdown.Toggle variant="success" id="dropdown-basic">
					Show Detailed Parameters
					</Dropdown.Toggle>

					<Dropdown.Menu>
						<Dropdown.Item>
                            <Col sm="12">
                            <ShellParameters handleValueChange={this.handleValueChange}
                                    handleNameChange={this.handleNameChange}
                                    formLabels={this.values} ref={this.parameters}/>
                            </Col>
						</Dropdown.Item>
					</Dropdown.Menu>
				</Dropdown>
			</Col>
		);
	}
	componentDidMount(){
		this.defaults.current!.queryVersion();
	}
}

export default ShellForms;