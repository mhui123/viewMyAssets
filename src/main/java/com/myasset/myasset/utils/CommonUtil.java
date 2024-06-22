package com.myasset.myasset.utils;

import org.springframework.util.StringUtils;

public class CommonUtil {
    public static String nullChk(String target, String replacement) {
        String result = "";
        if (!StringUtils.hasText(target)) {
            result = replacement;
        } else {
            result = target;
        }
        return result;
    }
}
