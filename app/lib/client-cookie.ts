import Cookies from "js-cookie";

export const storeCookie = (key: string, plainText: string, expired: number) => {
    Cookies.set(key, plainText, { expires: 1 });
}

export const getCookies = (key: string) => {
    return Cookies.get(key);
}

export const deleteCookie =  ( key: string) => {
    Cookies.remove(key);
}