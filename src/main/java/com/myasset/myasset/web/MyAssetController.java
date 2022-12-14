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
        vo.setStartDate(nullChk((String) param.get("startDate"), ""));
        vo.setEndDate(nullChk((String) param.get("endDate"), ""));
        List<MyAssetVo> voList = impl.getAssetAllList(vo);
        List<MyAssetVo> assetCatg = impl.getAssetCatgList(vo);
        resultMap.put("voList", voList);
        resultMap.put("assetCatg", assetCatg);
        return resultMap;
    }

    @ResponseBody
    @PostMapping("/getListOpt")
    public Map<String, Object> getList(@RequestBody Map<String, Object> param) {
        Map<String, Object> resultMap = new HashMap<>();
        MyAssetVo vo = new MyAssetVo();

        PaginationInfo pg = new PaginationInfo();
        int pageIndex = Integer.parseInt(nullChk((String) param.get("pageIndex"), "1"));
        int recordCountPerPage = Integer.parseInt(nullChk((String) param.get("pageUnit"), "20"));

        pg.setCurrentPageNo(pageIndex);
        pg.setRecordCountPerPage(recordCountPerPage);
        pg.setTotalRecordCount(Integer.parseInt(impl.getTrListCnt(vo)));
        pg.setPageSize(5);
        pg.setTotalPageCount(pg.getTotalPageCount());

        // ?????????
        vo.setPageIndex(pg.getCurrentPageNo());
        vo.setRecordCountPerPage(pg.getRecordCountPerPage());
        vo.setAssetNm(nullChk((String) param.get("assetNm"), ""));
        vo.setTrMethod(nullChk((String) param.get("trMethod"), ""));
        vo.setSortType(nullChk((String) param.get("sortType"), "asc"));
        vo.setSortNm(nullChk((String) param.get("sortNm"), "date"));
        vo.setStartDate(nullChk((String) param.get("startDate"), ""));
        vo.setEndDate(nullChk((String) param.get("endDate"), ""));
        List<MyAssetVo> voList = impl.getAssetAllList(vo);
        resultMap.put("voList", voList);
        resultMap.put("paginationInfo", pg);
        return resultMap;
    }

    @ResponseBody
    @PostMapping("/getMyAssetInfo")
    public Map<String, Object> getMyAssetInfo(@RequestBody Map<String, Object> param) {
        Map<String, Object> resultMap = new HashMap<>();
        MyAssetVo vo = new MyAssetVo();
        List<MyAssetVo> voList = impl.getMyAssetInfo(vo);
        resultMap.put("shareList", voList);
        return resultMap;
    }

    @ResponseBody
    @PostMapping("/writeTrRecord")
    public Map<String, Object> writeTrRecord(@RequestBody Map<String, Object> param) {
        Map<String, Object> resultMap = new HashMap<>();
        MyAssetVo vo = new MyAssetVo();
        String catg = nullChk((String) param.get("assetCatgNm"), "");
        if ("??????".equals(catg)) {
            vo.setAssetNm(nullChk((String) param.get("assetNm"), ""));
            vo.setAssetCatgNm(nullChk((String) param.get("assetCatgNm"), ""));
            vo.setTrMethod(nullChk((String) param.get("trMethod"), ""));

            vo.setTrAmt(nullChk((String) param.get("trAmt"), ""));
            vo.setTrPrice(nullChk((String) param.get("trPrice"), ""));
            vo.setTrTotprice(nullChk((String) param.get("trTotprice"), ""));
            vo.setTrCost(nullChk((String) param.get("trCost"), ""));

            vo.setTrResult(nullChk((String) param.get("trResult"), ""));
            vo.setTrEarnrate(nullChk((String) param.get("trEarnrate"), ""));
            vo.setTrDate(nullChk((String) param.get("trDate"), ""));
        }
        int result = impl.setTrRecord(vo);
        resultMap.put("result", result);
        return resultMap;
    }

    @ResponseBody
    @PostMapping("/updateAsset")
    public Map<String, Object> updateAsset(@RequestBody Map<String, Object> param) {
        Map<String, Object> resultMap = new HashMap<>();
        MyAssetVo vo = new MyAssetVo();
        vo.setAssetNm(nullChk((String) param.get("assetNm"), ""));
        vo.setAssetCatgNm(nullChk((String) param.get("assetCatgNm"), ""));
        vo.setAssetAmt(nullChk((String) param.get("assetAmt"), ""));
        vo.setAssetPrice(nullChk((String) param.get("assetPrice"), ""));
        vo.setAssetTotprice(nullChk((String) param.get("assetTotprice"), ""));
        vo.setAssetNowTotal(nullChk((String) param.get("assetNowTotal"), ""));
        vo.setAssetNowAvg(nullChk((String) param.get("assetNowAvg"), ""));
        int result = impl.updateMyAsset(vo);
        String nowTotal = impl.selectNowTotal(vo);
        vo.setAssetNowTotal(nowTotal);
        result = impl.updateMyAsset(vo);
        resultMap.put("result", result);
        return resultMap;
    }

    @ResponseBody
    @PostMapping("/writeTrHist")
    public Map<String, Object> writeTrHist(@RequestBody Map<String, Object> param) {
        Map<String, Object> resultMap = new HashMap<>();
        MyAssetVo vo = new MyAssetVo();
        String catg = nullChk((String) param.get("assetCatgNm"), "");
        int result = 0;
        if ("??????".equals(catg)) {
            vo.setAssetNm(nullChk((String) param.get("assetNm"), ""));
            vo.setAssetCatgNm(nullChk((String) param.get("assetCatgNm"), ""));
            vo.setAssetAmt(nullChk((String) param.get("assetAmt"), ""));
            vo.setAssetDividend(nullChk((String) param.get("assetDividend"), ""));
            vo.setAssetPrice(nullChk((String) param.get("assetPrice"), ""));
            vo.setAssetTotprice(nullChk((String) param.get("assetTotprice"), ""));
            vo.setHistPeriodStart(nullChk((String) param.get("histPeriodStart"), ""));
            vo.setHistPeriodEnd(nullChk((String) param.get("histPeriodEnd"), ""));
            vo.setTrResult(nullChk((String) param.get("trResult"), ""));
            result = impl.insertTrHist(vo);
        }
        resultMap.put("result", result);
        return resultMap;
    }

    @ResponseBody
    @PostMapping("/updateTrHist")
    public Map<String, Object> updateTrHist(@RequestBody Map<String, Object> param) {
        Map<String, Object> resultMap = new HashMap<>();
        MyAssetVo vo = new MyAssetVo();
        int result = 0;
        vo.setAssetNm(nullChk((String) param.get("assetNm"), ""));
        vo.setAssetCatgNm(nullChk((String) param.get("assetCatgNm"), ""));
        vo.setAssetAmt(nullChk((String) param.get("assetAmt"), ""));
        vo.setAssetDividend(nullChk((String) param.get("assetDividend"), ""));
        vo.setAssetPrice(nullChk((String) param.get("assetPrice"), ""));
        vo.setAssetTotprice(nullChk((String) param.get("assetTotprice"), ""));
        vo.setHistPeriodStart(nullChk((String) param.get("histPeriodStart"), ""));
        vo.setHistPeriodEnd(nullChk((String) param.get("histPeriodEnd"), ""));
        vo.setTrResult(nullChk((String) param.get("trResult"), ""));
        result = impl.updateTrHist(vo);
        resultMap.put("result", result);
        return resultMap;
    }

    @ResponseBody
    @PostMapping("/getTrHistInfo")
    public Map<String, Object> getTrHistInfo(@RequestBody Map<String, Object> param) {
        Map<String, Object> resultMap = new HashMap<>();
        MyAssetVo vo = new MyAssetVo();
        vo.setHistPeriodStart(nullChk((String) param.get("histPeriodStart"), ""));
        vo.setHistPeriodEnd(nullChk((String) param.get("histPeriodEnd"), ""));
        vo.setAssetNm(nullChk((String) param.get("assetNm"), ""));
        List<MyAssetVo> voList = impl.selectTrHist(vo);

        resultMap.put("voList", voList);
        return resultMap;
    }

    @ResponseBody
    @PostMapping("/getTrHistEachInfo")
    public Map<String, Object> getTrHistEachInfo(@RequestBody Map<String, Object> param) {
        Map<String, Object> resultMap = new HashMap<>();
        MyAssetVo vo = new MyAssetVo();
        vo.setAssetNm(nullChk((String) param.get("assetNm"), ""));
        vo.setHistPeriodStart(nullChk((String) param.get("histPeriodStart"), ""));
        vo.setHistPeriodEnd(nullChk((String) param.get("histPeriodEnd"), ""));
        List<MyAssetVo> voList = impl.selectTrHistEach(vo);
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