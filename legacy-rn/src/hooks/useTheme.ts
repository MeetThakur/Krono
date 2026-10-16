import { useThemeStore } from '../stores/useThemeStore';
import { darkColors, lightColors } from '../theme/colors';
import { themePalettes } from '../theme/md3-theme';

export const useTheme = () => {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const themeColor = useThemeStore((state) => state.themeColor);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const setThemeColor = useThemeStore((state) => state.setThemeColor);

  const baseColors = isDarkMode ? darkColors : lightColors;
  const palette = themePalettes[themeColor] || themePalettes.monochrome;
  const dynamicPrimary = isDarkMode ? palette.dark : palette.light;
  const dynamicContainer = isDarkMode ? palette.darkContainer : palette.lightContainer;
  const onDynamicContainer = isDarkMode ? palette.onDarkContainer : palette.onLightContainer;

  return {
    colors: {
      ...baseColors,
      primary: dynamicPrimary,
      primaryContainer: dynamicContainer,
      onPrimaryContainer: onDynamicContainer,
    },
    isDarkMode,
    themeColor,
    toggleTheme,
    setThemeColor,
  };
};

