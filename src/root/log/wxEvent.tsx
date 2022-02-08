import { log_wxEvent } from "../../common/FecthRoot"
import { getColumnSearchProp } from "../../common/tableCommon"
import { Log, DesList } from "./log"

export const LogWxEvent: React.FC = () => {
    return (
        <Log
            dataFun={log_wxEvent}
            cPie={[
                'MsgType',
                'Event',
                'FromUserName']}
            columns={[
                {
                    dataIndex: 'FromUserName',
                    title: '用户',
                    ...getColumnSearchProp('FromUserName')
                },
                {
                    dataIndex: 'MsgType',
                    title: '类型'
                },
                {
                    dataIndex: 'Content',
                    title: 'Content'
                },
                {
                    dataIndex: 'Event',
                    title: '事件'
                }
            ]}

            expandable={{
                expandedRowRender: li => <DesList title="Data" data={li} />
            }}
        />
    )
}


export default LogWxEvent