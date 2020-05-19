import React from 'react';

import {ChartGroup, SingleChart} from 'Charts';
import ShellFormsContainer from 'ShellForms';
import TargetFormsContainer from 'TargetForms';

export type chartTypes = 'impact' | 'angle' | 'post';
export type chartRefType = React.RefObject<SingleChart>;

export type singleLinkType = [string, chartRefType | parameterRefType];
export type parameterRefType = React.RefObject<ShellFormsContainer | TargetFormsContainer>;
export type linkKeyType = chartTypes | 'parameters';
export interface linkType {
    impact: singleLinkType[], angle: singleLinkType[], post: singleLinkType[], parameters: singleLinkType[],
}

export default linkType;