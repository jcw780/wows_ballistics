import React from 'react';
import {Form, Col, Row, Modal, Container, Button, Popover, OverlayTrigger} from 'react-bootstrap';

import * as T from 'commonTypes';
import {ParameterForm} from 'ParameterForm';
import DefaultShips from './DefaultForms'

interface shellParametersProps {handleValueChange: any, formLabels : formValuesT, formValues: formDataT}
class ShellParameters extends React.Component<shellParametersProps>{
	nameForm = React.createRef<ParameterForm>()
	handleValueChange = (value, k) => {this.props.handleValueChange(value, k);}
	updateShells() {
		Object.entries(this.props.formLabels).forEach(([key, value] : any): void => {
			//const key : string = kv[0]; const value = kv[1];
			value[valuesComponentIndex.ref].current.updateValue(this.props.formValues[key]);
		});
	}
	render() {
		return(
			<Form>
				{Object.entries(this.props.formLabels).map(([key, value] : any, i) => {
					return (<ParameterForm label={value[valuesComponentIndex.name]} key={i} controlId={key}
					handleValueChange={this.handleValueChange}
					type="number" newValue={String(this.props.formValues[key])} append={value[valuesComponentIndex.unit]}
					ref={this.props.formLabels[key][valuesComponentIndex.ref]} style={{inputGroup:{width: "50%"}}}/>);
				})}	
			</Form>
		);
	}
}
enum valuesComponentIndex {name, unit, ref}
type valuesComponent = [string, string, React.RefObject<ParameterForm>];
type parametersType = 'caliber' | 'muzzleVelocity' | 'dragCoefficient' | 'mass' 
| 'krupp' | 'fusetime' | 'threshold' | 'normalization' | 'ra0' | 'ra1' | 'HESAP';
type formValuesT = Record<parametersType, valuesComponent>
interface shellFormsProps{
	index: number, colors: Array<string>, keyProp: number, deleteShip : Function, 
	reset: Function, settings : Record<string, any>, size: number
}
interface formDataT{
	caliber: number, muzzleVelocity: number, dragCoefficient: number, mass: number, 
	krupp: number, fusetime: number, threshold: number, normalization: number, 
	ra0: number, ra1: number, HESAP: number, name: string, colors: string[]
}
class ShellForms extends React.Component<shellFormsProps> {
	parameters : React.RefObject<ShellParameters> = React.createRef<ShellParameters>()
	defaults : React.RefObject<DefaultShips> = React.createRef<DefaultShips>()
	nameForm : React.RefObject<ParameterForm> = React.createRef<ParameterForm>()
	formLabels : formValuesT = Object.seal({
		caliber: ['Caliber', 'm', React.createRef()], 
		muzzleVelocity: ['Muzzle Velocity', 'm/s', React.createRef()], 
		dragCoefficient: ['Drag Coefficient', '(1)', React.createRef()],
		mass: ['Mass', 'kg', React.createRef()], 
		krupp: ['Krupp', '(1)', React.createRef()], 
		fusetime: ['Fusetime', 's', React.createRef()], 
		threshold: ['Fusing Threshold', 'mm', React.createRef()], 
		normalization: ['Normalization', '°', React.createRef()], 
		ra0: ['Start Ricochet', '°', React.createRef()], 
		ra1: ['Always Ricochet', '°', React.createRef()], 
		HESAP: ['HE/SAP penetration', 'mm', React.createRef()],
	})
	formData : formDataT = Object.seal({
		caliber: 0, muzzleVelocity: 0, dragCoefficient: 0,
		mass: 0, krupp: 0, fusetime: 0, threshold: 0, 
		normalization: 0, ra0: 0, ra1: 0, HESAP: 0,
		name : '', colors : this.props.colors,
	})
	returnData = () => {return this.formData;}
	handleNameChange = (value, id) => {this.formData.name = value;}
	handleValueChange = (value : string, k : string) => {
		this.formData[k] = parseFloat(value);
	}
	getDefaultData = (data, nameUnprocessed : string) => { //Query Version End
		let name = nameUnprocessed;
		if(this.props.settings.format.shortNames){
			name = name.split("_").slice(1).join(" ");
		}
		this.formData.caliber = data.bulletDiametr;
		this.formData.muzzleVelocity = data.bulletSpeed;
		this.formData.dragCoefficient = data.bulletAirDrag;
		this.formData.mass = data.bulletMass;
		this.formData.krupp = data.bulletKrupp;
		this.formData.fusetime = data.bulletDetonator;
		this.formData.threshold = data.bulletDetonatorThreshold;
		this.formData.normalization = data.bulletCapNormalizeMaxAngle;
		this.formData.ra0 = data.bulletRicochetAt;
		this.formData.ra1 = data.bulletAlwaysRicochetAt;
		this.formData.HESAP = data.alphaPiercingHE;
		this.formData.name = name; this.nameForm.current!.updateValue(name);
		if(data.alphaPiercingCS > this.formData.HESAP){this.formData.HESAP = data.alphaPiercingCS;}
		if(this.parameters.current){this.parameters.current!.updateShells();}
		//console.log(this.props.size, this.props.index);
		if(this.props.index + 1 === this.props.size){
			//only resets add / delete when last item has finished mounting
			//otherwise potential for crashes when adding ships
			this.props.reset();
		}
	}
	deleteShip = () => {this.props.deleteShip(this.props.keyProp, this.props.index);}
	render() {
		return(
			<Modal.Dialog>
				<Modal.Header closeButton onHide={this.deleteShip} style={{padding: "0.5rem"}}>
					<Modal.Title style={{marginLeft: "40%", marginRight: "auto", }}>Shell {this.props.index + 1}</Modal.Title>
				</Modal.Header>
				<Modal.Body style={{padding: "0.5rem"}}>
					<Container style={{padding: 0}}>
					<Col sm='12' style={{padding: 0}}>
						<ParameterForm label="Shell Label" controlId='shipName'
								handleValueChange={this.handleNameChange}
								type="text" newValue="" labelWidth={3}
								ref={this.nameForm} style={{formControl: {width: '70%'}}}/>
						<hr style={{marginTop: 0}}/>
						<DefaultShips sendDefault={this.getDefaultData} ref={this.defaults} 
						reset={this.props.reset} index={this.props.index}/>
					</Col>
					</Container>
				</Modal.Body>
				<Modal.Footer style={{padding: "0.5rem"}}>
					<Container>
					<OverlayTrigger trigger="click" placement="bottom" overlay={
							<Popover id='popover'>
								<Popover.Content>
								<Container style={{padding: 0}}>
									<Col sm="12" style={{padding: 0}}>
									<ShellParameters handleValueChange={this.handleValueChange}
										formLabels={this.formLabels} ref={this.parameters} formValues={this.formData}/>
									</Col>
								</Container>
								</Popover.Content>
							</Popover>
						}>
						<Button variant="dark">Detailed Parameters</Button>
					</OverlayTrigger>
					</Container>
				</Modal.Footer>
			</Modal.Dialog>
		);
	}
	componentDidMount(){this.defaults.current!.queryVersion();}
}
export {ShellForms};

