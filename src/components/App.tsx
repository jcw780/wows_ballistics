import React from 'react'; import './App.css';
import {Button, Col, Row} from 'react-bootstrap';
import { saveAs } from 'file-saver';

import * as T from './commonTypes';
import ShellFormsContainer from './ShellForms/ShellForms';
import TargetFormsContainer from './TargetForms';
import AllCharts from './Charts';
import NavbarCustom from './Navbar';
import SettingsBar from './SettingsBar/SettingsBar';

import ShellWasm from '../wasm/shellWasm.wasm';
class App extends React.Component<{},{}> {
	//Refs
	SFCref = React.createRef<ShellFormsContainer>();
	TFCref = React.createRef<TargetFormsContainer>();
	Settingsref = React.createRef<SettingsBar>();
	graphsRef : React.RefObject<AllCharts> = React.createRef<AllCharts>();
	navRef : React.RefObject<NavbarCustom> = React.createRef<NavbarCustom>();

	//Navbar Links
	links : T.linkT = {parameters : [], impact : [], angle : [], post : [],}

	// Wasm
	instance : any; // Wasm Instance
	arrayIndices : Record<string, Record<string, number>> = {
		impactDataIndex: {}, angleDataIndex: {}, postPenDataIndex: {} 
	} //Condensed wasm enums

	// Settings Data
	settings : T.settingsT = { //*implement component
		distance: {min: 0, max: undefined, stepSize: 1000, },
		calculationSettings: {
			calculationMethod: 1, timeStep: 0.02,
			launchAngle : {min: 0, max: 25, precision: 0.1},
		},
		format: {
			rounding: 3, shortNames: true, showLine: true,
			colors : {
				hueMin: 0, hueMax: 360,
				chromaMin: 40, chromaMax: 70,
				lightMin: 15, lightMax: 85,
			}
		},
	}
	// Calculated Data
	calculatedData: T.calculatedData
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
		//initialize calculatedData
		const numShells = 2, impactSize = 251, numAngles = 8;
		const createNewPointArray = (lines, points) => {
			return Array.from({length: lines}, _ => new Array<T.scatterPoint>(points))
		}

