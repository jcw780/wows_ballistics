import React from 'react';
import ReactDOM from 'react-dom';
import ReactGA from 'react-ga';

import 'semantic-ui-css/semantic.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import './index.css';
import App from './components/App';
import * as serviceWorker from './serviceWorker';

ReactGA.initialize('UA-155844497-1');
ReactGA.pageview(window.location.pathname + window.location.search);

const rootElement = document.getElementById('root');
if(rootElement!.hasChildNodes()){
	ReactDOM.hydrate(
		<React.StrictMode>
			<App/>
		</React.StrictMode>,
		rootElement
	);
}else{
	ReactDOM.render(
		<React.StrictMode>
			<App/>
		</React.StrictMode>,
		rootElement
	);
}


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
