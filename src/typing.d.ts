import { FunctionComponent } from "react";
/**
 * 通用的props配置
 */
interface universalProps {
    [x: string]: any

}

/**
 * 通用返回数据
 */
interface Result {
    code: number
    msg: string
}

/**
 * 包装通用api返回数据
 */
type universalResult<T = {}> = Result & T