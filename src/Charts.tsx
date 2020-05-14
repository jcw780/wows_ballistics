import React from 'react';
import {Scatter} from 'react-chartjs-2';

class Chart extends React.Component
<{data: Record<string, any>, options: Record<string, any>, 
dimensions: Record<string, number>}> {
    render(){
        return(
            <>
                <Scatter data={this.props.data} options={this.props.options}
                width={this.props.dimensions.width} height={this.props.dimensions.height}/>
            </> 
        );
    }
}

class ChartGroup extends React.Component
<{groupData: Record<string, any>, options: Record<string, any>}>{
    render(){
        return(
            <>
            </>
        );
    }
}