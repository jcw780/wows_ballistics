import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';

import ShellFormsContainer from './ShellForms';
import TargetFormsContainer from './TargetForms';

import ShellWasm from './shellWasm.wasm';


class App extends React.Component<{},{}> {
	SFCref = React.createRef<ShellFormsContainer>();
	TFCref = React.createRef<TargetFormsContainer>();
	instance : any;
	compile : any;
	constructor(props){
		super(props);
		this.compile = ShellWasm().then((Module) => {
			console.log('compiled')
			this.instance = new Module.shell(2);
			console.log(this.instance);
		});
	}
	generate = () => {
		const shellData = this.SFCref.current!.returnShellData();
		const tgtData = this.TFCref.current!.returnData();
		console.log(shellData, tgtData);
		this.instance.resize(shellData.length);
		shellData.forEach((value, i) => {
			this.instance.setValues(value.caliber, 
				value.muzzleVelocity, value.dragCoefficient,
				value.mass, value.krupp, value.normalization,
				value.fusetime, value.threshold, value.ra0,
				value.ra1, i);
		})
		this.instance.calcImpactForwardEuler();
		this.instance.calcAngles(tgtData.armor, tgtData.inclination);
		this.instance.calcPostPen(tgtData.armor, tgtData.inclination,
			tgtData.angles, true, true);

		for(let i=0; i<shellData.length; i++){
			console.log(i);
			this.instance.printPostPen(i);
		}
	}
	render () {
		return (
			<div className="App">
				<ShellFormsContainer ref={this.SFCref}/>
				<TargetFormsContainer ref={this.TFCref}/>
				<Button onClick={this.generate}>Generate</Button>
			</div>
		);
	}
	componentDidMount(){
		console.log("done rendering");
	}
}



export default App;
