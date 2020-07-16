import React, {Suspense} from 'react'; import './App.css';
import {Button, Col, Row} from 'react-bootstrap';
//import { saveAs } from 'file-saver';

import * as T from './commonTypes';
import {ShellFormsContainer} from './ShellForms';
import {TargetFormsContainer} from './TargetForms';
import AllCharts from './Charts/Charts';
import {NavbarCustom} from './Navbar';
import {SettingsBar} from './SettingsBar';

import ShellWasm from '../wasm/shellWasm.wasm';
const SupportFooter = React.lazy(() => import('./SupportFooter'));

class App extends React.Component<{},{}> {
	//Refs
	SFCref = React.createRef<ShellFormsContainer>();
	TFCref = React.createRef<TargetFormsContainer>();
	Settingsref = React.createRef<SettingsBar>();
	graphsRef : React.RefObject<AllCharts> = React.createRef<AllCharts>();
	navRef : React.RefObject<NavbarCustom> = React.createRef<NavbarCustom>();

	//Navbar Links
	links : T.linkT = Object.seal({
		parameters : [], 
		impact : [], 
		angle : [], 
		post : [],
	});

	// Wasm
	instance : any; // Wasm Instance
	arrayIndices : Record<string, Record<string, number>> = Object.seal({
		impactDataIndex: {}, angleDataIndex: {}, postPenDataIndex: {} 
	}); //Condensed wasm enums

	// Settings Data
	settings : T.settingsT = Object.seal({ //*implement component
		distance: {min: 0, max: undefined, stepSize: 1000, },
		calculationSettings: {
			calculationMethod: 1, timeStep: 0.02,
			launchAngle : {min: 0, max: 25, precision: 0.1},
		},
		format: {
			rounding: 3, shortNames: true, legendPosition: 'right',
			colors : {
				hueMin: 0, hueMax: 360,
				chromaMin: 40, chromaMax: 70,
				lightMin: 15, lightMax: 85,
			}
		},
		line: {
			showLine: true, pointRadius: 2, pointHitRadius: 5
		}
	});
	// Calculated Data
	calculatedData: T.calculatedData;
	referenceLineSize: Readonly<number> = 251;

	//Compile Wasm 
	compile = () : void => {
		return ShellWasm().then((M) => {
			this.instance = new M.shell(2);
			Object.entries(this.arrayIndices).forEach(([k, v]: any) => {
				Object.entries(M[k]).forEach(([k1, v1]: any) => {
					if(k1 !== "values"){v[k1] = v1.value;}
				});
			});
			//return "done";
		});
	}
	constructor(props){
		super(props); this.compile();
		this.calculatedData = {
			impact: {
				rawPen : [],
				ePenHN : [],
				impactAHD : [],
				ePenDN : [],
				impactADD : [],
				impactV: [],
				tToTargetA: [],
			}, angle: {
				armorD : [],
				fuseD : [],
				ra0D : [],
				ra1D : [],
			}, post: {
				shipWidth : [],
				notFused: [],
				fused: [],
			},
			numShells : 2, names : [], colors : [],
			targets : Array<T.targetDataNoAngleT>(1), angles : [], 
			refAngles : [], refLabels : [],
		}
	}

	// Setup calculations - update with new general settings
	applyCalculationSettings = () : void => {
		const {instance} = this; 
		const calcSettings = this.settings.calculationSettings;
		const {launchAngle} = calcSettings;
		instance.setMax(launchAngle.max); 
		instance.setMin(launchAngle.min);
		instance.setPrecision(launchAngle.precision);
		instance.setDtMin(calcSettings.timeStep);
	}

	// Select calculation [numerical analysis algorithm] type
	calcImpact = (method) : void => {
		const calcImpactFunc = {
			0: _=> this.instance.calcImpactAdamsBashforth5(),
			1: _=> this.instance.calcImpactForwardEuler(),
			2: _=> this.instance.calcImpactRungeKutta2(),
			3: _=> this.instance.calcImpactRungeKutta4()
		};
		if (method in calcImpactFunc){calcImpactFunc[method]();}
		else{console.error('Error', method); throw new Error('Invalid parameter');}
	}
	
