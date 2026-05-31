import {Tabs} from "expo-router";
import {TABS} from "@/constants/data";
import {Image, View} from "react-native";
// eslint-disable-next-line import/no-named-as-default
import clsx from "clsx";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {colors, components} from "@/constants/theme";

const TabLayout = () => {
    const insets = useSafeAreaInsets();
    const tabBar = components.tabBar;
    const TabIcon = ({focused, icon}: TabIconProps) => {
        return (
            <View className="tabs-icon">
                <View className={clsx('tabs-pill', focused && 'tabs-active')}>
                    <Image source={icon}  resizeMode='contain' className="tabs-glyph"/>
                </View>
            </View>
        )
    };
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarStyle: {
                    position: "absolute",
                    bottom: Math.max(insets.bottom, tabBar.horizontalInset),
                    height: tabBar.height,
                    marginHorizontal: tabBar.horizontalInset,
                    borderRadius: tabBar.radius,
                    backgroundColor: colors.primary,
                    borderTopWidth: 0,
                    elevation: 0,
                },
                tabBarItemStyle: {
                    paddingVertical: tabBar.height / 2 - tabBar.iconFrame / 1.6
                },
                tabBarIconStyle: {
                    width: tabBar.iconFrame,
                    height: tabBar.iconFrame,
                    alignItems: "center",
                }

            }}>

            {TABS.map((tab) => (
                <Tabs.Screen
                    key={tab.name}
                    name={tab.name}
                    options={{
                        title: tab.title,
                        tabBarIcon: ({focused}) => (
                            <TabIcon focused={focused} icon={tab.icon}/>
                        )
                    }}/>

            ))}
        </Tabs>
    )
}

export default TabLayout;