import { universalResult } from "../typing";

export const getToken = () => {
  const token = localStorage.getItem("token");
  return token ? "bearer%20" + JSON.parse(token) : token;
};

export const header = () => {
  const header = new Headers({
    "content-type": "application/json",
  });
  const token = getToken();
  token && header.append("authorization", token);
  return header;
};

export const Post = async <T>(
  path: string,
  data: { [x: string]: any }
): Promise<T> => {
  const body = JSON.stringify(data);
  const res = await fetch(path, {
    method: "POST",
    headers: header(),
    body,
  });
  return await res.json();
};

export const Get = async <T>(
  path: string,
  data?: { [x: string]: string }
): Promise<T> => {
  const body = data
    ? Object.entries(data)
        .map(([key, val]) => key + "=" + val)
        .join("&")
    : "";
  const res = await fetch(path + "?" + body, {
    method: "GET",
    headers: header(),
  });
  return await res.json();
};

/**
 * 获取协议告警数据集合
 * @param protocol
 * @param type
 * @param user
 * @returns
 */
export const getProtocolSetup = <T = string>(
  protocol: string,
  type: Uart.ConstantThresholdType,
  user?: string
) => {
  return axios<{ sys: T[]; user: T[] }>("getProtocolSetup", {
    protocol,
    type,
    user,
  });
};

/**
 * 添加用户
 * @param name
 * @param user
 * @param passwd
 * @param tel x
 * @param mail
 * @param company
 * @returns
 */
export const addUser = (
  name: string,
  user: string,
  passwd: string,
  tel: string,
  mail: string,
  company: string
) => {
  return axios("guest/addUser", { name, user, passwd, tel, mail, company });
};

/**
 * 重置密码到发送验证码
 * @param user
 * @returns
 */
export const resetPasswdValidation = (user: string) => {
  return axios("guest/resetPasswdValidation", { user });
};

/**
 * 重置用户密码
 * @param user
 * @param passwd
 * @param code
 * @returns
 */
export const resetUserPasswd = (user: string, passwd: string, code: string) => {
  return axios("guest/resetUserPasswd", { user, passwd, code });
};

/**
 * 微信登录
 * @param code
 * @param state
 * @returns
 */
export const wxlogin = (code: string, state: string) => {
  return axios("auth/wxlogin", { code, state });
};

export const crc = (data: any) => {
  return axios<string>("open/crc", { ...data });
};

/**
 * 获取用户绑定设备
 * @returns
 */
export const BindDev = () => {
  return axios<Uart.BindDevice>("BindDev");
};

/**
 * 获取用户信息
 * @returns
 */
export const userInfo = () => {
  return axios<Uart.UserInfo>("userInfo");
};

/**
 * 获取用户告警
 * @param start
 * @param end
 * @returns
 */
