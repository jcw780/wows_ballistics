import React from 'react';
import {Form, Col, Row, Modal, Container, Button, ToggleButtonGroup, ToggleButton, Popover, OverlayTrigger} from 'react-bootstrap';

import * as T from './commonTypes';
import {ParameterForm} from './ParameterForm';
import DefaultShips from './DefaultForms'
import DownloadButton from './DownloadButton';

enum valuesComponentIndex {name, unit, ref}
type valuesComponent = [string, string, React.RefObject<ParameterForm>];
type parametersType = 'caliber' | 'muzzleVelocity' | 'dragCoefficient' | 'mass' 
| 'krupp' | 'fusetime' | 'threshold' | 'normalization' | 'ra0' | 'ra1' | 'HESAP';
type formValuesT = Record<parametersType, valuesComponent>

interface shellParametersProps {handleValueChange: any, formLabels : formValuesT, formValues: formDataT}
class ShellParameters extends React.Component<shellParametersProps>{
	nameForm = React.createRef<ParameterForm>();
	downloadRef = React.createRef<DownloadButton>();
	handleValueChange = (value, k) => {this.props.handleValueChange(value, k);}
	updateShells() {
		Object.entries(this.props.formLabels).forEach(([key, value] : any): void => {
			value[valuesComponentIndex.ref].current.updateValue(this.props.formValues[key]);
		});
	}
	updateDownloadJSON = () => {
		const selectedData = Object.assign({}, this.props.formValues);
		delete selectedData.colors;
        const url = URL.createObjectURL(new Blob([JSON.stringify(selectedData)], {type: 'text/json;charset=utf-8'}));
        this.downloadRef.current!.update(url, this.props.formValues.name + '.json');
    }
	render() {
		return(
			<>
				<Form>
					{Object.entries(this.props.formLabels).map(([key, value] : any, i) => {
						return (<ParameterForm label={value[valuesComponentIndex.name]} key={i} controlId={key}
						handleValueChange={this.handleValueChange}
						type="number" newValue={String(this.props.formValues[key])} append={value[valuesComponentIndex.unit]}
						ref={this.props.formLabels[key][valuesComponentIndex.ref]} style={{inputGroup:{width: "50%"}}}/>);
					})}	
				</Form>
				<Row>
					<Col sm="3"/>
					<Col sm="6">
					<DownloadButton label="Download Raw" updateData={this.updateDownloadJSON} ref={this.downloadRef} style={{width: "100%"}}/>
					</Col>
					<Col sm="3"/>
				</Row>
			</>
		);
	}
}

