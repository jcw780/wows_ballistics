import React, {useState} from 'react';
import {ToggleButtonGroup, ToggleButton} from 'react-bootstrap';

interface settingsRadioProps{
    options: string[], values: (string|number)[], defaultValue: string|number, onChange: Function
}

export const SettingsRadio: React.FunctionComponent<settingsRadioProps> = ({options, values, defaultValue, onChange} : settingsRadioProps) => {
    const [value, setValue] = useState(() => {
        return values.indexOf(defaultValue)
    });
    const onChangeInternal = event => {
        const value = parseInt(event.target.value);
        setValue(value);
        onChange(values[value]);
    }
    return (
        <ToggleButtonGroup toggle vertical 
            type="radio" name="radio" 
            value={value}
        >
            {options.map(((option, i) => {
                return (
                <ToggleButton key={i} value={i} 
                    onChange={onChangeInternal} 
                    type="radio" 
                    variant="secondary"
                >
                    {option}
                </ToggleButton>);
            }))}
        </ToggleButtonGroup>
    ) 
    
}