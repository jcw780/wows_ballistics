import React from 'react';
import {Scatter} from 'react-chartjs-2';

class SingleChart extends React.Component
<{data?: Record<string, any>, options?: Record<string, any>, title?: string,
dimensions: Record<string, number>}> {
    chartRef : React.RefObject<Scatter>
    update = () => {
        console.log(this.chartRef);
        //this.chartRef.update();
    }
    render(){
        return(
            <>
                <Scatter data={this.props.data} options={this.props.options}
                width={this.props.dimensions.width} height={this.props.dimensions.height}
                ref={this.chartRef}/>
            </> 
        );
    }
}

class ChartGroup extends React.Component
<{}>{
    commonStyle = {};
    dimensions = {height: 1200, width: 300};
    chartRefs = {
        impact: [React.createRef<SingleChart>(), ],
    };
    updateCharts = () => {

    }
    render(){
        return(
            <>
                <SingleChart dimensions={this.dimensions} ref={this.chartRefs.impact[0]}/>
            </>
        );
    }
}

export default ChartGroup;