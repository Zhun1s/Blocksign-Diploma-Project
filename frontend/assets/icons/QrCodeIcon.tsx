import * as React from "react";
import Svg, { Path, Rect } from "react-native-svg";
const QrCodeIcon = ({ color = "#000", size = 24, ...props }: any) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Rect x={3} y={3} width={7} height={7} rx={1} stroke={color} strokeWidth={2} />
    <Rect x={14} y={3} width={7} height={7} rx={1} stroke={color} strokeWidth={2} />
    <Rect x={3} y={14} width={7} height={7} rx={1} stroke={color} strokeWidth={2} />
    <Path stroke={color} strokeWidth={2} strokeLinecap="round" d="M14 14h3m4 0h-1m-6 4h7m-7 3h3m4 0h-1" />
  </Svg>
);
export default QrCodeIcon;
