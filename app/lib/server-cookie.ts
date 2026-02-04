import Cookies from "js-cookie";
import { cookies } from "next/headers";

/**
 * Gets a cookie by its key.
 * @param {string} key - The key of the cookie to retrieve.
 * @returns {string} The value of the cookie if it exists, or undefined if it does not.
 */

export const getCookie = async (key: string): Promise<string> => {
    return (await cookies()).get(key)?.value || '';

}


export const setCookie = async (key: string, value: string) => {
    (await cookies()).set(key, value);
}

export const removeCookie = async (key: string) => {
    (await cookies()).delete(key);
}

