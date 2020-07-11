import React from 'react';

export const SupportFooter = (props) => {
    return(    
    <div className="support-footer">
		<div className="support-title" onClick={() => window.scrollTo(0, 0)}>
			<h3>World of Warships Ballistics</h3>
		</div>
		<div>
			<h4>Support</h4>
			<a href="https://discord.gg/fpDB9y5">
			<div className="support-link">Discord</div>
			</a> 
			<a href="https://github.com/jcw780/wows_ballistics/issues">
			<div className="support-link">Issues</div>
			</a> 
		</div>
		<div>
			<h4>About</h4>
			<a href="https://github.com/jcw780/wows_ballistics">
				<div className="support-link">Github</div>
			</a> 
		</div>
	</div>
    );
} 