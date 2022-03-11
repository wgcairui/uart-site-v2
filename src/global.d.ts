/**
 * 微信登录加载的配置
 */
interface wxConfig {
    /**
     * 插入的iframe文档id
     */
    id: string;
    /**
     * 微信开放平台项目id
     */
    appid: string;
    /**
     * 微信默认配置
     */
    scope: "snsapi_login";
    /**
     * 成功后跳转的url
     */
    redirect_uri: string;
    /**
     * 携带的key,自定义
     */
    state: string;
    /**
     * 样式文件
     */
    href: string;
}


interface Window {
    /**
     * 微信登录加载
     */
    WxLogin: (opt: wxConfig) => void
}