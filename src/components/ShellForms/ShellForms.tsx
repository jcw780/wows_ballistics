import React, {Suspense} from 'react';
import {Col, Row, Modal, Button, Popover, OverlayTrigger} from 'react-bootstrap';
import BootstrapSwitchButton from 'bootstrap-switch-button-react';
import distinctColors from 'distinct-colors';
import clonedeep from 'lodash.clonedeep';

import * as T from '../commonTypes';
import * as S from './Types';
import {ParameterForm} from '../UtilityComponents';
import DefaultShips from './DefaultForms'
import {ShellParametersT} from './ShellParameters';
import './ShellForms.css';

const ShellParameters = React.lazy(() => import('./ShellParameters'));
//import ShellParameters from './ShellParameters';

interface shellFormsProps{
	index: number, colors: Array<string>, keyProp: number, graph: boolean,
	deleteShip : Function, copyShip : Function,
	reset: () => void, settings : T.settingsT, size: number
	formData?: S.formDataT, defaultData?: S.defaultDataT, copied: boolean
}
export class ShellForms extends React.PureComponent<shellFormsProps> {
	public static defaultProps = {
		copied : false, graph : true
	}
	graph = this.props.graph;
	defaultData : S.defaultDataT = Object.seal({
		version: ['', [''], ['']], nation: ['', [''], ['']], shipType: ['', [''], ['']], 
		ship: ['', [''], ['']], artillery: ['', [''], ['']], shellType: ['', [''], ['']],
		queriedData: {}
	});
	formData : S.formDataT = Object.seal({
		caliber: 0, muzzleVelocity: 0, dragCoefficient: 0,
		mass: 0, krupp: 0, fusetime: 0, threshold: 0, 
		normalization: 0, ra0: 0, ra1: 0, HESAP: 0,
		name : '', colors : [],
	})
	parameters : React.RefObject<ShellParametersT> = React.createRef<ShellParametersT>()
	defaults : React.RefObject<DefaultShips> = React.createRef<DefaultShips>()
	nameForm : React.RefObject<ParameterForm> = React.createRef<ParameterForm>()
	canvasRef = React.createRef<HTMLCanvasElement>();
	formLabels : S.formLabelsT = Object.seal({
		caliber: ['Caliber', 'm', React.createRef(), 
		<>
			Diameter of the shell. <br/> 
			Effects - All else equal:
			<table id='tooltip-table'>
				<tbody>
					<tr><th>Caliber              </th><th>↑</th><th>↓</th></tr>
					<tr><td>Raw Penetration      </td><td>↓</td><td>↑</td></tr>
					<tr><td>Belt Penetration     </td><td>↓</td><td>↑</td></tr>
					<tr><td>Flight Time          </td><td>↑</td><td>↓</td></tr>
					<tr><td>Fall Angle           </td><td>↑</td><td>↓</td></tr>
					<tr><td>Likelihood to Overpen</td><td>↓</td><td>↑</td></tr>
				</tbody>
			</table>
		</>], 
		muzzleVelocity: ['Muzzle Velocity', 'm/s', React.createRef(), 
		<>
			Shell velocity as it leaves the gun.<br/> 
			Effects - All else equal: 
			<table id='tooltip-table'>
				<tbody>
					<tr><th>Muzzle Velocity      </th><th>↑</th><th>↓</th></tr>
					<tr><td>Raw Penetration      </td><td>↑</td><td>↓</td></tr>
					<tr><td>Belt Penetration     </td><td>↑</td><td>↓</td></tr>
					<tr><td>Flight Time          </td><td>↓</td><td>↑</td></tr>
					<tr><td>Fall Angle           </td><td>↓</td><td>↑</td></tr>
					<tr><td>Likelihood to Overpen</td><td>↑</td><td>↓</td></tr>
				</tbody>
			</table>
		</>], 
		dragCoefficient: ['Drag Coefficient', '(1)', React.createRef(), 
		<>
			Represents the shell geometry's <br/>
			effect on air drag. <br/>
			Effects - All else equal: 
			<table id='tooltip-table'>
				<tbody>
					<tr><th>Drag Coefficient     </th><th>↑</th><th>↓</th></tr>
					<tr><td>Raw Penetration      </td><td>↓</td><td>↑</td></tr>
					<tr><td>Belt Penetration     </td><td>↓</td><td>↑</td></tr>
					<tr><td>Flight Time          </td><td>↑</td><td>↓</td></tr>
					<tr><td>Fall Angle           </td><td>↑</td><td>↓</td></tr>
					<tr><td>Likelihood to Overpen</td><td>↓</td><td>↑</td></tr>
				</tbody>
			</table>
		</>],
		mass: ['Mass', 'kg', React.createRef(), 
		<>
			Mass of the shell. <br/>
			Effects - All else equal:
			<table id='tooltip-table'>
				<tbody>
					<tr><th>Mass                 </th><th>↑</th><th>↓</th></tr>
					<tr><td>Raw Penetration      </td><td>↑</td><td>↓</td></tr>
					<tr><td>Belt Penetration     </td><td>↑</td><td>↓</td></tr>
					<tr><td>Flight Time          </td><td>↓</td><td>↑</td></tr>
					<tr><td>Fall Angle           </td><td>↓</td><td>↑</td></tr>
					<tr><td>Likelihood to Overpen</td><td>↑</td><td>↓</td></tr>
				</tbody>
			</table>
		</>], 
		krupp: ['Krupp', '(1)', React.createRef(), 
		<>
			Constant used to linearly scale <br/>
			penetration. Effects - All else equal:
			<table id='tooltip-table'>
				<tbody>
					<tr><th>Krupp                </th><th>↑</th><th>↓</th></tr>
					<tr><td>Raw Penetration      </td><td>↑</td><td>↓</td></tr>
					<tr><td>Belt Penetration     </td><td>↑</td><td>↓</td></tr>
					<tr><td>Flight Time          </td><td>-</td><td>-</td></tr>
					<tr><td>Fall Angle           </td><td>-</td><td>-</td></tr>
					<tr><td>Likelihood to Overpen</td><td>↑</td><td>↓</td></tr>
				</tbody>
			</table>
		</>], 
		fusetime: ['Fusetime', 's', React.createRef(), 
		<>
			Time it takes for the shell to <br/> 
			explode after fusing. <br/>
			Effects - All else equal:
			<table id='tooltip-table'>
				<tbody>
					<tr><th>Fusetime             </th><th>↑</th><th>↓</th></tr>
					<tr><td>Likelihood to Overpen</td><td>↑</td><td>↓</td></tr>
				</tbody>
			</table>
		</>], 
		threshold: ['Fusing Threshold', 'mm', React.createRef(), 
		<>
			Thickness of armor needed for <br/>
			fusing to occur. <br/>
			Effects - All else equal:
			<table id='tooltip-table'>
				<tbody>
					<tr><th>Fusing Threshold     </th><th>↑</th><th>↓</th></tr>
					<tr><td>Likelihood to Overpen</td><td>↑</td><td>↓</td></tr>
				</tbody>
			</table>
		</>], 
		normalization: ['Normalization', '°', React.createRef(), 
		<>
			Ability of the shell to reduce <br/> 
			impact angle relative to the <br/>
			target. Effects - All else equal:
			<table id='tooltip-table'>
				<tbody>
					<tr><th>Normalization        </th><th>↑</th><th>↓</th></tr>
					<tr><td>Raw Penetration      </td><td>-</td><td>-</td></tr>
					<tr><td>Belt Penetration     </td><td>↑</td><td>↓</td></tr>
					<tr><td>Flight Time          </td><td>-</td><td>-</td></tr>
					<tr><td>Fall Angle           </td><td>-</td><td>-</td></tr>
					<tr><td>Likelihood to Overpen</td><td>↑</td><td>↓</td></tr>
				</tbody>
			</table>
		</>], 
		ra0: ['Start Ricochet', '°', React.createRef(), 
		<>
			Impact angle - relative to target - at <br/> 
			which shells start to have a chance <br/> 
			to ricochet. Effects - All else equal:
			<table id='tooltip-table'>
				<tbody>
					<tr><th>Start Ricochet Angle</th><th>↑</th><th>↓</th></tr>
					<tr><td>Likelihood to Ricochet</td><td>↓</td><td>↑</td></tr>
				</tbody>
			</table>
		</>], 
		ra1: ['Always Ricochet', '°', React.createRef(), 
		<>
			Impact angle - relative to target - <br/> 
			at which shells are guaranteed <br/> 
			to ricochet. Effects - All else equal:
			<table id='tooltip-table'>
				<tbody>
					<tr><th>Always Ricochet Angle</th><th>↑</th><th>↓</th></tr>
					<tr><td>Likelihood to Ricochet</td><td>↓</td><td>↑</td></tr>
				</tbody>
			</table>
		</>], 
		HESAP: ['HE/SAP Penetration', 'mm', React.createRef(), 
		<>
			Angle independent penetration <br/> of HE or SAP shells.
			<table id='tooltip-table'>
				<tbody>
					<tr><th>HE/SAP penetration</th><th>↑</th><th>↓</th></tr>
					<tr><td>Penetration</td><td>↑</td><td>↓</td></tr>
				</tbody>
			</table>
		</>],
	})
	constructor(props){
		super(props);
		// Use this instead of defaultProps to prevent weird shallow copy things from happening
		if(props.copied){
			if('defaultData' in props) this.defaultData = props.defaultData!;
			if('formData' in props) this.formData = props.formData!;	
		}
	}
	returnData = () => {
		if(this.graph) return this.formData;
		else return false;	
	}
	onNameChange = (value : string, id) => {this.formData.name = value};
	handleValueChange = (value : string, k : S.formsT) => this.formData[k] = parseFloat(value);
	getDefaultData = (data, nameUnprocessed : string) => { //Query Version End
		let name = nameUnprocessed; const {formData, props} = this;
		if(this.props.settings.format.shortNames) name = name.split("_").slice(1).join(" ");
		formData.name = name; this.nameForm.current!.updateValue(name);
		formData.caliber = data.bulletDiametr;
		formData.muzzleVelocity = data.bulletSpeed;
		formData.dragCoefficient = data.bulletAirDrag;
		formData.mass = data.bulletMass;
		formData.krupp = data.bulletKrupp;
		formData.fusetime = data.bulletDetonator;
		formData.threshold = data.bulletDetonatorThreshold;
		formData.normalization = data.bulletCapNormalizeMaxAngle;
		formData.ra0 = data.bulletRicochetAt;
		formData.ra1 = data.bulletAlwaysRicochetAt;
		formData.HESAP = data.alphaPiercingHE > data.alphaPiercingCS ? data.alphaPiercingHE : data.alphaPiercingCS;
		
		if(this.parameters !== undefined && this.parameters !== null){
			if(this.parameters.current !== undefined && this.parameters.current !== null) this.parameters.current!.updateShells();
		}
		//only resets add / delete when last item has finished mounting
		//otherwise potential for crashes when adding ships
		if(props.index + 1 === props.size) props.reset();
	}
	deleteShip = () => this.props.deleteShip(this.props.keyProp, this.props.index);
	copyShip = () => this.props.copyShip(this.defaultData, this.formData, this.graph);
	updateCanvas = () => {
		//Draws colors 
		const {formData, props} = this;
		formData.colors = props.colors.slice(props.index * 3, props.index * 3 + 3);
		const ctx = this.canvasRef.current!.getContext('2d');
		const height : number = this.canvasRef.current!.height;
		const width : number = this.canvasRef.current!.width;

		const arrayLength = formData.colors.length;
		const interval : number = width / arrayLength;
		const shift : number = 10;
		formData.colors.forEach((color, i) => {
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
	toggleGraph = checked => {this.graph = checked};
	render() {
		const {props} = this;
		return(
<Modal.Dialog>
	<Modal.Header closeButton onHide={this.deleteShip}>
		<Modal.Title style={{marginLeft: "40%", marginRight: "auto", }}>Shell {props.index + 1}</Modal.Title>
	</Modal.Header>
	<Modal.Body>
		<ParameterForm ref={this.nameForm}
			type="text" 
			labelWidth={3} 
			style={{formControl: {width: '70%'}, formGroup: {marginBottom: ".5rem"}}}
			controlId='shipName' 
			ariaLabel="Ship Name"
			newValue={this.formData.name}
			onChange={this.onNameChange}
		>
			Shell Label
		</ParameterForm>
		<Row style={{marginBottom: ".5rem"}} className="no-lr-padding">
			<Col sm="3" style={{paddingLeft: '15px', paddingRight: '15px'}}>
				Colors
			</Col>
			<Col sm="8" className="no-lr-padding">
				<canvas style={{maxHeight: "1.5rem", width: "100%"}} 
					width="600" 
					height="150" 
					ref={this.canvasRef}
				/>
			</Col>
		</Row>
		<BootstrapSwitchButton style='switch-toggle common-margin'
			onlabel='Graph' 
			offlabel='Do Not Graph' 
			onstyle='success' 
			offstyle='danger'
			onChange={this.toggleGraph} 
			checked={this.graph}
		/>
		<hr style={{marginTop: 0}}/>
		<DefaultShips ref={this.defaults}
			sendDefault={this.getDefaultData} 
			defaultData={this.defaultData}
			keyProp={props.keyProp}
			reset={props.reset} 
			index={props.index} 
		/>
	</Modal.Body>
	<Modal.Footer>				
		<Col className="footer-style">
			<OverlayTrigger trigger="click" placement="bottom-start" overlay={
					<Popover id='popover'>
						<Popover.Content>
							<Suspense fallback={<div>Loading...</div>}>
								<ShellParameters ref={this.parameters} 
									handleValueChange={this.handleValueChange}
									formLabels={this.formLabels} 
									formData={this.formData}
								/>
							</Suspense>
						</Popover.Content>
					</Popover>
				}>
				<Button className="footer-button" variant="dark">Raw Input</Button>
			</OverlayTrigger>
		</Col>
		<Col className="footer-style">
			<Button variant="dark" className="footer-button" 
				onClick={this.copyShip} 
			>Clone</Button>
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
		if(!this.props.copied) this.defaults.current!.queryVersion();
		else this.props.reset();
	}
	componentDidUpdate(){
		this.updateCanvas();
		// Allow additions when final component updates after deletion
		// Update to final index will only occur on deletion
		if(this.props.index === this.props.size - 1) this.props.reset();
	}
}

interface copyTempT {
	default: S.defaultDataT, data: S.formDataT, graph: boolean
}
export class ShellFormsContainer extends React.Component<{settings : T.settingsT}, {keys: Set<number>, disabled: boolean}>{
	state = {keys: new Set([0, 1]), disabled: false}; deletedKeys: number[] = [];
	//Refs
	shellRefs = [React.createRef<ShellForms>(), React.createRef<ShellForms>()];
	scrollRef : React.RefObject<HTMLHeadingElement> = React.createRef<HTMLHeadingElement>();	
	//Clone function
	copyTemp : copyTempT; copied : boolean = false; colors : string[] = [];

	addShip = () => {
		const {state} = this;
		if(state.disabled && (state.keys.size > 0)){return;}
		else{
			let index: number = 0;
			if(this.deletedKeys.length > 0){
				index = this.deletedKeys.pop()!;
			}else{
				index = state.keys.size;
			}
			this.shellRefs.push(React.createRef<ShellForms>());
			this.setState((current) => {
				let set = current.keys;
				return {keys: set.add(index), disabled: true};
			});
		}
	}
	deleteShip = (key, index) => {
		const {state} = this;
		if(state.disabled){return;}
		else{
			if(state.keys.size > 0){
				let set = state.keys; set.delete(key); this.deletedKeys.push(key);
				this.shellRefs.splice(index, 1);
				this.setState((current) => {
					return {keys: set, disabled: true};
				});
			}
		}
	}
	copyShip = (defaultData : S.defaultDataT, shellData : S.formDataT, graph : boolean) => {
		this.copyTemp = {default: defaultData, data: shellData, graph: graph};
		this.copied = true; this.addShip();
	}
	returnShellData = () => {
		let data = Array<S.formDataT>();
		this.shellRefs.forEach((reference, i) => {
			const returnedData : S.formDataT | false = reference.current!.returnData();
			if(returnedData !== false){
				data.push(returnedData);
			}
		});
		return data;
	}
	updateColors = () => {
		const colorSettings = this.props.settings.format.colors;
		const colors = distinctColors({
			count: this.state.keys.size * 3, ...colorSettings
		});
		this.colors.length = 0;
		colors.forEach((color) => {
			this.colors.push(color.toString());
		})
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
	private addShellForm = (key : number, index : number, copied : boolean) => {
		const {props, state} = this;
		const ref = this.shellRefs[index], stateKeys = state.keys.size;
		//Key not needed - added later in surrounding component
		if(!copied){
			return(
				<div key={key}>
				<ShellForms keyProp={key} 
					ref={ref}
					index={index}
					colors={this.colors} 
					deleteShip={this.deleteShip} 
					copyShip={this.copyShip}
					reset={this.reset} 
					settings={props.settings} 
					size={stateKeys} 
					copied={copied}
				/>
				</div>
			);
		}else{
			//pass a deep copied version so clones target the correct shell form
			const copyTemp = this.copyTemp;
			return( 
				<div key={key}>
				<ShellForms keyProp={key} 
					ref={ref}
					index={index}
					colors={this.colors}
					deleteShip={this.deleteShip} 
					copyShip={this.copyShip}
					reset={this.reset} 
					settings={props.settings} 
					size={stateKeys} 
					copied={copied}
					defaultData={clonedeep(copyTemp.default)} 
					formData={clonedeep(copyTemp.data)}
					graph={copyTemp.graph}
				/>
				</div>
			);
		}
		
	}
	private generateShellForms = () => {
		const stateKeys = Array.from(this.state.keys);
		const output : JSX.Element[] = [];
		if(this.copied){
			stateKeys.forEach((value, i) => {
				if(i !== stateKeys.length - 1){
					output.push(this.addShellForm(value, i, false));
				}else{
					output.push(this.addShellForm(value, i, true));
				}
			});
		}else{
			stateKeys.forEach((value, i) => {
				output.push(this.addShellForm(value, i, false));
			})
		}
		return(
			<div className="shellForms-wrapper">
				{output}
			</div>
		);
	}
	render(){
		this.updateColors();
		return(
<>
	<h2 ref={this.scrollRef}>Shell Parameters</h2>
		{this.generateShellForms()}
	<Row style={{marginBottom : "1rem"}} className="justify-content-sm-center">
		<Col sm="6">
			<Button className="form-control" variant="outline-secondary" onClick={this.addShip}>
				Add Ship
			</Button>
		</Col>
	</Row>
</>
		);
	}
	componentDidUpdate(){
		this.copied = false;
	}
}

export default ShellFormsContainer;