import React from 'react';
//import logo from './logo.svg';
import './App.css';

import 'bootstrap/dist/css/bootstrap.min.css';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Dropdown from 'react-bootstrap/Dropdown';
import Modal from 'react-bootstrap/Modal';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';

import DefaultShips from './DefaultForms'

interface parameterFormProps {
	newValue: any, controlId: string, handleValueChange: Function,
	type: string, label: string, 
	labelWidth: number, formWidth: string, placeholder: string
}
class ParameterForm extends React.Component<parameterFormProps>{
	public static defaultProps = {
		labelWidth: 3, formWidth: "", placeholder: ""
	}
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
	<Form.Label column sm={this.props.labelWidth}>{this.props.label}</Form.Label>
	<Form.Control type={this.props.type} value={this.state.value} 
	style={{width: this.props.formWidth}} 
	placeholder={this.props.placeholder} onChange={this.handleChange}/>
</Form.Group>
		);
	}
}
export {ParameterForm};

interface shellParametersProps {
	handleValueChange: any,
	formLabels : any
}
class ShellParameters extends React.Component<shellParametersProps>{
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

interface shellFormsProps{
	index: number, colors: Array<string>, keyProp: number, deleteShip : Function
}
class ShellForms extends React.Component<shellFormsProps> {
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
	returnData = () => {
		let condensed : Record<string, any> = {name: this.name};
		Object.entries(this.values).forEach((kv) => {
			const key = kv[0]; 
			const value = kv[1];
			condensed[key] = value[1]; 
		})
		condensed['colors'] = this.props.colors;
		return condensed;
	}
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
		this.props.deleteShip(this.props.keyProp, this.props.index);
	}
	render() {
		return(
			<Modal.Dialog style={{margin: 0}}>
				<Modal.Header closeButton onHide={this.deleteShip} style={{padding: "0.5rem"}}>
					<Modal.Title style={{marginLeft: "40%", marginRight: "auto", }}>Shell {this.props.index + 1}</Modal.Title>
				</Modal.Header>
				<Modal.Body style={{padding: 0}}>
					<Container>
					<Col sm='12'>
						<ParameterForm label="Shell Label" controlId='shipName'
								handleValueChange={this.handleNameChange}
								type="text" newValue=""
								ref={this.nameForm}/>
						<DefaultShips sendDefault={this.getDefaultData} ref={this.defaults}/>
					</Col>
					</Container>
				</Modal.Body>
				<Modal.Footer>
					<Container>
					<Dropdown>
						<Dropdown.Toggle variant="success" id="dropdown-basic">
						Show Detailed Parameters
						</Dropdown.Toggle>
						<Dropdown.Menu>
							<Dropdown.Item>
							<Container>
								<Col sm="10">
								<ShellParameters handleValueChange={this.handleValueChange}
										formLabels={this.values} ref={this.parameters}/>
								</Col>
							</Container>
							</Dropdown.Item>
						</Dropdown.Menu>
					</Dropdown>
					</Container>
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
	shellRefs = [React.createRef<ShellForms>(), React.createRef<ShellForms>()];

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
		this.shellRefs.push(React.createRef<ShellForms>());
		this.setState((current) => {
			let set = current['keys'];
			return {keys: set.add(index)};
		});
	}

	deleteShip = (key, index) => {
		let set = this.state.keys;
		set.delete(key);
		this.shellRefs.splice(index, 1);
		this.setState((current) => {
			return {keys: set};
		})
	}

	returnShellData = () => {
		let data = Array<any>(this.shellRefs.length);
		this.shellRefs.forEach((reference, i) => {
			data[i] = reference.current!.returnData();
		});
		return data;
	}

	selectColor = (number, colors) => {
		const hue = number * 137.507764 % 360; // use golden angle approximation
		//console.log(hue);
		//return this.hslToRgb(hue, .8, .5);
		return `hsl(${hue},50%,60%)`;
	}
	
	hslToRgb = (h: number, s: number, l: number) => {
		var r, g, b;
	
		if(s == 0){
			r = g = b = l; // achromatic
		}else{
			var hue2rgb = function hue2rgb(p, q, t){
				if(t < 0) t += 1;
				if(t > 1) t -= 1;
				if(t < 1/6) return p + (q - p) * 6 * t;
				if(t < 1/2) return q;
				if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
				return p;
			}
	
			var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
			var p = 2 * l - q;
			r = hue2rgb(p, q, h + 1/3);
			g = hue2rgb(p, q, h);
			b = hue2rgb(p, q, h - 1/3);
		}
		return 'rgb(' + Math.round(r * 255) + ',' + Math.round(g * 255) + ',' + Math.round(b * 255) + ')'
		//return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
	}
	/*
	selectColor = (colorNum, colors) => {
		if (colors < 1) colors = 1; // defaults to one color - avoid divide by zero
		return "hsl(" + (colorNum * (360 / colors) % 360) + ",100%,50%)";
	}*/

	generateColors = (index : number, total : number) => {
		const colors = Array<string>(3);
		for(let i=0; i<3; i++){
			//console.log(index * 3 + i, total * 3);
			colors[i] = this.selectColor(index * 3 + i, total * 3);
		}
		//console.log(colors, index, total);
		return colors;
	}

	render(){
		return(
<>
	<h2>Shell Selection</h2>
	<Container style={{marginBottom : "1.75rem"}}>
		<Row sm={3}>
		{Array.from(this.state.keys).map((value, i) => {
			return <Col key={value} style={{margin: 0, padding: 0}}>
				<ShellForms colors={this.generateColors(i, this.state.keys.size)} index={i} deleteShip={this.deleteShip} 
				keyProp={value} ref={this.shellRefs[i]}/>
			</Col>;
		})}
		</Row>
	</Container>
	<Row>
		<Col/>
		<Col sm="6"><Button className="form-control" onClick={this.addShip}>
			Add Ship</Button></Col>
		<Col/>
	</Row>
</>
		);
	}
}

export default ShellFormsContainer;