import { message, Modal } from "antd";
import { getProtocolSetup, getTerminalPidProtocol, SendProcotolInstructSet } from "./Fetch";
import { prompt } from "./prompt";

/**
   * 正则匹配手机号码
   * @param tel
   */
export const RegexTel = (tel: string | number) => {
    return /^(0|86|17951)?(13[0-9]|15[012356789]|166|17[3678]|18[0-9]|14[57])[0-9]{8}$/.test(
        String(tel)
    );
}

/**
 * 正则匹配邮箱账号
 * @param mail
 */
export const RegexMail = (mail: string) => {
    return /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/.test(mail);
}


/**
 * 发送操作指令
 * @param mac 
 * @param pid 
 * @param tag 操作指令标签
 * @param value 操作指令值
 * @returns 
 */
export const sendOprateInstruct = async (mac: string, pid: number | string, tag: string, value?: number) => {
    const loading = message.loading({ content: '正在发送', duration: 0 })
    const { data: mountDev } = await getTerminalPidProtocol(mac, pid)
    const { data: { sys } } = await getProtocolSetup<Uart.OprateInstruct>(mountDev.protocol, "OprateInstruct")
    const item = sys.find(el => el.tag === tag || el.name === tag)!
    if (value) {
        item.val = value
    }
    if (item.value.includes("%i") && !item.val) {
        const val = await prompt({ title: '请输入修改的值' })
        if (!val) {
            loading()
            return
        }
        item.val = Number(val);
    }

    await new Promise(resolve => {
        setTimeout(() => {
            resolve(0)
        }, 1000);
    })
    const { data } = await SendProcotolInstructSet({ DevMac: mac, pid: Number(pid), protocol: mountDev.protocol, mountDev: mountDev.mountDev }, item)
    loading()
    if (data) Modal.info({ content: data?.msg || '发送失败' })
    return data
}

/**
 * 粘贴板
 * @param val 要粘贴的值
 */
export const CopyClipboard = (val: string) => {
    let aux = document.createElement("input");
    aux.setAttribute("value", val);
    document.body.appendChild(aux);
    aux.select();
    document.execCommand("copy");
    document.body.removeChild(aux);
}


/**
 * 刷选出数组重复项
 * @param data 
 * @param key 
 * @returns 
 */
export const RepeatFilter = <T extends Record<string, any>>(data: T[], key: string = "type") => {
    let t: any = ""
    let i = false
    const arr: T[] = []
    data.forEach(el => {
        if (el[key]) {
            if (el[key] === t) {
                if (!i) {
                    arr.push(el)
                    i = true
                }
            } else {
                arr.push(el)
                i = false
                t = el[key]
            }
        }
    })
    return arr
}