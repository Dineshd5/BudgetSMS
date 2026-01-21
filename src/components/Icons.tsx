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

export const UserIcon = (props: SvgProps) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
        <Path d="M20 21C20 19.6044 20 18.9067 19.8278 18.3389C19.44 17.0605 18.4395 16.06 17.1611 15.6722C16.5933 15.5 15.8956 15.5 14.5 15.5H9.5C8.10444 15.5 7.40665 15.5 6.83886 15.6722C5.56045 16.06 4.56004 17.0605 4.17224 18.3389C4 18.9067 4 19.6044 4 21M16.5 7.5C16.5 9.98528 14.4853 12 12 12C9.51472 12 7.5 9.98528 7.5 7.5C7.5 5.01472 9.51472 3 12 3C14.4853 3 16.5 5.01472 16.5 7.5Z" stroke={props.color || "#000"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const EditIcon = (props: SvgProps) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
        <Path d="M11 4H4C2.89543 4 2 4.89543 2 6V20C2 21.1046 2.89543 22 4 22H18C19.1046 22 20 21.1046 20 20V13M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke={props.color || "#000"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const InfoIcon = (props: SvgProps) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
        <Path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke={props.color || "#000"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M12 16V12M12 8H12.01" stroke={props.color || "#000"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const MoonIcon = (props: SvgProps) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
        <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" stroke={props.color || "#000"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const SunIcon = (props: SvgProps) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
        <Path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22M12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17Z" stroke={props.color || "#000"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const LockIcon = (props: SvgProps) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
        <Path d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z" stroke={props.color || "#000"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M7 11V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V11" stroke={props.color || "#000"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const ExportIcon = (props: SvgProps) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
        <Path d="M4 17V19C4 19.5304 4.21071 20.0391 4.58579 20.4142C4.96086 20.7893 5.46957 21 6 21H18C18.5304 21 19.0391 20.7893 19.4142 20.4142C19.7893 20.0391 20 19.5304 20 19V17M12 15V3M12 3L7 8M12 3L17 8" stroke={props.color || "#000"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const TrashIcon = (props: SvgProps) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
        <Path d="M3 6H5H21M19 6V20C19 21 18 22 17 22H7C6 22 5 21 5 20V6M8 6V4C8 3 9 2 10 2H14C15 2 16 3 16 4V6M10 11V17M14 11V17" stroke={props.color || "#000"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const BulbIcon = (props: SvgProps) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
        <Path d="M9 21H15M10 21H14M12 21V19M4.2 11.2C4.2 15.6 7.8 19 12 19C16.2 19 19.8 15.6 19.8 11.2C19.8 7.33401 16.3088 4.2 12 4.2C7.69117 4.2 4.2 7.33401 4.2 11.2Z" stroke={props.color || "#000"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M12 2V4M2.38 6.42L3.8 7.84M20.2 7.84L21.62 6.42M2 13H4M20 13H22" stroke={props.color || "#000"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const SettingsIcon = (props: SvgProps) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
        <Path d="M20.2 12.0163C20.2798 12.8687 20.8936 13.5682 21.7288 13.7547C22.6953 13.9706 23.3361 14.8988 23.2384 15.882L22.9592 18.6677C22.8631 19.636 22.0674 20.3688 21.107 20.4071C20.2783 20.4401 19.5705 20.916 19.2274 12.6506L18.4279 13.0112C17.653 13.3607 17.1517 14.1037 17.1706 14.9542L17.2029 16.3467" stroke={props.color || "#000"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke={props.color || "#000"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M19.4 15C19.4 15 21.4 17 21.4 17" stroke={props.color || "#000"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Simplified generic gear approximation for brevity without huge path, using a circle based representation if paths are too complex, but let's try a simpler gear path */}
        <Path d="M10.325 4.317C10.559 2.96 11.97 2.153 13.25 2.57l.036.012c1.36.46 2.05 1.986 1.48 3.287-.31.705-.28 1.545.18 2.19l.34.48c.67.94 1.93 1.25 2.97.7l.04-.02c1.33-.71 2.97-.08 3.51 1.34L22 11m-10-9c-2.3 0-4.3 1-5.7 2.6L4.8 6.5C3.5 8.1 3 10 3 12s.5 3.9 1.8 5.5l1.5 1.9C7.7 21 9.7 22 12 22s4.3-1 5.7-2.6l1.5-1.9c1.3-1.6 1.8-3.5 1.8-5.5" stroke={props.color || "#000"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const CloseIcon = (props: SvgProps) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
        <Path d="M18 6L6 18M6 6L18 18" stroke={props.color || "#000"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const CheckIcon = (props: SvgProps) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
        <Path d="M20 6L9 17L4 12" stroke={props.color || "#000"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const CalendarIcon = (props: SvgProps) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
        <Path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke={props.color || "#000"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M16 2V6M8 2V6M3 10H21" stroke={props.color || "#000"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const MoneyIcon = (props: SvgProps) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
        <Path d="M12 1C5.925 1 1 3.5 1 12C1 20.5 5.925 23 12 23C18.075 23 23 20.5 23 12C23 3.5 18.075 1 12 1ZM12 21C6.5 21 3 19 3 12C3 5 6.5 3 12 3C17.5 3 21 5 21 12C21 19 17.5 21 12 21Z" fill={props.color || "#000"} fillOpacity="0.1" />
        <Path d="M12 6V18M16 10C16 10 14.5 9 12 9C9.5 9 9 10 9 12C9 14 10.5 15 12 15C14.5 15 15 14 15 14" stroke={props.color || "#000"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const AlertIcon = (props: SvgProps) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
        <Path d="M10.29 3.86L1.82 18C1.64538 18.3024 1.55296 18.6453 1.55196 18.9945C1.55096 19.3437 1.64142 19.6871 1.81436 19.9905C1.98729 20.2939 2.23673 20.5466 2.53773 20.7239C2.83873 20.9012 3.1808 20.997 3.53 21H20.47C20.8192 20.997 21.1613 20.9012 21.4623 20.7239C21.7633 20.5466 22.0127 20.2939 22.1856 19.9905C22.3586 19.6871 22.449 19.3437 22.448 18.9945C22.447 18.6453 22.3546 18.3024 22.18 18L13.71 3.86C13.5317 3.56613 13.2807 3.32314 12.9813 3.15448C12.6819 2.98582 12.3442 2.89722 12 2.89722C11.6558 2.89722 11.3181 2.98582 11.0187 3.15448C10.7193 3.32314 10.4683 3.56613 10.29 3.86V3.86Z" stroke={props.color || "#000"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M12 9V13" stroke={props.color || "#000"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M12 17H12.01" stroke={props.color || "#000"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const WalletIcon = (props: SvgProps) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
        <Path d="M21 7H3C2.44772 7 2 7.44772 2 8V20C2 20.5523 2.44772 21 3 21H21C21.5523 21 22 20.5523 22 20V8C22 7.44772 21.5523 7 21 7Z" stroke={props.color || "#000"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M16 3H8C6.89543 3 6 3.89543 6 5V7H18V5C18 3.89543 17.1046 3 16 3Z" stroke={props.color || "#000"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const EmptyBoxIcon = (props: SvgProps) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
        <Path d="M21 8V21H3V8" stroke={props.color || "#000"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M1 3H23V8H1V3Z" stroke={props.color || "#000"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M10 12H14" stroke={props.color || "#000"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const LedgerIcon = (props: SvgProps) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
        <Path d="M4 19.5C4 18.837 4.53705 18.3 5.2 18.3H19.5M4 19.5C4 20.163 4.53705 20.7 5.2 20.7H19.5V18.3H5.2C4.53705 18.3 4 18.837 4 19.5Z" stroke={props.color || "#000"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M19.5 4.5H8C5.79086 4.5 4 6.29086 4 8.5V19.5H19.5V4.5Z" stroke={props.color || "#000"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M9 13H15" stroke={props.color || "#000"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M9 9H15" stroke={props.color || "#000"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const SparklesIcon = (props: SvgProps) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
        <Path d="M12 2L9.2 8.6L2 12L9.2 15.4L12 22L14.8 15.4L22 12L14.8 8.6L12 2Z" stroke={props.color || "#000"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const HomeIcon = (props: SvgProps) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
        <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke={props.color || "#000"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M9 22V12h6v10" stroke={props.color || "#000"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const BarChartIcon = (props: SvgProps) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
        <Path d="M12 20V10" stroke={props.color || "#000"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M18 20V4" stroke={props.color || "#000"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M6 20V16" stroke={props.color || "#000"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const TargetIcon = (props: SvgProps) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
        <Path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" stroke={props.color || "#000"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M12 6a6 6 0 1 0 6 6 6 6 0 0 0-6-6zm0 10a4 4 0 1 1 4-4 4 4 0 0 1-4 4z" stroke={props.color || "#000"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const TrendingUpIcon = (props: SvgProps) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
        <Path d="M23 6L13.5 15.5L8.5 10.5L1 18" stroke={props.color || "#000"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M17 6H23V12" stroke={props.color || "#000"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const MoreHorizontalIcon = (props: SvgProps) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
        <Path d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z" stroke={props.color || "#000"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M19 13C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11C18.4477 11 18 11.4477 18 12C18 12.5523 18.4477 13 19 13Z" stroke={props.color || "#000"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M5 13C5.5523 13 6 12.5523 6 12C6 11.4477 5.5523 11 5 11C4.4477 11 4 11.4477 4 12C4 12.5523 4.4477 13 5 13Z" stroke={props.color || "#000"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const GoogleIcon = (props: SvgProps) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
        <Path d="M21.35 11.1H12V15.5H17.5C17.2 16.9 15 19.3 12 19.3C9.09998 19.3 6.69998 17 6.69998 13.9C6.69998 10.8 9.09998 8.49999 12 8.49999C13.6 8.49999 14.7 9.19999 15.3 9.79999L18.4 6.79999C16.6 5.09999 14.5 4 11.9 4C7.49998 4 3.99998 7.59999 3.99998 12C3.99998 16.4 7.49998 20 11.9 20C16.5 20 19.5 16.8 19.5 12.2C19.5 11.7 19.5 11.4 19.4 11.1H21.35Z" fill={props.color || "#000"} />
    </Svg>
);
