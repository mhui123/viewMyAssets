package com.myasset.myasset.web;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

import com.myasset.myasset.impl.MyAssetServiceImpl;
import com.myasset.myasset.vo.MyAssetVo;
import com.myasset.myasset.vo.PaginationInfo;

@Controller
public class MyAssetController {
    @Autowired
    private MyAssetServiceImpl impl;

    @GetMapping("/main")
    public String initPage() {
        return "myasset/main";
    }

    /**
     * @return
     */
    @ResponseBody
    @PostMapping("/getAllList")
    public Map<String, Object> getAllList(@RequestBody Map<String, Object> param) {
        Map<String, Object> resultMap = new HashMap<>();
        MyAssetVo vo = new MyAssetVo();
        List<MyAssetVo> voList = impl.getAssetAllList(vo);
        resultMap.put("voList", voList);
        return resultMap;
    }

    @ResponseBody
    @PostMapping("/getListOpt")
    public Map<String, Object> getList(@RequestBody Map<String, Object> param) {
        Map<String, Object> resultMap = new HashMap<>();
        MyAssetVo vo2 = new MyAssetVo();

        PaginationInfo pg = new PaginationInfo();
        int pageIndex = Integer.parseInt(nullChk((String) param.get("pageIndex"), "1"));
        int recordCountPerPage = Integer.parseInt(nullChk((String) param.get("pageUnit"), "20"));

        pg.setCurrentPageNo(pageIndex);
        pg.setRecordCountPerPage(recordCountPerPage);
        pg.setTotalRecordCount(Integer.parseInt(impl.getTrListCnt(vo2)));
        pg.setPageSize(5);
        pg.setTotalPageCount(pg.getTotalPageCount());

        // 페이징
        vo2.setPageIndex(pg.getCurrentPageNo());
        vo2.setRecordCountPerPage(pg.getRecordCountPerPage());
        vo2.setAssetNm(nullChk((String) param.get("assetNm"), ""));
        vo2.setTrMethod(nullChk((String) param.get("trMethod"), ""));
        vo2.setSortType(nullChk((String) param.get("sortType"), "asc"));
        vo2.setSortNm(nullChk((String) param.get("sortNm"), "date"));
        List<MyAssetVo> voList = impl.getAssetAllList(vo2);
        resultMap.put("voList", voList);
        resultMap.put("paginationInfo", pg);
        return resultMap;
    }

    // 123
    @ResponseBody
    @PostMapping("/getMyAssetInfo")
    public Map<String, Object> getMyAssetInfo(@RequestBody Map<String, Object> param) {
        Map<String, Object> resultMap = new HashMap<>();
        MyAssetVo vo = new MyAssetVo();
        List<MyAssetVo> voList = impl.getMyAssetInfo(vo);
        resultMap.put("voList", voList);
        return resultMap;
    }

    private String nullChk(String target, String replacement) {
        String result = "";
        if (!StringUtils.hasText(target)) {
            result = replacement;
        } else {
            result = target;
        }
        return result;
    }
}