class ShellFormsContainer extends React.Component<{settings : T.settingsT}, {keys: Set<number>, disabled: boolean}>{
	state = {keys: new Set([0, 1]), disabled: false}; deletedKeys: number[] = [];
	shellRefs = [React.createRef<ShellForms>(), React.createRef<ShellForms>()];
	scrollRef : React.RefObject<HTMLHeadingElement> = React.createRef<HTMLHeadingElement>();
	addShip = () => {
		if(this.state.disabled && (this.state.keys.size > 0)){return;}
		else{
			let index: number = 0;
			if(this.deletedKeys.length > 0){
				index = this.deletedKeys.pop()!;
			}else{
				index = this.state.keys.size;
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
				let set = this.state.keys; set.delete(key); this.deletedKeys.push(key);
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
		const colorSettings = this.props.settings.format.colors;
		const hue = number * 137.507764 % 360; // use golden angle approximation
		const saturation = String(colorSettings.saturation * 100) + '%';
		const light = String(colorSettings.light * 100) + '%';
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
	<Container style={{marginBottom : "0rem", paddingRight: 0, paddingLeft: 0, maxWidth: '90%'}}>
		<Row>
		{Array.from(this.state.keys).map((value, i) => {
			return <Col key={value} style={{margin: 0, padding: "0.5rem"}} sm="4">
				<ShellForms colors={this.generateColors(i, this.state.keys.size)} index={i} deleteShip={this.deleteShip} 
				keyProp={value} ref={this.shellRefs[i]} reset={this.reset} settings={this.props.settings} size={this.state.keys.size}/>
			</Col>;
		})}
		</Row>
	</Container>
	<Row style={{marginBottom : "1rem"}}>
		<Col/>
		<Col sm="6"><Button className="form-control" variant="outline-secondary" onClick={this.addShip}>
			Add Ship</Button></Col>
		<Col/>
	</Row>
</>
		);
	}
	//componentDidUpdate(){}
}

export default ShellFormsContainer;