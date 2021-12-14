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