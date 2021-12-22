import { PieConfig } from "@ant-design/charts";

/**
 * 饼图数据
 */
export interface pieData {
    type: string
    value: number
}


/**
 * 饼图配置
 */

export const pieConfig = (config: Pick<PieConfig, 'angleField' | 'colorField' | 'radius'> & { onClick?: (type: string) => void }): any => {

    return {
        angleField: config.angleField,
        colorField: config.colorField,
        radius: config.radius,
        label: {
            type: 'spider',
            labelHeight: 28,
            content: '{name}:{percentage}',
        },
        interactions: [
            {
                type: 'element-selected',
            },
            {
                type: 'element-active',
            },
        ],
        onReady: (p: any) => {
            p.on('plot:click', (e: any) => {
                if (config.onClick) config.onClick(e.data.data.type)
            })
        }
    }
}   