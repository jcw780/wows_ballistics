import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import ShellForms from './ShellForms.tsx'

function App() {
	return (
		<div className="App">
			<div className='rows'>
				<div className='row'><ShellForms index="1"/></div>
				<div className='row'><ShellForms index="2"/></div>
				<div className='row'><ShellForms index="3"/></div>
			</div>
		</div>
	);
}

export default App;
