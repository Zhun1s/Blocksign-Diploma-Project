import * as React from "react";
import Svg, { Path } from "react-native-svg";
const ChevronRightIcon = ({ color = "#8C8C8C", size = 16, ...props }: any) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2.5}
      d="m9 5 7 7-7 7"
    />
  </Svg>
);
export default ChevronRightIcon;
