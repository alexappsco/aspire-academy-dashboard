import { useMediaQuery } from "react-responsive";

const useIsTab = (): boolean => {
  return useMediaQuery({ minWidth: 768, maxWidth: 1223 });
};

export default useIsTab;
