import { useMediaQuery } from "react-responsive";

interface UseIsMobileProps {
    maxWidth?: number;
}

/**
 * Hook to detect if the current viewport is mobile size
 * @param maxWidth - Maximum width to consider as mobile (default: 767)
 * @returns boolean indicating if the viewport is mobile size
 */
const useIsMobile = (maxWidth?: number): boolean => {
    const isMobile = useMediaQuery({ maxWidth: maxWidth || 767 });
    return isMobile;
};

export default useIsMobile;