interface shellFormsProps{
	index: number, colors: Array<string>, keyProp: number, deleteShip : Function, copyShip : Function,
	reset: () => void, settings : T.settingsT, size: number
	formData?: formDataT, defaultData?: T.defaultDataT, copied: boolean
}
interface formDataT{
	caliber: number, muzzleVelocity: number, dragCoefficient: number, mass: number, 
	krupp: number, fusetime: number, threshold: number, normalization: number, 
	ra0: number, ra1: number, HESAP: number, name: string, colors: string[]
}
export class ShellForms extends React.Component<shellFormsProps> {
	public static defaultProps = {
		copied : false
	}
	graph = true;
	defaultData : T.defaultDataT = Object.seal({
		version: ['', ['']], nation: ['', ['']], shipType: ['', ['']], 
		ship: ['', ['']], artillery: ['', ['']], shellType: ['', ['']],
		queriedData: {}
	});
	formData : formDataT = Object.seal({
		caliber: 0, muzzleVelocity: 0, dragCoefficient: 0,
		mass: 0, krupp: 0, fusetime: 0, threshold: 0, 
		normalization: 0, ra0: 0, ra1: 0, HESAP: 0,
		name : '', colors : [],
	})
	constructor(props){
		super(props);
		// Use this instead of defaultProps to prevent weird shallow copy things from happening
		if('defaultData' in this.props){
			this.defaultData = this.props.defaultData!;
		}
		if('formData' in this.props){
			this.formData = this.props.formData!;
		}
	}
	parameters : React.RefObject<ShellParameters> = React.createRef<ShellParameters>()
	defaults : React.RefObject<DefaultShips> = React.createRef<DefaultShips>()
	nameForm : React.RefObject<ParameterForm> = React.createRef<ParameterForm>()
	canvasRef = React.createRef<HTMLCanvasElement>();
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
	returnData = () => {
		if(this.graph){
			return this.formData;
		}else{
			return false;
		}
	}
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
		if(this.props.index + 1 === this.props.size){
			//only resets add / delete when last item has finished mounting
			//otherwise potential for crashes when adding ships
			this.props.reset();
		}
	}
	deleteShip = () => {this.props.deleteShip(this.props.keyProp, this.props.index);}
	copyShip = () => {
		const outDefault = Object.assign({}, this.defaultData);
		const outForm = Object.assign({}, this.formData);
		this.props.copyShip(outDefault, outForm);
	}
	updateCanvas = () => {
		//Draws colors 
		this.formData.colors = this.props.colors.slice(this.props.index * 3, this.props.index * 3 + 3);
		const ctx = this.canvasRef.current!.getContext('2d');
		const height : number = this.canvasRef.current!.height;
		const width : number = this.canvasRef.current!.width;

		const arrayLength = this.formData.colors.length;
		const interval : number = width / arrayLength;
		const shift : number = 10;
		this.formData.colors.forEach((color, i) => {
			const region = new Path2D();
			if(i === 0){
				region.moveTo(0, 0);
				region.lineTo(0, height);
			}else{
				region.lineTo(i * interval - shift, 0);
				region.lineTo(i * interval + shift, height);
			}

			const i2 : number = i + 1;
			if(i === arrayLength - 1){
				region.lineTo(i2 * interval, height);
				region.lineTo(i2 * interval, 0);
			}else{
				region.lineTo(i2 * interval + shift, height);
				region.lineTo(i2 * interval - shift, 0);
			}
			ctx!.fillStyle = color; ctx!.fill(region);
		});
	}
	toggleGraph = (event) => {
		console.log(event.target.checked);
		this.graph = event.target.checked;
	}
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
						type="text" newValue={this.formData.name} labelWidth={3}
						ref={this.nameForm} style={{formControl: {width: '70%'}, formGroup: {marginBottom: ".5rem"}}}/>
						<Row style={{marginBottom: ".5rem"}}>
							<Col sm="3" className="no-lr-padding">Colors</Col>
							<Col sm="8" className="no-lr-padding">
								<canvas style={{height: "2rem", width: "100%"}} width="600" height="150" ref={this.canvasRef}/>
							</Col>
						</Row>
						<ToggleButtonGroup type="checkbox" vertical defaultValue={[true]} style={{marginBottom: ".5rem"}}>
							<ToggleButton onChange={this.toggleGraph} value={true} variant="secondary">Graph Shell</ToggleButton>
						</ToggleButtonGroup>
						<hr style={{marginTop: 0}}/>
						<DefaultShips sendDefault={this.getDefaultData} ref={this.defaults} keyProp={this.props.keyProp}
						reset={this.props.reset} index={this.props.index} defaultData={this.defaultData}/>
					</Col>
					</Container>
				</Modal.Body>
				<Modal.Footer style={{padding: "0.5rem"}}>				
					<Col className="no-lr-padding">
						<OverlayTrigger trigger="click" placement="bottom-start" overlay={
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
							<Button style={{width: "100%"}} variant="dark">Raw Parameters</Button>
						</OverlayTrigger>
					</Col>
					<Col className="no-lr-padding">
						<Button style={{width: "100%"}} onClick={this.copyShip} variant="dark" >Clone</Button>
					</Col>
				</Modal.Footer>
			</Modal.Dialog>
		);
	}
	componentDidMount(){
		this.updateCanvas();
		// Resets if it is a copied component
		// Copied components do not change internal components 
		// and would not properly reset - through this.getDefaultData
		if(!this.props.copied){
			this.defaults.current!.queryVersion();
		}else{
			this.props.reset();
		}
	}
	componentDidUpdate(){
		this.updateCanvas();
		// Allow additions when final component updates after deletion
		// Update to final index will only occur on deletion
		if(this.props.index === this.props.size - 1){
			this.props.reset();
		}
	}
}

