import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
const ArrowRightIcon = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    {...props}
  >
    <Path
      stroke="#8C8C8C"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="m9 5 7 7-7 7"
    />
  </Svg>
);
export default ArrowRightIcon;
