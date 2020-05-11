import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';

import ShellFormsContainer from 'ShellForms';
import TargetFormsContainer from 'TargetForms';


class App extends React.Component {
	SFCref = React.createRef<ShellFormsContainer>();
	TFCref = React.createRef<TargetFormsContainer>();
	Module : any;
	generate = () => {
		const shellData = this.SFCref.current!.returnShellData();
		const tgtData = this.TFCref.current!.returnData();
		//console.log(shellData, tgtData);
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
	}
}



export default App;