	// Calculate and generate data for charts
	private initializePoint = (target, shell : number) => {
		Object.entries(target).forEach(([label, points] : [string, T.scatterPoint[][]]) => {
			points[shell] = [];
		});
	}
	private makeImpactPoints = (shell, index, dist) => {
		const pointFunction = (index, dataType, shell) => {
			return this.instance.getImpactPoint(index, this.arrayIndices.impactDataIndex[dataType], shell);
		}
		return this.makePoint(shell, index, dist, 'impact', pointFunction);
	}
	private makeAnglePoints = (shell, index, dist) => {
		const pointFunction = (index, dataType, shell) => {
			return this.instance.getAnglePoint(index, this.arrayIndices.angleDataIndex[dataType], shell);
		}
		return this.makePoint(shell, index, dist, 'angle', pointFunction);
	}
	private makePoint = (shell, index, dist, target : 'impact'| 'angle', pointFunction) => {
		const {calculatedData} = this;
		Object.entries(calculatedData[target]).forEach(([dataType, output] : [string, T.pointArrays]) => {
			output[shell][index] = {x: dist, y: pointFunction(index, dataType, shell)};
		});
	}
	generate = () : void => {
		const shellData = this.SFCref.current!.returnShellData();
		const tgtData = this.TFCref.current!.returnData();
		const numShells: number = shellData.length;
		if(this.instance === undefined) return;
		if(numShells <= 0){return
		}else{
			const {instance, arrayIndices, calculatedData} = this;
			instance.resize(numShells); calculatedData.numShells = numShells;
			this.applyCalculationSettings();
			//Update Shell Data
			shellData.forEach((value, i) => {
				instance.setValues(
					value.caliber, 
					value.muzzleVelocity, 
					value.dragCoefficient,
					value.mass, 
					value.krupp, 
					value.normalization,
					value.fusetime, 
					value.threshold, 
					value.ra0,
					value.ra1, 
					value.HESAP, 
					i
				);
			})
			//Run Computations
			this.calcImpact(this.settings.calculationSettings.calculationMethod);
			instance.calcAngles(
				tgtData.armor, 
				tgtData.inclination
			);
			instance.calcPostPen(
				tgtData.armor, 
				tgtData.inclination,
				tgtData.angles, 
				true, 
				true
			);
			//Post-Processing
			const impactSize: number = instance.getImpactSize(), numAngles: number = tgtData.angles.length;
			calculatedData.angles = tgtData.angles;
			calculatedData.targets[0] = {
				armor: tgtData.armor, 
				inclination: tgtData.inclination, 
				width: tgtData.width
			}
			shellData.forEach((value, i) => {
				calculatedData.names[i] = value.name; 
				calculatedData.colors[i] = value.colors;
			});
			for(let j=0; j<numShells; ++j){
				this.initializePoint(calculatedData.impact, j);
				this.initializePoint(calculatedData.angle, j);
				for(let i=0; i<numAngles; ++i){
					calculatedData.post.notFused[i+j*numAngles] = [];
					calculatedData.post.fused[i+j*numAngles] = [];
				}
			}
			let maxDist = 0; //Maximum Distance for shipWidth
			// Converts flat array data format to {x, y} format for chart.js
			for(let j=0; j<numShells; ++j){ // iterate through shells
				for(let i=0; i<impactSize; ++i){ // iterate through points at each range
					const dist : number = instance.getImpactPoint(i, arrayIndices.impactDataIndex.distance, j);
					maxDist = Math.max(maxDist, dist);
					this.makeImpactPoints(j, i, dist); this.makeAnglePoints(j, i, dist);
					for(let k=0; k<numAngles; ++k){
						const detDist : number
							= instance.getPostPenPoint(i, arrayIndices.postPenDataIndex.x, k, j);
						const fused : number // = detDist when fused, otherwise = -1
							= instance.getPostPenPoint(i, arrayIndices.postPenDataIndex.xwf, k, j);
						const point : T.scatterPoint = {x: dist, y: detDist};
						// Only draw fused line if fused (fused >= 0); reverse for notFused
						if(fused < 0){
							calculatedData.post.notFused[k+j*numAngles].push(point);
						}else{
							calculatedData.post.fused[k+j*numAngles].push(point);
						}
					}
				}
			}
			//Generate Ship Width Line 
			const stepSize = this.settings.distance.stepSize !== undefined ? this.settings.distance.stepSize: 2000;
			const maxAdj = Math.ceil(maxDist / stepSize) * stepSize;
			calculatedData.post.shipWidth = [[],];
			const SWE = calculatedData.post.shipWidth.entries();
			for(const [, singleShipWidth] of SWE){
				const length = this.referenceLineSize - 1;
				for(let i=0; i < length+1; ++i){
					const xV : number = i / length * maxAdj;
					singleShipWidth[i] = {
						x: xV, 
						y: tgtData.width
					};
				}
			}
			//Angle Chart Annotations / Labels
			calculatedData.refLabels = tgtData.refLabels;
			calculatedData.refAngles = [];
			for(let j=0, len=calculatedData.refLabels.length; j<len; ++j){
				const temp : T.scatterPoint[] = [];
				const length = this.referenceLineSize - 1;
				for(let i=0; i < length+1; ++i){
					const xV : number = i / length * maxAdj;
					temp[i] = {
						x: xV, 
						y: tgtData.refAngles[j]
					};
				}
				calculatedData.refAngles.push(temp);
			}
			//this.updateInitialData(calculatedData);
			if(this.graphsRef.current){this.graphsRef.current.updateData(calculatedData);}
		}
	}
	/*private updateInitialData = (data) => { //Only used to for replacing initialData = not useful in release
		const fileToSave = new Blob([JSON.stringify(data)], {type: 'application/json',});
		saveAs(fileToSave, 'initialData.json');
		//const compressed = pako.deflate(JSON.stringify(data));
		//console.log(compressed);
		//const fileToSave2 = new Blob([compressed], {type: 'text/plain',});
		//saveAs(fileToSave2, 'initialData.deflate');
	}*/
	onUpdate = () => {this.navRef.current!.update();} // Update Navbar when charts are updated
	updateColors = () => { // For updating when color settings change
		if(this.SFCref.current) this.SFCref.current.updateAllCanvas();
	}	
	render () {
		return (
<div className="App">
	<NavbarCustom 
		links={this.links} 
		ref={this.navRef}
	/>
	<h1>World of Warships Ballistics Calculator</h1>
	<hr/>
	<div className="inputs">
		<div className="shells">
			<ShellFormsContainer 
				ref={this.SFCref} 
				settings={this.settings}
			/>
		</div>
		<div className="target">
			<TargetFormsContainer ref={this.TFCref}/>
		</div>
	</div>
	<hr/>
	<SettingsBar 
		settings={this.settings} 
		ref={this.Settingsref} 
		updateColors={this.updateColors}
	/>
	<hr/>
	<Row className="justify-content-sm-center">
		<Button style={{width: "75%", paddingTop: "0.6rem", paddingBottom: "0.6rem", fontSize: "1.25rem"}}
			variant="warning" onClick={this.generate}>
			Make Graphs!
		</Button>
	</Row>
	<hr/>
	<AllCharts 
		ref={this.graphsRef} 
		settings={this.settings} 
		links={this.links} 
		onUpdate={this.onUpdate}
	/>
	<Suspense fallback={<div>Loading...</div>}>
		<SupportFooter/>
	</Suspense>
</div>
		);
	}
	componentDidMount(){
		this.links.parameters.push(
			['Shell Parameters', this.SFCref.current!.scrollRef], 
			['Target Parameters', this.TFCref.current!.scrollRef], 
			['Settings', this.Settingsref.current!.scrollRef]
		);
		this.navRef.current!.updateAll();
	}
}



export default App;
