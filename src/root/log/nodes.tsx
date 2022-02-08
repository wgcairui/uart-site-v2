import { lognodes } from "../../common/FecthRoot"
import { Log } from "./log"

/**
 * 节点日志
 * @returns 
 */
 export const LogNode: React.FC = () => {
    return (
        <Log lastDay={60} dataFun={lognodes}
            cPie={['Name', 'type']}
            columns={[
                {
                    dataIndex: 'Name',
                    title: 'Name',

                },
                {
                    dataIndex: 'type',
                    title: '事件',
                },
                {
                    dataIndex: 'ID',
                    title: 'socketId'
                }
            ]}></Log>
    )
}

export default LogNode