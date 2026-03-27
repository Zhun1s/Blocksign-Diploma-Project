import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

const ArrowLeftIcon = ({ color = "#000", ...props }: SvgProps) => (
  <Svg width={24} height={24} fill="none" {...props}>
    <Path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="m15 19-7-7 7-7"
    />
  </Svg>
);
export default ArrowLeftIcon;
