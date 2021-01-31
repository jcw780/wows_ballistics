import React, {Suspense} from 'react'; import './App.css';
import {Button, Row} from 'react-bootstrap';
//import {updateInitialData} from './UtilityComponents';

import * as T from './commonTypes';
import {ShellFormsContainer} from './ShellForms';
import {TargetFormsContainer} from './TargetForms';
import AllCharts from './Charts/Charts';
import {NavbarCustom} from './Navbar';
import {SettingsBar} from './SettingsBar';

import ShellWasm from '../wasm/shellWasm';
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
		dispersion: [],
	});

	// Wasm
	module: any;
	calculator : any;
	parameters = {
		shell: undefined,
		dispersion: undefined
	};
	shells: Array<any> = [];

	arrayIndices : Record<string, Record<string, number>> = Object.seal({
		impactIndices: {}, 
		angleIndices: {}, 
		postPenIndices: {}, 
		dispersionIndices: {},
		calcIndices: {}
	}); //Condensed wasm enums

	// Settings Data
	settings : T.settingsT = Object.seal({ //*implement component
		distance: {min: 0, max: undefined, stepSize: 1000, },
		calculationSettings: {
			calculationMethod: 1, timeStep: 0.02,
			launchAngle: {min: 0, max: 30, precision: 0.1},
			verticalType: 0
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
		return ShellWasm({
			locateFile: (path : string, ) => `${process.env.PUBLIC_URL}/${path}`,
		}).then((M) => {
			this.module = M;
			this.calculator = new M.shellCalc();
			this.parameters.shell = new M.shellParams();
			this.parameters.dispersion = new M.dispersionParams();

			Object.entries(this.arrayIndices).forEach(([k, v]: any) => {
				Object.entries(M[k]).forEach(([k1, v1]: any) => {
					if(k1 !== "values"){v[k1] = v1.value;}
				});
			});
			//console.log(this.arrayIndices);
			console.log('compilation successful');
			//return "done";
		});
	}
	constructor(props){
		super(props); this.compile();
		this.calculatedData = {
			impact: {
				rawPen : [], ePenHN : [], impactAHD : [], 
				ePenDN : [], impactADD : [],
				impactV: [], tToTargetA: [],
			}, angle: {
				armorD : [], fuseD : [],
				ra0D : [], ra1D : [],
			}, post: {
				shipWidth : [], notFused: [],
				fused: [],
			},
			dispersion: {
				maxHorizontal: [], standardHorizontal: [],
				halfHorizontal: [],
				maxVertical: [], standardVertical: [],
				halfVertical: [],
				maxArea: [], standardArea: [],
				halfArea: []
			},
			numShells : 2, names : [], colors : [],
			targets : Array<T.targetDataNoAngleT>(1), angles : [], 
			refAngles : [], refLabels : [],
			startRicochet: [], alwaysRicochet: [],
		}
	}

	// Setup calculations - update with new general settings
	applyCalculationSettings = () : void => {
		const {calculator} = this;
		const calcSettings = this.settings.calculationSettings;
		const {launchAngle} = calcSettings;
		calculator.setMax(launchAngle.max); 
		calculator.setMin(launchAngle.min);
		calculator.setPrecision(launchAngle.precision);
		calculator.setDtMin(calcSettings.timeStep);
	}

	// Select calculation [numerical analysis algorithm] type
	calcImpact = () => {
		const method = this.settings.calculationSettings.calculationMethod;
		const {calculator} = this;
		const calcImpactFunc = {
			0: (shell) : void => calculator.calcImpactAdamsBashforth5(shell),
			1: (shell) : void => calculator.calcImpactForwardEuler(shell),
			2: (shell) : void => calculator.calcImpactRungeKutta2(shell),
			3: (shell) : void => calculator.calcImpactRungeKutta4(shell)
		};
		if (method in calcImpactFunc) return calcImpactFunc[method];
		else{console.error('Error', method); throw new Error('Invalid calculation method');}
	}

	calcDispersion = () => {
		const {calculator} = this;
		const {verticalType} = this.settings.calculationSettings;
		const dispersionFunction = {
			0: (shell) : void => calculator.calcDispersion(shell, this.module.verticalTypes.horizontal.value),
			1: (shell) : void => calculator.calcDispersion(shell, this.module.verticalTypes.normal.value),
			2: (shell) : void => calculator.calcDispersion(shell, this.module.verticalTypes.vertical.value)
		}
		if (verticalType in dispersionFunction) return dispersionFunction[verticalType];
		else {console.error('Error', verticalType); throw new Error('Invalid verticalType');}
	}

	generate = () : void => {
		const shellData = this.SFCref.current!.returnShellData();
		const tgtData = this.TFCref.current!.returnData();
		const numShells: number = shellData.length;
		if(this.module === undefined) return; //WASM component needs to be compiled
		if(numShells <= 0){return //No shells sent - no work needed
		}else{
			const {shells, arrayIndices, calculatedData, calculator, module} = this;
			const {calcIndices, postPenIndices} = arrayIndices;
			calculatedData.numShells = numShells;
			//console.log(shellData);

			//resize this.shells
			for(let i=this.shells.length; i<numShells; i++)
				shells.push(new module.shell());			
			shells.length = numShells;

			shellData.forEach((value, i) => {
				const {shell, dispersion} = this.parameters;
				shell!.setValues(
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
				);
				
				let {idealRadius, minRadius, maxDist, GMIdealRadius, maxDistCoef} = value;
				idealRadius = idealRadius * GMIdealRadius;
				minRadius = minRadius * GMIdealRadius;
				maxDist = maxDist * maxDistCoef;

				dispersion!.setValues(
					idealRadius, minRadius, value.idealDistance,
					value.taperDist, value.delim, value.radiusOnZero, 
					value.radiusOnDelim, value.radiusOnMax, maxDist,
					value.sigmaCount
				);
					
				shells[i]!.setValues(shell, dispersion, '');
			});

			const numAngles: number = tgtData.angles.length;
			calculatedData.angles = tgtData.angles;
			calculatedData.targets[0] = {
				armor: tgtData.armor, 
				inclination: tgtData.inclination, 
				width: tgtData.width
			}

			calculatedData.names = [];
			calculatedData.colors = [];
			shellData.forEach((value, i) => {
				calculatedData.names[i] = value.name; 
				calculatedData.colors[i] = value.colors;
			});

			let maxRange = 0;
			this.applyCalculationSettings();
			const impactFunction = this.calcImpact();
			const dispersionFunction = this.calcDispersion();
			//console.log(impactFunction);
			shells.forEach(shell => {
				impactFunction(shell);
				dispersionFunction(shell);
				calculator.calcAngles(shell, 
					tgtData.armor, tgtData.inclination
				);
				calculator.calcPostPen(shell,
					tgtData.armor, 
					tgtData.inclination,
					tgtData.angles, 
					true, false
				);
				maxRange = Math.max(maxRange, shell.maxDist().distance);
			});

			const distanceCoordinates = [calcIndices.impact, arrayIndices.impactIndices.distance];
			const indexConversion = {
				impact: 'impactIndices', angle: 'angleIndices', dispersion: 'dispersionIndices'
			};
			type indexType = keyof typeof indexConversion;
			['impact', 'angle', 'dispersion'].forEach((key : indexType) => {
				Object.entries(calculatedData[key]).forEach(([k,v]) => {
					v.length = 0;
					shells.forEach(shell => {
						v.push(module.getImpactSizedPointArray(shell,
							distanceCoordinates,
							[calcIndices[key], arrayIndices[indexConversion[key]][k]]
						));
					});
				});
			});

			calculatedData.post.fused.length = 0;
			calculatedData.post.notFused.length = 0;

			shells.forEach(shell => {
				for(let j=0; j<numAngles; j++){
					calculatedData.post.fused.push(module.getImpactSizedPointArrayFuseStatus(shell,
						distanceCoordinates, [calcIndices.post, postPenIndices.x, j],
						j, true
					));
					calculatedData.post.notFused.push(module.getImpactSizedPointArrayFuseStatus(shell,
						distanceCoordinates, [calcIndices.post, postPenIndices.x, j],
						j, false
					));
				}
			});
			//console.log(calculatedData);
			
			//Generate Ship Width Line 
			const {stepSize: sSize} = this.settings.distance;
			const stepSize = sSize !== undefined ? sSize: 2000;
			const maxAdj = Math.ceil(maxRange / stepSize) * stepSize;
			const length = this.referenceLineSize - 1;
			const increment = maxAdj / length;

			calculatedData.post.shipWidth = [[],];
			calculatedData.post.shipWidth.forEach(singleShipWidth => {
				for(let i=0; i < length+1; ++i){
					const xV : number = i * increment;
					singleShipWidth[i] = {
						x: xV, 
						y: tgtData.width
					};
				}
			});
			//Impact Ricochet Angles
			const {startRicochet, alwaysRicochet} = calculatedData;
			startRicochet.length = 0; alwaysRicochet.length = 0;
			shellData.forEach((shell) => {
				const start : T.scatterPoint[] = [], always : T.scatterPoint[] = [];
				for(let i=0; i < length+1; ++i){
					const xV : number = i * increment;
					start[i] = {
						x: xV, 
						y: shell.ra0
					};
					always[i] = {
						x: xV,
						y: shell.ra1
					}
				}
				startRicochet.push(start);
				alwaysRicochet.push(always);
			});
			//Angle Chart Annotations / Labels
			calculatedData.refLabels = tgtData.refLabels;
			calculatedData.refAngles = [];
			for(let j=0, len=calculatedData.refLabels.length; j<len; ++j){
				const temp : T.scatterPoint[] = [];
				for(let i=0; i < length+1; ++i){
					const xV : number = i * increment;
					temp[i] = {
						x: xV, 
						y: tgtData.refAngles[j]
					};
				}
				calculatedData.refAngles.push(temp);
			}
			//console.log(calculatedData);
			//updateInitialData(calculatedData);
			this.updateCharts();
		}
	}
	updateCharts = () => {
		if(this.graphsRef.current){
			this.graphsRef.current.updateData(this.calculatedData);
		}
	}
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
		updateCharts={this.updateCharts}
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
