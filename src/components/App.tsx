import React from 'react'; import './App.css';
import {Button, Col, Row} from 'react-bootstrap';

import * as T from './commonTypes';
import ShellFormsContainer from './ShellForms';
import TargetFormsContainer from './TargetForms';
import ChartGroup from './Charts';
import NavbarCustom from './Navbar';
import SettingsBar from './SettingsBar';

import ShellWasm from '../wasm/shellWasm.wasm';
class App extends React.Component<{},{}> {
	//Refs
	SFCref = React.createRef<ShellFormsContainer>();
	TFCref = React.createRef<TargetFormsContainer>();
	Settingsref = React.createRef<SettingsBar>();
	graphsRef : React.RefObject<ChartGroup> = React.createRef<ChartGroup>();
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
			rounding: 3, shortNames: true,
			colors : {saturation: .5, light: .6, batch: false}
		},
	}
	// Calculated Data
	calculatedData: T.calculatedData

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
		const numShells = 2; const impactSize = 251; const numAngles = 8;
		const createNewPointArray = (lines, points) => {
			return Array.from({length: lines}, _ => new Array<T.scatterPoint>(points))
		}
		this.calculatedData = {
			impact: {
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
				shipWidth : createNewPointArray(1, 251),
				notFused: createNewPointArray(numShells * numAngles, 0),
				fused: createNewPointArray(numShells * numAngles, 0),
			},
			numShells : numShells, names : Array<string>(numShells), colors : Array<Array<string>>(numShells),
			targets : Array<T.targetDataNoAngleT>(1), angles : []
		}
	}
	// Setup calculations
	applyCalculationSettings = () : void => {
		const instance = this.instance; 
		const calcSettings = this.settings.calculationSettings;
		const launchAngle = calcSettings.launchAngle;
		instance.setMax(launchAngle.max); 
		instance.setMin(launchAngle.min);
		instance.setPrecision(launchAngle.precision);
		instance.setDtMin(calcSettings.timeStep);
	}

	// Select calculation type
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
			}else{for(let i=0; i<diff; i++){array.push();}}
		}else if(diff < 0){array.length = newLength;}
	}
	resizePointArray = (array: Array<Array<any>>, newLength: [number, number]) : void => {
		this.resizeArray(array, newLength[0], Array);
		array.forEach((subArray) => {this.resizeArray(subArray, newLength[1]);});
	}
	resizeCalculatedData = (numShells, impactSize, numAngles) : void => {
		this.calculatedData.numShells = numShells;
		const chartIndicesNonPost : Array<'impact' | 'angle'> = ['impact', 'angle'];
		chartIndicesNonPost.forEach((index) => {
			Object.entries(this.calculatedData[index]).forEach(([key, value]) => {
				this.resizePointArray(value, [numShells, impactSize]);
			})
		})
		const angleShells = numAngles * numShells;
		//this.resizePointArray(this.calculatedData.post.shipWidth, [1, impactSize]);
		this.resizePointArray(this.calculatedData.post.notFused, [angleShells, 0]);
		this.resizePointArray(this.calculatedData.post.fused, [angleShells, 0]);
	}
	
	// Calculate and generate data for charts
	generate = () : void => {
		const shellData = this.SFCref.current!.returnShellData();
		const tgtData = this.TFCref.current!.returnData();
		const numShells: number = shellData.length;
		if(numShells <= 0){return
		}else{
			this.instance.resize(numShells);
			this.applyCalculationSettings();
			shellData.forEach((value, i) => {
				this.instance.setValues(value.caliber, 
					value.muzzleVelocity, value.dragCoefficient,
					value.mass, value.krupp, value.normalization,
					value.fusetime, value.threshold, value.ra0,
					value.ra1, value.HESAP, i);
			})
			this.calcImpact(this.settings.calculationSettings.calculationMethod);
			this.instance.calcAngles(tgtData.armor, tgtData.inclination);
			this.instance.calcPostPen(tgtData.armor, tgtData.inclination,
				tgtData.angles, true, true);
			const impactSize: number = this.instance.getImpactSize(); const numAngles: number = tgtData.angles.length;
			this.resizeCalculatedData(numShells, impactSize, numAngles);
			this.calculatedData.angles = tgtData.angles;
			this.calculatedData.targets[0] = {armor: tgtData.armor, inclination: tgtData.inclination, width: tgtData.width}
			shellData.forEach((value, i) => {this.calculatedData.names[i] = value.name; this.calculatedData.colors[i] = value.colors;});
			let maxDist = 0;
			for(let j=0; j<numShells; j++){ // iterate through shells
				for(let i=0; i<impactSize; i++){ // iterate through points at each range
					const dist : number = this.instance.getImpactPoint(i, this.arrayIndices.impactDataIndex.distance, j);
					maxDist = Math.max(maxDist, dist);
					Object.entries(this.calculatedData.impact).forEach(([dataType, output] : [string, T.pointArrays]) => {
						const y = this.instance.getImpactPoint(i, this.arrayIndices.impactDataIndex[dataType], j);
						output[j][i] = {x: dist, y: y};
					});
					Object.entries(this.calculatedData.angle).forEach(([dataType, output] : [string, T.pointArrays]) => {
						output[j][i] = {x: dist, y: this.instance.getAnglePoint(i, this.arrayIndices.angleDataIndex[dataType], j)};
					});
					for(let k=0; k<numAngles; k++){
						const detDist : number
							= this.instance.getPostPenPoint(i, this.arrayIndices.postPenDataIndex.x, k, j);
						const fused : number
							= this.instance.getPostPenPoint(i, this.arrayIndices.postPenDataIndex.xwf, k, j);
						const point : T.scatterPoint = {x: dist, y: detDist};
						if(fused < 0){this.calculatedData.post.notFused[k+j*numAngles].push(point);
						}else{this.calculatedData.post.fused[k+j*numAngles].push(point);}
					}
				}
			}
			const stepSize = this.settings.distance.stepSize !== undefined ? this.settings.distance.stepSize: 2000;
			const maxAdj = Math.ceil(maxDist / stepSize) * stepSize;
			const length = this.calculatedData.post.shipWidth[0].length - 1;
			for(let i=0; i < this.calculatedData.post.shipWidth[0].length; i++){
				const xV : number = i / length * maxAdj;
				this.calculatedData.post.shipWidth[0][i] = {x: xV, y: tgtData.width};
			}
			console.log(JSON.stringify(this.calculatedData)); //- for replacing initialData when first ships change
			if(this.graphsRef.current){this.graphsRef.current.updateData(this.calculatedData);}
		}
	}
	onUpdate = () =>{this.navRef.current!.update();} // Update Navbar when charts are updated
	updateColors = () => { // For updating when color settings change
		if(this.SFCref.current){
			this.SFCref.current.updateAllCanvas();
		}
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
					variant="secondary" onClick={this.generate}>Make Graphs!</Button>
					</Col>
					<Col/>
				</Row>
				<hr/>
				<ChartGroup ref={this.graphsRef} settings={this.settings} links={this.links} onUpdate={this.onUpdate}/>
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
