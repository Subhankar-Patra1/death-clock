import useLocalStorage from './useLocalStorage';

export const useCollapsibleWidget = (key: string, initialCollapsed: boolean = false): [boolean, () => void] => {
  const [isCollapsed, setIsCollapsed] = useLocalStorage<boolean>(key, initialCollapsed);

  const toggleCollapsed = () => {
    setIsCollapsed(prev => !prev);
  };

  return [isCollapsed, toggleCollapsed];
};
