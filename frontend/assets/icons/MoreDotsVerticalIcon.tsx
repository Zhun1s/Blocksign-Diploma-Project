import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
const MoreDotsVerticalIcon = ({ color = "#000", ...props }: any) => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    {...props}
  >
    <Path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM12 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
    />
  </Svg>
);
export default MoreDotsVerticalIcon;
