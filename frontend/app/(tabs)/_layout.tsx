import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";

export default function TabLayout() {
  const { colors } = useTheme();
  const { t } = useLanguage();

  return (
    <NativeTabs
      minimizeBehavior="onScrollDown"
      labelStyle={{ color: colors.text, fontWeight: "600", fontSize: 10 }}
      tintColor={colors.text}
      z-index={100}
    >
      <NativeTabs.Trigger name="index">
        <Label>{t("home")}</Label>
        <Icon sf="house.fill" drawable="custom_android_drawable" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="projects">
        <Icon sf="folder.fill" drawable="custom_folder_drawable" />
        <Label>{t("myProjects")}</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Icon sf="person.crop.circle" drawable="custom_profile_drawable" />
        <Label>{t("profile")}</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
