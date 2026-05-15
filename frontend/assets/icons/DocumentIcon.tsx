import * as React from "react";
import Svg, { Path } from "react-native-svg";
const DocumentIcon = ({ color = "#000", size = 24, ...props }: any) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z"
    />
    <Path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M14 2v6h6M16 13H8m8 4H8m2-8H8"
    />
  </Svg>
);
export default DocumentIcon;
