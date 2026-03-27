import * as React from "react";
import Svg, { Path } from "react-native-svg";
const SearchIcon = ({ color = "#535353", ...props }: any) => (
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
      d="m15 15 6 6m-11-4a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z"
    />
  </Svg>
);
export default SearchIcon;
