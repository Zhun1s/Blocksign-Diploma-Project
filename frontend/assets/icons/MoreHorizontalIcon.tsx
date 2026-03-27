import * as React from "react";
import Svg, { Path } from "react-native-svg";
const MoreHorizontalIcon = ({ color = "#939393", ...props }: any) => (
  <Svg
    width={24}
    height={24}
    fill="none"
    {...props}
  >
    <Path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 12a1 1 0 1 0 2 0 1 1 0 0 0-2 0ZM11 12a1 1 0 1 0 2 0 1 1 0 0 0-2 0ZM5 12a1 1 0 1 0 2 0 1 1 0 0 0-2 0Z"
    />
  </Svg>
);
export default MoreHorizontalIcon;
