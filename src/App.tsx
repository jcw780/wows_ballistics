import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import ShellFormsContainer from 'ShellForms';
import TargetFormsContainer from 'TargetForms';

function App() {
	return (
		<div className="App">
			<ShellFormsContainer/>
			<TargetFormsContainer/>
		</div>
	);
}

export default App;
