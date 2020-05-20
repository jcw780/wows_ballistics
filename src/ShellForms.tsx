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
	type: string, label: string, style: Record<string, any>
	labelWidth: number, placeholder: string, //counter?: number[]
}
class ParameterForm extends React.Component<parameterFormProps>{
	public static defaultProps = {
		labelWidth: 5, placeholder: "", style : {}
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
<Form.Group className="form-inline" style={{marginBottom: "0.5rem"}}>
	<Form.Label column sm={this.props.labelWidth}>{this.props.label}</Form.Label>
	<Form.Control type={this.props.type} value={this.state.value} 
	style={this.props.style} 
	placeholder={this.props.placeholder} onChange={this.handleChange}/>
</Form.Group>
		);
	}
}
export {ParameterForm};

interface shellParametersProps {handleValueChange: any, formLabels : any}
class ShellParameters extends React.Component<shellParametersProps>{
	nameForm = React.createRef<ParameterForm>()
	handleValueChange = (value, k) => {this.props.handleValueChange(value, k);}
	//counter = [0]
	updateShells() {
		Object.entries(this.props.formLabels).forEach((kv : any): void => {
			const value = kv[1];
			kv[1][2].current.updateValue(value[1]);
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
}
type valuesComponent = [string, number, React.RefObject<ParameterForm>];
type parametersType = 'caliber' | 'muzzleVelocity' | 'dragCoefficient' | 'mass' 
| 'krupp' | 'fusetime' | 'threshold' | 'normalization' | 'ra0' | 'ra1' | 'HESAP';
type valuesT = Record<parametersType, valuesComponent>
interface shellFormsProps{
	index: number, colors: Array<string>, keyProp: number, deleteShip : Function, 
	reset: Function, settings : Record<string, any>, size: number
}
class ShellForms extends React.Component<shellFormsProps> {
	parameters : React.RefObject<ShellParameters> = React.createRef<ShellParameters>()
	defaults : React.RefObject<DefaultShips> = React.createRef<DefaultShips>()
	values : valuesT = Object.seal({
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
	name: string = '';
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
	nameForm : React.RefObject<ParameterForm> = React.createRef<ParameterForm>()
	handleNameChange = (value, id) => {this.name = value;}
	handleValueChange = (value : string, k : string) => {
		this.values[k][1] = parseFloat(value);
	}
	getDefaultData = (data, nameUnprocessed) => { //Query Version End
		let name = nameUnprocessed;
		if(this.props.settings.shortNames){
			name = name.split("_").slice(1).join(" ");
		}
		console.log(this.defaults.current!.defaultForms);
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
		this.name = name; this.nameForm.current!.updateValue(name);
		if(data.alphaPiercingCS > this.values.HESAP[1]){this.values.HESAP[1] = data.alphaPiercingCS;}
		if(this.parameters.current){this.parameters.current!.updateShells();}
		//console.log(this.props.size, this.props.index);
		if(this.props.index + 1 == this.props.size){
			this.props.reset();
		}
		//this.props.reset();
	}
	deleteShip = () => {this.props.deleteShip(this.props.keyProp, this.props.index);}
	render() {
		return(
			<Modal.Dialog style={{minWidth: 350}}>
				<Modal.Header closeButton onHide={this.deleteShip} style={{padding: "0.5rem"}}>
					<Modal.Title style={{marginLeft: "40%", marginRight: "auto", }}>Shell {this.props.index + 1}</Modal.Title>
				</Modal.Header>
				<Modal.Body style={{padding: "0.5rem"}}>
					<Container style={{padding: 0}}>
					<Col sm='12' style={{padding: 0}}>
						<ParameterForm label="Shell Label" controlId='shipName'
								handleValueChange={this.handleNameChange}
								type="text" newValue=""
								ref={this.nameForm} style={{width: '50%'}}/>
						<hr/>
						<DefaultShips sendDefault={this.getDefaultData} ref={this.defaults} reset={this.props.reset} index={this.props.index}/>
					</Col>
					</Container>
				</Modal.Body>
				<Modal.Footer style={{padding: "0.5rem"}}>
					<Container>
					<Dropdown>
						<Dropdown.Toggle variant="secondary" id="dropdown-basic">
						Show Detailed Parameters
						</Dropdown.Toggle>
						<Dropdown.Menu>
							<Dropdown.Item style={{padding: 0, minWidth: 500}}>
							<Container style={{padding: 0}}>
								<Col sm="12" style={{padding: 0}}>
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
	componentDidMount(){this.defaults.current!.queryVersion();}
}
export {ShellForms};

class ShellFormsContainer extends React.Component<{settings : Record<string, any>}, {keys: Set<number>, disabled: boolean}>{
	state = {keys: new Set([0, 1]), disabled: false};
	shellRefs = [React.createRef<ShellForms>(), React.createRef<ShellForms>()];
	scrollRef : React.RefObject<HTMLHeadingElement> = React.createRef<HTMLHeadingElement>();
	addShip = () => {
		if(this.state.disabled && (this.state.keys.size > 0)){return;}
		else{
			let index: number = 0; let listed: boolean = true;
			const set = this.state.keys;
			while(listed){
				if(set.has(index)){index++;}
				else{listed = false;}
			}
			this.shellRefs.push(React.createRef<ShellForms>());
			this.setState((current) => {
				let set = current.keys;
				return {keys: set.add(index), disabled: true};
			});
		}
	}
	deleteShip = (key, index) => {
		if(this.state.disabled){return;}
		else{
			if(this.state.keys.size > 0){
				let set = this.state.keys; set.delete(key);
				this.shellRefs.splice(index, 1);
				this.setState((current) => {
					return {keys: set, disabled: true};
				});
			}
		}
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
		const saturation = String(this.props.settings.colors.saturation * 100) + '%';
		const light = String(this.props.settings.colors.light * 100) + '%';
		return `hsl(${hue},${saturation},${light})`;
	}
	generateColors = (index : number, total : number) => {
		const colors = Array<string>(3);
		for(let i=0; i<3; i++){
			colors[i] = this.selectColor(index * 3 + i, total * 3);
		}
		return colors;
	}

	reset = () => {
		if(this.state.disabled){
			this.setState((current) => {
				return {keys: current.keys, disabled: false}
			});
		}
	}
	shouldComponentUpdate(nextProps, nextState){return nextState.disabled;}
	render(){
		return(
<>
	<h2 ref={this.scrollRef}>Shell Parameters</h2>
	<Container style={{marginBottom : "0rem", paddingRight: 0, paddingLeft: 0}}>
		<Row sm={3}>
		{Array.from(this.state.keys).map((value, i) => {
			return <Col key={value} style={{margin: 0, padding: 0}}>
				<ShellForms colors={this.generateColors(i, this.state.keys.size)} index={i} deleteShip={this.deleteShip} 
				keyProp={value} ref={this.shellRefs[i]} reset={this.reset} settings={this.props.settings} size={this.state.keys.size}/>
			</Col>;
		})}
		</Row>
	</Container>
	<Row style={{marginBottom : "1rem"}}>
		<Col/>
		<Col sm="6"><Button className="form-control" variant="success" onClick={this.addShip}>
			Add Ship</Button></Col>
		<Col/>
	</Row>
</>
		);
	}
	//componentDidUpdate(){}
}

export default ShellFormsContainer;