export const getAlarm = (
  start: string = new Date().toLocaleDateString().replace(/\//g, "-") +
    " 0:00:00",
  end: string = new Date().toLocaleDateString().replace(/\//g, "-") +
    " 23:59:59"
) => {
  return axios<(Uart.uartAlarmObject & { _id?: string })[]>(
    "loguartterminaldatatransfinites",
    { start, end }
  );
};

/**
 * 确认用户告警
 * @param id
 * @returns
 */
export const confrimAlarm = (id?: string) => {
  return axios("confrimAlarm", { id });
};

/**
 * 获取指定且在线的终端
 * @param mac
 * @returns
 */
export const getTerminalOnline = (mac: string) => {
  return axios<Uart.Terminal | null>("getTerminalOnline", { mac });
};

/**
 * 修改用户设备别名
 * @param mac
 * @param name
 * @returns
 */
export const modifyTerminal = (mac: string, name: string) => {
  return axios("modifyTerminal", { mac, name });
};

/**
 * 添加绑定设备
 * @param mac
 */
export const addUserTerminal = (mac: string) => {
  return axios("addUserTerminal", { mac });
};

/**
 * 删除绑定设备
 * @param mac
 * @returns
 */
export const delUserTerminal = (mac: string) => {
  return axios("delUserTerminal", { mac });
};

/**
 * 获取设备类型
 * @param Type
 * @returns
 */
export const getDevTypes = (Type: string) => {
  return axios<Uart.DevsType[]>("getDevTypes", { Type });
};

/**
 * 删除终端挂载设备
 * @param mac
 * @param pid
 */
export const delTerminalMountDev = (mac: string, pid: number) => {
  return axios("delTerminalMountDev", { mac, pid });
};

/**
 *   添加用户终端挂载设备
 * @param mac
 * @param param2
 * @returns
 */
export const addTerminalMountDev = (
  mac: string,
  mountDev: Uart.TerminalMountDevs
) => {
  return axios("addTerminalMountDev", { mac, mountDev });
};

/**
 * 获取用户告警配置
 * @param user
 * @param filter
 * @returns
 */
export const getUserAlarmSetup = () => {
  return axios<Uart.userSetup>("getUserAlarmSetup");
};

/**
 * 修改用户告警配置联系方式
 * @param tels 联系电话
 * @param mails 联系邮箱
 * @returns
 */
export const modifyUserAlarmSetupTel = (tels: string[], mails: string[]) => {
  return axios("modifyUserAlarmSetupTel", { tels, mails });
};

/**
 * 修改用户信息
 * @param user
 * @param data
 * @returns
 */
export const modifyUserInfo = (data: Partial<Uart.UserInfo>) => {
  return axios("modifyUserInfo", { data });
};

/**
 * 获取公众号二维码
 * @param user
 * @returns
 */
export const mpTicket = () => {
  return axios<string>("mpTicket");
};

/**
 * 获取小程序二维码
 * @param user
 * @returns
 */
export const wpTicket = () => {
  return axios<string>("wpTicket");
};

/**
 * 获取用户单个协议告警配置
 * @param protocol
 */
export const getUserAlarmProtocol = (protocol: string) => {
  return axios<Uart.ProtocolConstantThreshold>("getUserAlarmProtocol", {
    protocol,
  });
};

/**
 * 获取单个协议告警配置
 * @param protocol
 */
export const getAlarmProtocol = (protocol: string) => {
  return axios<Uart.ProtocolConstantThreshold>("getAlarmProtocol", {
    protocol,
  });
};

/**
 * 获取用户设备运行数据
 * @param mac
 * @param pid
 */
export const getTerminalData = (mac: string, pid: number | string) => {
  return axios<Uart.queryResultSave>("getTerminalData", { mac, pid });
};

/**
 * 获取用户设备历史运行数据
 * @param mac
 * @param pid
 * @param name
 * @param datetime
 * @deprecated 请使用getTerminalDatasV2
 * @returns
 */
export const getTerminalDatas = (
  mac: string,
  pid: number | string,
  name: string | string[],
  datetime: string
) => {
  const names =
    typeof name === "string" ? name : name.length > 1 ? name : name[0];
  return axios<Uart.queryResultSave[]>("getTerminalDatas", {
    mac,
    pid,
    name: names,
    datetime,
  });
};

interface datas {
  name: string;
  value: string;
  time: number;
}
[];

/**
 * 获取用户设备历史运行数据
 * @param mac
 * @param pid
 * @param name
 * @param datetime
 * @returns
 */
export const getTerminalDatasV2 = (
  mac: string,
  pid: number | string,
  name: string | string[],
  start: number,
  end: number
) => {
  const names =
    typeof name === "string" ? name : name.length > 1 ? name : name[0] || [];
  return axios<datas[]>("getTerminalDatasV2", {
    mac,
    pid,
    name: names,
    start,
    end,
  });
};

/**
 * 重置设备超时状态
 * @param mac
 * @param pid
 */
export const refreshDevTimeOut = (
  mac: string,
  pid: number,
  interVal?: number
) => {
  return axios("refreshDevTimeOut", { mac, pid, interVal });
};

/**
 * 固定发送设备操作指令
 * @param query
 * @param item
 * @returns
 */
export const SendProcotolInstructSet = (
  query: Pick<
    Uart.instructQueryArg,
    "DevMac" | "pid" | "protocol" | "mountDev"
  >,
  item: Uart.OprateInstruct
) => {
  return axios<Uart.ApolloMongoResult>("SendProcotolInstructSet", {
    query,
    item,
  });
};

/**
 * 获取指定协议
 * @param protocol
 * @returns
 */
export const getProtocol = (protocol: string) => {
  return axios<Uart.protocol>("getProtocol", { protocol });
};

/**
 * 设置用户自定义设置(协议配置)
 * @param Protocol 协议
 * @param type 操作类型
 * @param arg 参数
 * @returns
 */
export const setUserSetupProtocol = (
  protocol: string,
  type: Uart.ConstantThresholdType,
  arg: any
) => {
  return axios<Uart.ApolloMongoResult>("setUserSetupProtocol", {
    protocol,
    type,
    arg,
  });
};

/**
 * 设备设备别名
 * @param mac
 * @param pid
 * @param protocol
 * @param name
 * @param alias
 * @returns
 */
export const setAlias = (
  mac: string,
  pid: number,
  protocol: string,
  name: string,
  alias: string
) => {
  return axios("setAlias", { mac, pid, protocol, name, alias });
};

/**
 * 获取终端信息
 * @param mac
 * @returns
 */
export const getTerminal = (mac: string) => {
  return axios<Uart.Terminal>("getTerminal", { mac });
};

/**
 *  获取用户布局配置
 * @param id
 */
export const getUserLayout = (id: string) => {
  return axios<Uart.userLayout>("getUserLayout", { id });
};

/**
 *  获取用户布局配置
 * @param id
 */
export const getAggregation = (id: string) => {
  return axios<Uart.Aggregation>("getAggregation", { id });
};

/**
 * 添加聚合设备
 * @param name
 * @param aggs
 * @returns
 */
export const addAggregation = (name: string, aggs: Uart.AggregationDev[]) => {
  return axios("addAggregation", { name, aggs });
};

/**
 * 删除聚合设备
 * @param user
 * @param id
 * @returns
 */
export const deleteAggregation = (id: string) => {
  return axios("deleteAggregation", { id });
};

/**
 * 设置用户布局配置
 * @param id
 * @param type
 * @param bg
 * @param Layout
 */
export const setUserLayout = (
  id: string,
  type: string,
  bg: string,
  Layout: Uart.AggregationLayoutNode[]
) => {
  return axios<Uart.ApolloMongoResult>("setUserLayout", {
    id,
    type,
    bg,
    Layout,
  });
};

// V2 gps转高德gps
export const V2_API_Aamp_gps2autoanvi = (
  locations: string | string[],
  coordsys: "gps" | "mapbar" | "baidu" = "gps"
) => {
  return axios<string | string[]>("util/AMap/GPS2autonavi", {
    coordsys,
    locations: Array.isArray(locations) ? locations.join("|") : locations,
  });
};

// V2 ip转gps
export const V2_API_Aamp_ip2local = async (
  ip: string = "114.2083633,29.75025723"
) => {
  const { data } = await axios<string>("util/AMap/IP2loction", { ip });
  const [l, n] = data.split(",").map(Number);
  return new AMap.LngLat(l, n);
};

/**
 * a根据mac和pid获取挂载设备
 * @param mac
 * @param pid
 * @returns
 */
export const getTerminalPidProtocol = (mac: string, pid: number | string) => {
  return axios<Uart.TerminalMountDevs>("getTerminalPidProtocol", { mac, pid:Number(pid) });
};

/**
 * 获取crc16
 * @param data 
 * @returns 
 */
export const Crc = (data: any) => {
  return axios<string>("open/crc", { ...data });
};

/**
 *
 * @param type
 * @param datas
 * @param config
 * @returns
 */
const axios = async <T = any>(
  type: string,
  datas?: any
): Promise<universalResult<T>> => {
  try {
    const result = await Post<universalResult<T>>(
      "/api/" + type,
      datas
    );
    // 如果code为201,校验客户短信验证身份
    /* if (result.code === 201) {
            const isValidation = await MessageBox.confirm("此操作需要校验身份,是否校验?").catch(() => false)
            if (isValidation) {
                const smsResult = await axios('smsValidation')
                if (smsResult.code) {
                    const val = await MessageBox.prompt(`已发送校验码到${smsResult.msg}`, { type: "info", title: '输入校验码' }).catch(() => false)
                    if (val) {
                        const codeValidation = await axios("smsCodeValidation", { code: (val as any).value })
                        if (codeValidation.code) {
                            return await axios((result.method as string).replace("/api/", ''), result.data)
                        } else {
                            Message.error(codeValidation.msg)
                            throw new Error()
                        }
                    } else {
                        Message.error("取消操作")
                        throw new Error()
                    }

                } else {
                    MessageBox.alert(smsResult.msg, { type: "error", title: '短信校验出错' })
                    throw new Error(smsResult.msg)
                }
            } else {
                Message.error("取消操作")
                throw new Error()
            }
        } else {
            return result
        } */

    return result;
  } catch (err: any) {
    console.error(err.message || type + ":fetch遇到错误");
    return {} as any;
  }
};

const AmapKey: string = "0e99d0426f1afb11f2b95864ebd898d0";
const ApiAddress: string = "https://restapi.amap.com/v3/";

//const axios:NuxtAxiosInstance = Nuxtaxios
type restype =
  | "ip"
  | "geocode/geo"
  | "geocode/regeo"
  | "assistant/coordinate/convert";

interface AmapResonp {
  status: string;
  info: string;
  infocode: string;
}

interface AmapResonpIP extends AmapResonp {
  province: string;
  city: string;
  adcode: string;
  rectangle: string;
}

interface AmapResonpGeocodeGeo extends AmapResonp {
  count: string;
  geocodes: {
    formatted_address: string;
    country: string;
    province: string;
    citycode: string;
    city: string;
    district: string;
    adcode: string;
    street: string;
    number: string;
    location: string;
    level: string;
  }[];
}

interface AmapResonpGeocodeRegeo extends AmapResonp {
  regeocode: {
    formatted_address: string;
  };
}

interface AmapResonpAutonavi extends AmapResonp {
  locations: string;
}

// gps字符串转高德point
export const Amap_gps2AutonaviPosition = async (
  gps: string,
  window: Window & typeof globalThis
) => {
  const sgps = gps.split(",").map((el: string) => parseFloat(el)) as [
    number,
    number
  ] as any;
  return await new Promise<AMap.LngLat>((res) => {
    window.AMap.convertFrom(
      sgps,
      "gps",
      (stat: any, result: { locations: any[] }) => {
        const jws = result.locations[0];
        res(jws);
      }
    );
  });
};

/**
 * 定位字符串转AMap.LngLat
 * @param string
 */
export const stringToLngLat = (jw: string) => {
  const [lng, lat] = jw.split(",").map((el) => Number.parseFloat(el));
  return new window.AMap.LngLat(lng, lat, true);
};

// ip转gps
export const Aamp_ip2local = async (ip: string) => {
  const data = await AmapGet<AmapResonpIP>("ip", { ip });
  const jw =
    typeof data.rectangle === "string"
      ? (data.rectangle
          .split(";")[0]
          .split(",")
          .map((el) => parseFloat(el)) as [number, number])
      : ([0.0, 0.0] as [number, number]);
  return new AMap.LngLat(...jw);
};

// 地址转gps
export const Aamp_address2local = (address: string) => {
  return AmapGet<AmapResonpGeocodeGeo>("geocode/geo", { address });
};
// gps转地址
export const Aamp_local2address = (location: string) => {
  return AmapGet<AmapResonpGeocodeRegeo>("geocode/regeo", { location });
};

// gps转高德gps
export const Aamp_gps2autoanvi = (
  coordsys: "gps" | "mapbar" | "baidu",
  locations: string
) => {
  return AmapGet<AmapResonpAutonavi>("assistant/coordinate/convert", {
    coordsys,
    locations,
  });
};

async function AmapGet<T>(
  type: restype,
  params: Record<string, string>
): Promise<T> {
  const result = await Get<universalResult<T>>(ApiAddress + type, {
    key: AmapKey,
    ...params,
  });
  return result.data;
}
