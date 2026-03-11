import * as React from "react";
import Svg, { Path } from "react-native-svg";
const MoreHorizontalIcon = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    {...props}
  >
    <Path
      stroke="#939393"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 12a1 1 0 1 0 2 0 1 1 0 0 0-2 0ZM11 12a1 1 0 1 0 2 0 1 1 0 0 0-2 0ZM5 12a1 1 0 1 0 2 0 1 1 0 0 0-2 0Z"
    />
  </Svg>
);
export default MoreHorizontalIcon;
