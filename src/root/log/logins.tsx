import { loguserlogins } from "../../common/FecthRoot"
import { getColumnSearchProp } from "../../common/tableCommon"
import { Log } from "./log"

/**
 * 用户登录日志
 * @returns 
 */
 export const LogUserlogins: React.FC = () => {
    return (
        <Log
            lastDay={20}
            dataFun={loguserlogins}
            cPie={['user', 'type']}
            columns={[
                {
                    dataIndex: 'user',
                    title: 'user',
                    ...getColumnSearchProp('user')
                },
                {
                    dataIndex: 'type',
                    title: 'type'
                },
                {
                    dataIndex: 'msg',
                    title: 'msg'
                },
                {
                    dataIndex: 'address',
                    title: 'address'
                }
            ]}
        >
        </Log>
    )
}

export default LogUserlogins