import React, {useState, useImperativeHandle} from 'react';

function UpgradeSingle({active, name, img_target, onClick} : 
	{active: boolean, name: string, img_target: [string, string], onClick: () => void}){
	return (
	<figure onClick={() => {onClick()}}>
		<img src={`${process.env.PUBLIC_URL}/upgrades/${img_target[active?1:0]}.png`} alt={name}/>
		<figcaption style={{wordWrap: 'normal'}}>{name}</figcaption>
	</figure>);
}

function UpgradeColumn({column, value, rows_max, img_target, localized, sendValue} : {
	column: [string, string, any][], 
	value: number, 
	rows_max: number, 
	img_target: [string, string], 
	localized: boolean,
	sendValue: (index: number) => void}){
	const [value_state, setValue] = useState(value);
	const changeSelected = (index: number) => {
		if (value_state !== index){
			sendValue(index);
			setValue(index);
		}
	}

	return (
		<div>
			{column.map((row, i: number) => {
				const name = (row[1] !== "") && localized ? row[1]: row[0];
				return (
					<UpgradeSingle 
					key={i}
					active={i === value_state} 
					name={name} 
					img_target={img_target} 
					onClick={() => {changeSelected(i)}}/>
				);	
			})}
			{
				Array(rows_max - column.length).fill(<div style={{height: '60px', width: '60px'}}></div>)
			}
		</div>
	);
}

const upgrade_order = ['_Artillery', '_Hull', '_Torpedoes', '_Suo', '_Engine'];
const upgrade_img_src_table = Object.freeze({
	'_Artillery': ['icon_module_Artillery', 'icon_module_Artillery_installed'],
	'_Hull': ['icon_module_Hull', 'icon_module_Hull_installed'],
	'_Torpedoes': ['icon_module_Torpedoes', 'icon_module_Torpedoes_installed'],
	'_Suo': ['icon_module_Suo', 'icon_module_Suo_installed'],
	'_Engine': ['icon_module_Engine', 'icon_module_Engine_installed'] 
});

export const UpgradeTable = React.forwardRef((
	{upgrades, values, localized, onChange}: {
		upgrades: Record<string, [string, string, any][]>, 
		values: Record<string, number>,
		localized: boolean,
		onChange: () => void,
	}, 
	ref) => {
	const makeUpgradeLists = (raw_upgrades: Record<string, [string, string, any][]>) => {
		const upgrade_lists = Object.entries(raw_upgrades);
		upgrade_lists.sort((a, b) => upgrade_order.indexOf(a[0]) - upgrade_order.indexOf(b[0]));
		return upgrade_lists;
	}
	const [upgrade_lists, changeUpgradeLists] = useState(makeUpgradeLists(upgrades));

	useImperativeHandle(ref, () => ({
		updateUpgradeListsRaw: (raw_upgrades: Record<string, [string, string, any][]>) => {
			changeUpgradeLists(makeUpgradeLists(raw_upgrades));
		}
	}));
	
	const updateValue = (type: string, value: number) => {
		values[type] = value;
		onChange();
	}
	
	const rows_max: number = (()=>{
		let rows_max_current = 0;
		upgrade_lists.forEach(([, data]) => {
			rows_max_current = Math.max(rows_max_current, data.length);
		});
		return rows_max_current;
	})();

	return (
		<div style={{
			display: 'grid', 
			gridTemplateColumns: `repeat(${upgrade_lists.length}, 1fr)`,
			columnGap: `.5rem`
		}}>
		{upgrade_lists.map(([type, data], i) => {
			return (
				<UpgradeColumn 
				key={i}
				column={data} 
				value={values[type]} 
				rows_max={rows_max}
				img_target={upgrade_img_src_table[type]} 
				localized={localized}
				sendValue={(index: number) => {updateValue(type, index);}}
				/>
			);
		})}
		</div>
	);
});