import * as React from "react";
import Svg, { Path } from "react-native-svg";
const LogOutIcon = ({ color = "#000", size = 24, ...props }: any) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m7 14 5-5-5-5m5 5H9"
    />
  </Svg>
);
export default LogOutIcon;
