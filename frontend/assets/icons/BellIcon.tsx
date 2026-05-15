import * as React from "react";
import Svg, { Path } from "react-native-svg";
const BellIcon = ({ color = "#000", size = 24, ...props }: any) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M18 8A6 6 0 1 0 6 8c0 7-3 9-3 9h18s-3-2-3-9Zm-4.27 13a2 2 0 0 1-3.46 0"
    />
  </Svg>
);
export default BellIcon;
