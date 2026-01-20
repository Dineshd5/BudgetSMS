import React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

export const ChevronLeft = (props: SvgProps) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
        <Path
            d="M15.41 7.41L14 6L8 12L14 18L15.41 16.59L10.83 12L15.41 7.41Z"
            fill={props.color || "#000"}
        />
    </Svg>
);

export const ChevronRight = (props: SvgProps) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
        <Path
            d="M10 6L8.59 7.41L13.17 12L8.59 16.59L10 18L16 12L10 6Z"
            fill={props.color || "#000"}
        />
    </Svg>
);
