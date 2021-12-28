import { NavigateOptions, useNavigate } from "react-router-dom";

/**
 * 路由导航组件
 * @returns 
 */
export const useNav = () => {
    const nav = useNavigate()
    return (path: string, query?: Record<string, string>, options?: NavigateOptions) => {
        const url = query ? `${path}?${new URLSearchParams(query).toString()}` : path
        return nav(url, options)
    }
}