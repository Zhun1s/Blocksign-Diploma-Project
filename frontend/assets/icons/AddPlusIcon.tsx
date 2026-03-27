import * as React from "react";
import Svg, { Path } from "react-native-svg";
const AddPlusIcon = ({ color = "currentColor", ...props }: any) => (
  <Svg
    width={32}
    height={32}
    viewBox="0 0 24 24"
    fill="none"
    {...props}
  >
    <Path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 12h6m0 0h6m-6 0v6m0-6V6"
    />
  </Svg>
);
export default AddPlusIcon;
