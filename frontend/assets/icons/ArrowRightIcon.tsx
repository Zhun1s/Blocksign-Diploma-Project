import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
const ArrowRightIcon = ({ color = "#8C8C8C", ...props }: any) => (
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
      d="m9 5 7 7-7 7"
    />
  </Svg>
);
export default ArrowRightIcon;
