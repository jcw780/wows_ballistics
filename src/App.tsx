import React from 'react'; import './App.css';
import {Button, Col, Row} from 'react-bootstrap';

import * as T from 'commonTypes';
import ShellFormsContainer from './ShellForms';
import TargetFormsContainer from './TargetForms';
import ChartGroup from './Charts';
import NavbarCustom from './Navbar';
import SettingsBar from 'SettingsBar';

import ShellWasm from './shellWasm.wasm';
import { array } from 'prop-types';
class App extends React.Component<{},{}> {
	SFCref = React.createRef<ShellFormsContainer>();
	TFCref = React.createRef<TargetFormsContainer>();
	graphsRef : React.RefObject<ChartGroup> = React.createRef<ChartGroup>();
	navRef : React.RefObject<NavbarCustom> = React.createRef<NavbarCustom>();
	instance : any;
	links : T.linkT = {parameters : [], impact : [], angle : [], post : [],}
	arrayIndices : Record<string, Record<string, number>> = {
		impactDataIndex: {}, 
		angleDataIndex: {}, 
		postPenDataIndex: {} 
	}
	settings : T.settingsT = { //*implement component
		distance: {min: 0, max: undefined, stepSize: 1000, },
		calculationSettings: {
			calculationMethod: 1, timeStep: 0.02,
			launchAngle : {min: 0, max: 25},
		},
		format: {
			rounding: 3, shortNames: true,
			colors : {saturation: .5, light: .6, batch: false}
		},
	}
	calculatedData: T.calculatedData
	compile = () => {
		return ShellWasm().then((M) => {
			this.instance = new M.shell(2);
			Object.entries(this.arrayIndices).forEach((kv: any) => {
				const k = kv[0]; const v = kv[1];
				Object.entries(M[k]).forEach((kv1: any) => {
					const k1 = kv1[0]; const v1 = kv1[1];
					if(k1 !== "values"){v[k1] = v1.value;}
				});
			});
			return "done";
		});
	}
	constructor(props){
		super(props); this.compile();
		//initialize calculatedData
		const numShells = 2; const impactSize = 251; const numAngles = 8;
		this.calculatedData = {
			impact: {
				ePenHN : Array.from({length: numShells}, _ => new Array<T.scatterPoint>(impactSize)),
				impactAHD : Array.from({length: numShells}, _ => new Array<T.scatterPoint>(impactSize)),
				ePenDN : Array.from({length: numShells}, _ => new Array<T.scatterPoint>(impactSize)),
				impactADD : Array.from({length: numShells}, _ => new Array<T.scatterPoint>(impactSize)),
				impactV: Array.from({length: numShells}, _ => new Array<T.scatterPoint>(impactSize)),
				tToTargetA: Array.from({length: numShells}, _ => new Array<T.scatterPoint>(impactSize)),
			}, angle: {
				armorD : Array.from({length: numShells}, _ => new Array<T.scatterPoint>(impactSize)),
				fuseD : Array.from({length: numShells}, _ => new Array<T.scatterPoint>(impactSize)),
				ra0D : Array.from({length: numShells}, _ => new Array<T.scatterPoint>(impactSize)),
				ra1D : Array.from({length: numShells}, _ => new Array<T.scatterPoint>(impactSize)),
			}, post: {
				shipWidth : Array.from({length: 1}, _ => new Array<T.scatterPoint>(impactSize)),
				notFused: Array.from({length: numShells * numAngles}, _ => new Array<T.scatterPoint>()),
				fused: Array.from({length: numShells * numAngles}, _ => new Array<T.scatterPoint>()),
			},
			numShells : numShells, names : Array<string>(numShells), colors : Array<Array<string>>(numShells),
			targets : Array<T.targetDataNoAngleT>(1), angles : []
		}
	}
	applyCalculationSettings = () => {
		const instance = this.instance; 
		const calcSettings = this.settings.calculationSettings;
		const launchAngle = calcSettings.launchAngle;
		instance.setMax(launchAngle.max); instance.setMin(launchAngle.min);
		instance.setPrecision(calcSettings.timeStep);
	}
	calcImpact = (method) => {
		const calcImpactFunc = {
			0: _=> this.instance.calcImpactAdamsBashforth5(),
			1: _=> this.instance.calcImpactForwardEuler(),
			2: _=> this.instance.calcImpactRungeKutta2(),
			3: _=> this.instance.calcImpactRungeKutta4()
		};
		if (method in calcImpactFunc){
			calcImpactFunc[method]();
		}else{
			console.log('Error', method);
			throw 'Invalid parameter';
		}
	}

