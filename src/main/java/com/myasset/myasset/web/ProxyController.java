package com.myasset.myasset.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.client.RestTemplate;

@Controller
@RequestMapping("/api")
public class ProxyController {
    private final RestTemplate restTemplate;

    public ProxyController(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @GetMapping("/data")
    @ResponseBody
    public String getData(@RequestParam String cd, @RequestParam String stdt, @RequestParam String eddt) {
        String apiUrl = "https://api.finance.naver.com/siseJson.naver?symbol=" + cd +
                "&requestType=1&startTime=" + stdt +
                "&endTime=" + eddt +
                "&timeframe=day";
        return restTemplate.getForObject(apiUrl, String.class);
    }

}