interface copyTempT {
	default: T.defaultDataT, data: formDataT
}
export class ShellFormsContainer extends React.Component<{settings : T.settingsT}, {keys: Set<number>, disabled: boolean}>{
	state = {keys: new Set([0, 1]), disabled: false}; deletedKeys: number[] = [];
	//Refs
	shellRefs = [React.createRef<ShellForms>(), React.createRef<ShellForms>()];
	scrollRef : React.RefObject<HTMLHeadingElement> = React.createRef<HTMLHeadingElement>();	
	//Clone function
	copyTemp : copyTempT;
	copied : boolean = false;

	colors : string[] = [];

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
	copyShip = (defaultData : T.defaultDataT, shellData : formDataT) => {
		const data: copyTempT = {default: defaultData, data: shellData}
		this.copyTemp = data; this.copied = true;
		this.addShip();
	}
	returnShellData = () => {
		let data = Array<formDataT>();
		this.shellRefs.forEach((reference, i) => {
			const returnedData : formDataT | false = reference.current!.returnData();
			if(returnedData !== false){
				data.push(returnedData);
			}
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
	updateColors = () => {
		this.colors.length = 0;
		for(let i=0; i<this.state.keys.size * 3; i++){
			this.colors[i] = this.selectColor(i, this.state.keys.size * 3);
		}
	}
	updateAllCanvas = () => {
		this.updateColors();
		this.shellRefs.forEach((ref) => {
			ref.current!.updateCanvas();
		})
	}

	reset = () : void => {
		if(this.state.disabled){
			this.setState((current) => {
				return {keys: current.keys, disabled: false}
			});
		}
	}
	shouldComponentUpdate(nextProps, nextState){return nextState.disabled;}
	render(){
		this.updateColors();
		const generateShellForms = () => {
			if(this.copied){
				const stateKeys = Array.from(this.state.keys);
				let returnValue : JSX.Element[] = [];
				for(let i=0; i< stateKeys.length - 1; i++){
					const value = stateKeys[i];
					returnValue.push(
						<Col key={value} style={{margin: 0, padding: "0.5rem"}} sm="4">
							<ShellForms colors={this.colors} index={i}
							deleteShip={this.deleteShip} copyShip={this.copyShip}
							keyProp={value} ref={this.shellRefs[i]} reset={this.reset} 
							settings={this.props.settings} size={this.state.keys.size}/>
						</Col>
					)
				}
				const i = stateKeys.length - 1
				const value = stateKeys[i];
				returnValue.push(
					<Col key={value} style={{margin: 0, padding: "0.5rem"}} sm="4">
						<ShellForms colors={this.colors} index={i}
						deleteShip={this.deleteShip} copyShip={this.copyShip}
						keyProp={value} ref={this.shellRefs[i]} reset={this.reset} 
						settings={this.props.settings} size={this.state.keys.size}
						defaultData={this.copyTemp.default} formData={this.copyTemp.data} copied={true}/>
					</Col>
				)
				return returnValue;
			}else{
				return Array.from(this.state.keys).map((value, i) => {
					return <Col key={value} style={{margin: 0, padding: "0.5rem"}} sm="4">
						<ShellForms colors={this.colors} index={i}
						deleteShip={this.deleteShip} copyShip={this.copyShip}
						keyProp={value} ref={this.shellRefs[i]} reset={this.reset} 
						settings={this.props.settings} size={this.state.keys.size}/>
					</Col>;
				})
			}
		}
		return(
<>
	<h2 ref={this.scrollRef}>Shell Parameters</h2>
	<Container style={{marginBottom : "0rem", paddingRight: 0, paddingLeft: 0, maxWidth: '90%'}}>
		<Row>
		{generateShellForms()}
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
	componentDidUpdate(){
		this.copied = false;
	}
}

export default ShellFormsContainer;