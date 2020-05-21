import React from 'react';
import './App.css';
import {Button, Col, Row} from 'react-bootstrap';

import * as T from 'commonTypes';
import ShellFormsContainer from './ShellForms';
import TargetFormsContainer from './TargetForms';
import ChartGroup from './Charts';
import NavbarCustom from './Navbar';
import SettingsBar from 'SettingsBar';

import ShellWasm from './shellWasm.wasm';
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
	constructor(props){super(props); this.compile();}
	applyCalculationSettings = () => {
		const instance = this.instance; 
		const calcSettings = this.settings.calculationSettings;
		const launchAngle = calcSettings.launchAngle;
		instance.setMax(launchAngle.max); instance.setMin(launchAngle.min);
		instance.setPrecision(calcSettings.timeStep);
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
					value.ra1, i);
			})
			const calculationMethod = this.settings.calculationSettings.calculationMethod;
			switch(calculationMethod){
				case 0:
					this.instance.calcImpactAdamsBashforth5(); break;
				case 1:
					this.instance.calcImpactForwardEuler(); break;
				case 2:
					this.instance.calcImpactRungeKutta2(); break;
				case 3:
					this.instance.calcImpactRungeKutta4(); break;
				default:
					console.log('Error', calculationMethod); break;
			}
			this.instance.calcAngles(tgtData.armor, tgtData.inclination);
			this.instance.calcPostPen(tgtData.armor, tgtData.inclination,
				tgtData.angles, true, true);
			const impactSize: number = this.instance.getImpactSize(); const numAngles: number = tgtData.angles.length;
			const output = {
				impact: {
					ePenHN : Array.from({length: numShells}, _ => new Array<Record<string, number>>(impactSize)),
					impactAHD : Array.from({length: numShells}, _ => new Array<Record<string, number>>(impactSize)),
					ePenDN : Array.from({length: numShells}, _ => new Array<Record<string, number>>(impactSize)),
					impactADD : Array.from({length: numShells}, _ => new Array<Record<string, number>>(impactSize)),
					impactV: Array.from({length: numShells}, _ => new Array<Record<string, number>>(impactSize)),
					tToTargetA: Array.from({length: numShells}, _ => new Array<Record<string, number>>(impactSize)),
				}, angle: {
					armorD : Array.from({length: numShells}, _ => new Array<Record<string, number>>(impactSize)),
					fuseD : Array.from({length: numShells}, _ => new Array<Record<string, number>>(impactSize)),
					ra0D : Array.from({length: numShells}, _ => new Array<Record<string, number>>(impactSize)),
					ra1D : Array.from({length: numShells}, _ => new Array<Record<string, number>>(impactSize)),
				}, post: {
					shipWidth : Array.from({length: 1}, _ => new Array<Record<string, number>>(impactSize)),
					notFused: Array.from({length: numShells * numAngles}, _ => new Array<Record<string, number>>()),
					fused: Array.from({length: numShells * numAngles}, _ => new Array<Record<string, number>>()),
				},
				numShells : numShells, names : Array<string>(numShells), colors : Array<Array<string>>(numShells),
				targets : Array<Record<string, number>>(1), angles : tgtData.angles
			}
			output.targets[0] = {armor: tgtData.armor, inclination: tgtData.inclination, width: tgtData.width}
			shellData.forEach((value, i) => {output.names[i] = value.name; output.colors[i] = value.colors;});
			let maxDist = 0; let maxShell = 0;
			for(let j=0; j<numShells; j++){
				let maxDistS = 0; const nonAP = shellData[j].HESAP > 0;
				for(let i=0; i<impactSize; i++){
					const dist : number = this.instance.getImpactPoint(i, this.arrayIndices.impactDataIndex.distance, j);
					maxDistS = dist > maxDistS ? dist : maxDistS;
					Object.entries(output.impact).forEach((kv : any) => {
						const k = kv[0]; const v = kv[1]; let y = 0;
						if((k === 'ePenHN' || k === 'ePenDN') && (nonAP)){y = shellData[j].HESAP;}
						else{y = this.instance.getImpactPoint(i, this.arrayIndices.impactDataIndex[k], j);}
						if(k === 'impactAHD'){y *= -1}
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
						const point : Record<string, number> = {x: dist, y: detDist};
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
				<h1 style={{textAlign: 'center'}}>World of Warships Ballistics Calculator 2</h1>
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
					variant="primary" onClick={this.generate}>Make Graphs!</Button>
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
