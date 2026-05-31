import {ImageSourcePropType} from "react-native";


declare global {

   interface TabIconProps{
        focused: boolean;
        icon: ImageSourcePropType;
    }
}
export = TabIconProps;