		this.calculatedData = {
			impact: {
				rawPen : createNewPointArray(numShells, impactSize),
				ePenHN : createNewPointArray(numShells, impactSize),
				impactAHD : createNewPointArray(numShells, impactSize),
				ePenDN : createNewPointArray(numShells, impactSize),
				impactADD : createNewPointArray(numShells, impactSize),
				impactV: createNewPointArray(numShells, impactSize),
				tToTargetA: createNewPointArray(numShells, impactSize),
			}, angle: {
				armorD : createNewPointArray(numShells, impactSize),
				fuseD : createNewPointArray(numShells, impactSize),
				ra0D : createNewPointArray(numShells, impactSize),
				ra1D : createNewPointArray(numShells, impactSize),
			}, post: {
				shipWidth : createNewPointArray(1, this.referenceLineSize),
				notFused: createNewPointArray(numShells * numAngles, 0),
				fused: createNewPointArray(numShells * numAngles, 0),
			},
			numShells : numShells, names : Array<string>(numShells), colors : Array<Array<string>>(numShells),
			targets : Array<T.targetDataNoAngleT>(1), angles : [], 
			refAngles : createNewPointArray(0, this.referenceLineSize), refLabels : [],
		}
	}

	// Setup calculations - update with new general settings
	applyCalculationSettings = () : void => {
		const instance = this.instance; 
		const calcSettings = this.settings.calculationSettings;
		const launchAngle = calcSettings.launchAngle;
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
		else{console.log('Error', method); throw new Error('Invalid parameter');}
	}

	// Resize point arrays before use
	resizeArray = <K extends {}>(array : Array<any>, newLength : number, 
		fill : (new() => K) | undefined =undefined ) : void => {
		const diff = newLength - array.length;
		if(diff > 0){
			if(fill !== undefined){
				for(let i=0; i<diff; i++){
					const nObj : K = new fill(); array.push(nObj);
				}
			}else{for(let i=0; i<diff; i++){array.push(undefined);}}
		}else if(diff < 0){array.length = newLength;}
	}

	// Resize specific multidimensional array
	resizePointArray = (array: Array<Array<any>>, newLength: [number, number]) : void => {
		this.resizeArray(array, newLength[0], Array);
		array.forEach((subArray) => {this.resizeArray(subArray, newLength[1]);});
	}
	private resizeCalculatedDataInternal = (numShells, impactSize, numAngles) => {
		const chartIndicesNonPost : Array<'impact' | 'angle'> = ['impact', 'angle'];
		const singleIndex = (index : 'impact' | 'angle') => {
			const singleKey = ([key, value]) => {
				this.resizePointArray(value, [numShells, impactSize]);
			}
			Object.entries(this.calculatedData[index]).forEach(singleKey);
		}
		return () => {
			this.calculatedData.numShells = numShells;
			chartIndicesNonPost.forEach(singleIndex);
			const angleShells = numAngles * numShells;
			//this.resizePointArray(this.calculatedData.post.shipWidth, [1, impactSize]);
			this.resizePointArray(this.calculatedData.post.notFused, [angleShells, 0]);
			this.resizePointArray(this.calculatedData.post.fused, [angleShells, 0]);
		}
	}
	resizeCalculatedData = (numShells, impactSize, numAngles) : void => {
		return this.resizeCalculatedDataInternal(numShells, impactSize, numAngles)();
	}
	
	// Calculate and generate data for charts
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
		const calculatedData = this.calculatedData;
		Object.entries(calculatedData[target]).forEach(([dataType, output] : [string, T.pointArrays]) => {
			output[shell][index] = {x: dist, y: pointFunction(index, dataType, shell)};
		});
	}
	generate = () : void => {
		const shellData = this.SFCref.current!.returnShellData();
		const tgtData = this.TFCref.current!.returnData();
		const numShells: number = shellData.length;
		if(numShells <= 0){return
		}else{
			const instance = this.instance, arrayIndices = this.arrayIndices, calculatedData = this.calculatedData;
			instance.resize(numShells);
			this.applyCalculationSettings();
			//Update Shell Data
			shellData.forEach((value, i) => {
				instance.setValues(value.caliber, 
					value.muzzleVelocity, value.dragCoefficient,
					value.mass, value.krupp, value.normalization,
					value.fusetime, value.threshold, value.ra0,
					value.ra1, value.HESAP, i);
			})
			//Run Computations
			this.calcImpact(this.settings.calculationSettings.calculationMethod);
			instance.calcAngles(tgtData.armor, tgtData.inclination);
			instance.calcPostPen(tgtData.armor, tgtData.inclination,
				tgtData.angles, true, true);
			//Post-Processing
			const impactSize: number = instance.getImpactSize(), numAngles: number = tgtData.angles.length;
			this.resizeCalculatedData(numShells, impactSize, numAngles);
			calculatedData.angles = tgtData.angles;
			calculatedData.targets[0] = {armor: tgtData.armor, inclination: tgtData.inclination, width: tgtData.width}
			shellData.forEach((value, i) => {calculatedData.names[i] = value.name; calculatedData.colors[i] = value.colors;});
			let maxDist = 0; //Maximum Distance for shipWidth
			// Converts flat array data format to {x, y} format for chart.js
			for(let j=0; j<numShells; j++){ // iterate through shells
				for(let i=0; i<impactSize; i++){ // iterate through points at each range
					const dist : number = instance.getImpactPoint(i, arrayIndices.impactDataIndex.distance, j);
					maxDist = Math.max(maxDist, dist);
					this.makeImpactPoints(j, i, dist); this.makeAnglePoints(j, i, dist);
					for(let k=0; k<numAngles; k++){
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
			calculatedData.post.shipWidth.forEach((singleShipWidth) => {
				const length = singleShipWidth.length - 1;
				for(let i=0; i < singleShipWidth.length; i++){
					const xV : number = i / length * maxAdj;
					singleShipWidth[i] = {x: xV, y: tgtData.width};
				}
			});
			//Angle Chart Annotations / Labels
			this.resizePointArray(calculatedData.refAngles, [tgtData.refAngles.length, this.referenceLineSize]);
			calculatedData.refLabels = tgtData.refLabels;

			calculatedData.refAngles.forEach((array, index) => {
				const length = array.length - 1;
				for(let i=0; i < array.length; i++){
					const xV : number = i / length * maxAdj;
					array[i] = {x: xV, y: tgtData.refAngles[index]};
				}
			});
			//this.updateInitialData(calculatedData);
			if(this.graphsRef.current){this.graphsRef.current.updateData(calculatedData);}
		}
	}
	updateInitialData = (data) => { //Only used to for replacing initialData = not useful in release
		const fileToSave = new Blob([JSON.stringify(data)], {type: 'application/json',});
		saveAs(fileToSave, 'initialData.json');
		//const compressed = pako.deflate(JSON.stringify(data));
		//console.log(compressed);
		//const fileToSave2 = new Blob([compressed], {type: 'text/plain',});
		//saveAs(fileToSave2, 'initialData.deflate');
	}
	onUpdate = () =>{this.navRef.current!.update();} // Update Navbar when charts are updated
	updateColors = () => { // For updating when color settings change
		if(this.SFCref.current) this.SFCref.current.updateAllCanvas();
	}	
	render () {
		return (
<div className="App">
	<NavbarCustom links={this.links} ref={this.navRef}/>
	<h1 style={{textAlign: 'center'}}>World of Warships Ballistics Calculator</h1>
	<hr/>
	<ShellFormsContainer ref={this.SFCref} settings={this.settings}/>
	<hr/>
	<TargetFormsContainer ref={this.TFCref}/>
	<hr/>
	<SettingsBar settings={this.settings} ref={this.Settingsref} updateColors={this.updateColors}/>
	<hr/>
	<Row>
		<Col/>
		<Col sm="9">
			<Button style={{width: "100%", paddingTop: "0.6rem", paddingBottom: "0.6rem"}}
		variant="success" onClick={this.generate}>Make Graphs!</Button>
		</Col>
		<Col/>
	</Row>
	<hr/>
	<AllCharts ref={this.graphsRef} settings={this.settings} links={this.links} onUpdate={this.onUpdate}/>
</div>
		);
	}
	componentDidMount(){
		this.links.parameters.push(
			['Shell Parameters', this.SFCref], 
			['Target Parameters', this.TFCref], 
			['Settings', this.Settingsref]
		);
	}
}



export default App;