	resizeArray = <K extends {}>(array : Array<any>, newLength : number, 
		fill : (new() => K) | undefined =undefined ) : void => {
		const diff = newLength - array.length;
		if(diff > 0){
			if(fill !== undefined){
				array = array.concat(Array.from({length: diff}, _ => new fill));
			}else{
				array = array.concat(Array.from({length: diff}));
			}
		}else if(diff < 0){
			array.slice(0, newLength);
		}
	}
	resizePointArray = (array: Array<Array<any>>, newLength: [number, number]) => {
		this.resizeArray(array, newLength[0], Array);
		array.forEach((subArray) => {
			this.resizeArray(subArray, newLength[1]);
		});
	}
	resizeCalculatedData = (numShells, impactSize, numAngles) => {
		this.calculatedData.numShells = numShells;
		const chartIndicesNonPost : Array<'impact' | 'angle'> = ['impact', 'angle'];
		chartIndicesNonPost.forEach((index) => {
			Object.entries(this.calculatedData[index]).forEach((kv) => {
				const key = kv[0]; const value = kv[1];
				this.resizePointArray(value, [numShells, impactSize]);
			})
		})
		const angleShells = numAngles * numShells;
		this.resizePointArray(this.calculatedData.post.shipWidth, [1, impactSize]);
		this.resizePointArray(this.calculatedData.post.notFused, [angleShells, 0]);
		this.resizePointArray(this.calculatedData.post.fused, [angleShells, 0]);
	}
	generate = () => {
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
			const output : T.calculatedData = {
				impact: {
					ePenHN : Array.from({length: numShells}, _ => new Array<T.scatterPoint>(impactSize)),
					impactAHD : Array.from({length: numShells}, _ => new Array<T.scatterPoint>(impactSize)),
					ePenDN : Array.from({length: numShells}, _ => new Array<T.scatterPoint>(impactSize)),
					impactADD : Array.from({length: numShells}, _ => new Array<T.scatterPoint>(impactSize)),
					impactV: Array.from({length: numShells}, _ => new Array<T.scatterPoint>(impactSize)),
					tToTargetA: Array.from({length: numShells}, _ => new Array<T.scatterPoint>(impactSize)),
				}, angle: {
					armorD : Array.from({length: numShells}, _ => new Array<T.scatterPoint>(impactSize)),
					fuseD : Array.from({length: numShells}, _ => new Array<T.scatterPoint>(impactSize)),
					ra0D : Array.from({length: numShells}, _ => new Array<T.scatterPoint>(impactSize)),
					ra1D : Array.from({length: numShells}, _ => new Array<T.scatterPoint>(impactSize)),
				}, post: {
					shipWidth : Array.from({length: 1}, _ => new Array<T.scatterPoint>(impactSize)),
					notFused: Array.from({length: numShells * numAngles}, _ => new Array<T.scatterPoint>()),
					fused: Array.from({length: numShells * numAngles}, _ => new Array<T.scatterPoint>()),
				},
				numShells : numShells, names : Array<string>(numShells), colors : Array<Array<string>>(numShells),
				targets : Array<T.targetDataNoAngleT>(1), angles : tgtData.angles
			}
			output.targets[0] = {armor: tgtData.armor, inclination: tgtData.inclination, width: tgtData.width}
			shellData.forEach((value, i) => {output.names[i] = value.name; output.colors[i] = value.colors;});
			let maxDist = 0; let maxShell = 0;
			for(let j=0; j<numShells; j++){
				let maxDistS = 0;
				for(let i=0; i<impactSize; i++){
					const dist : number = this.instance.getImpactPoint(i, this.arrayIndices.impactDataIndex.distance, j);
					maxDistS = dist > maxDistS ? dist : maxDistS;
					Object.entries(output.impact).forEach((kv : any) => {
						const k = kv[0]; const v = kv[1];
						const y = this.instance.getImpactPoint(i, this.arrayIndices.impactDataIndex[k], j);
						v[j][i] = {x: dist, y: y};
					});
					Object.entries(output.angle).forEach((kv : any) => {
						const k = kv[0]; const v = kv[1];
						v[j][i] = {x: dist, y: this.instance.getAnglePoint(i, this.arrayIndices.angleDataIndex[k], j)};
					});
					for(let k=0; k<numAngles; k++){
						const detDist : number
							= this.instance.getPostPenPoint(i, this.arrayIndices.postPenDataIndex.x, k, j);
						const fused : number
							= this.instance.getPostPenPoint(i, this.arrayIndices.postPenDataIndex.xwf, k, j);
						const point : T.scatterPoint = {x: dist, y: detDist};
						if(fused < 0){output.post.notFused[k+j*numAngles].push(point);
						}else{output.post.fused[k+j*numAngles].push(point);}
					}
				}
				const greater = maxDistS > maxDist;
				maxDist = greater ? maxDistS : maxDist; maxShell = greater ? j : maxShell;
			}
			for(let i=0; i<impactSize; i++){
				const dist = this.instance.getImpactPoint(i, this.arrayIndices.impactDataIndex.distance, maxShell);
				output.post.shipWidth[0][i] = {x: dist, y: tgtData.width}
			}
			//console.log(JSON.stringify(output));
			if(this.graphsRef.current){this.graphsRef.current.updateData(output);}
		}
	}
	onUpdate = () =>{this.navRef.current!.update();}	
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
				<SettingsBar settings={this.settings}/>
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
		this.links.parameters.push(['Shell Parameters', this.SFCref], ['Target Parameters', this.TFCref]);
	}
}



export default App;
