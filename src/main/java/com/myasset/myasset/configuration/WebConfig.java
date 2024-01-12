package com.myasset.myasset.configuration;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/* CORS 구성 클래스 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("https://api.finance.naver.com") // 허용할 주소. 모든 주소 허용시 "*"
                .allowedMethods("GET", "POST")
                .maxAge(3000);
    }

}
