package com.myasset.myasset.web;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.myasset.myasset.utils.CommonUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.myasset.myasset.impl.MyAssetServiceImpl;
import com.myasset.myasset.vo.MyAssetVo;
import com.myasset.myasset.vo.PaginationInfo;
import com.myasset.myasset.vo.SiseVo;
import com.myasset.myasset.vo.SummaryVo;

@CrossOrigin(origins = "https://api.finance.naver.com/")
@Controller
@RequestMapping("/")
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
        vo.setStartDate(CommonUtil.nullChk((String) param.get("startDate"), ""));
        vo.setEndDate(CommonUtil.nullChk((String) param.get("endDate"), ""));
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
        int pageIndex = Integer.parseInt(CommonUtil.nullChk((String) param.get("pageIndex"), "1"));
        int recordCountPerPage = Integer.parseInt(CommonUtil.nullChk((String) param.get("pageUnit"), "20"));

        pg.setCurrentPageNo(pageIndex);
        pg.setRecordCountPerPage(recordCountPerPage);
        pg.setTotalRecordCount(Integer.parseInt(impl.getTrListCnt(vo)));
        pg.setPageSize(5);
        pg.setFirstIndex();
        pg.setTotalPageCount(pg.getTotalPageCount());

        // 페이징
        vo.setPageIndex(pg.getFirstIndex());
        vo.setRecordCountPerPage(pg.getRecordCountPerPage());
        vo.setAssetNm(CommonUtil.nullChk((String) param.get("assetNm"), ""));
        vo.setTrMethod(CommonUtil.nullChk((String) param.get("trMethod"), ""));
        vo.setSortType(CommonUtil.nullChk((String) param.get("sortType"), "asc"));
        vo.setSortNm(CommonUtil.nullChk((String) param.get("sortNm"), "date"));
        vo.setStartDate(CommonUtil.nullChk((String) param.get("startDate"), ""));
        vo.setEndDate(CommonUtil.nullChk((String) param.get("endDate"), ""));
        List<MyAssetVo> voList = impl.getAssetAllList(vo);
        resultMap.put("voList", voList);
        resultMap.put("paginationInfo", pg);
        return resultMap;
    }

    @ResponseBody
    @PostMapping("/getMyAssetInfo")
    public Map<String, Object> getMyAssetInfo(@RequestBody Map<String, Object> param) {
        Map<String, Object> resultMap = new HashMap<>();
        List<SummaryVo> assetList = impl.selectDataforGridAssetInfo();
        resultMap.put("shareList", assetList);
        return resultMap;
    }

    @ResponseBody
    @PostMapping("/updateMyAssetInfo")
    public Map<String, Object> updateMyAssetInfo(@RequestBody Map<String, Object> param) {
        Map<String, Object> resultMap = new HashMap<>();
        int result = impl.updateMyAssetInfo();
        return resultMap;
    }

    @ResponseBody
    @PostMapping("/writeTrRecord")
    public Map<String, Object> writeTrRecord(@RequestBody Map<String, Object> param) {
        Map<String, Object> resultMap = new HashMap<>();
        MyAssetVo vo = new MyAssetVo();
        String catg = CommonUtil.nullChk((String) param.get("assetCatgNm"), "");
        if ("주식".equals(catg)) {
            vo.setAssetNm(CommonUtil.nullChk((String) param.get("assetNm"), ""));
            vo.setAssetCatgNm(CommonUtil.nullChk((String) param.get("assetCatgNm"), ""));
            vo.setTrMethod(CommonUtil.nullChk((String) param.get("trMethod"), ""));

            vo.setTrAmt(CommonUtil.nullChk((String) param.get("trAmt"), ""));
            vo.setTrPrice(CommonUtil.nullChk((String) param.get("trPrice"), ""));
            vo.setTrTotprice(CommonUtil.nullChk((String) param.get("trTotprice"), ""));
            vo.setTrCost(CommonUtil.nullChk((String) param.get("trCost"), ""));

            vo.setTrResult(CommonUtil.nullChk((String) param.get("trResult"), ""));
            vo.setTrEarnrate(CommonUtil.nullChk((String) param.get("trEarnrate"), ""));
            vo.setTrDate(CommonUtil.nullChk((String) param.get("trDate"), ""));
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
        vo.setAssetNm(CommonUtil.nullChk((String) param.get("assetNm"), ""));
        vo.setAssetCatgNm(CommonUtil.nullChk((String) param.get("assetCatgNm"), ""));
        vo.setAssetAmt(CommonUtil.nullChk((String) param.get("assetAmt"), ""));
        vo.setAssetPrice(CommonUtil.nullChk((String) param.get("assetPrice"), ""));
        vo.setAssetTotprice(CommonUtil.nullChk((String) param.get("assetTotprice"), ""));
        vo.setAssetNowTotal(CommonUtil.nullChk((String) param.get("assetNowTotal"), ""));
        vo.setAssetNowAvg(CommonUtil.nullChk((String) param.get("assetNowAvg"), ""));
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
        String catg = CommonUtil.nullChk((String) param.get("assetCatgNm"), "");
        int result = 0;
        if ("주식".equals(catg)) {
            vo.setAssetNm(CommonUtil.nullChk((String) param.get("assetNm"), ""));
            vo.setAssetCatgNm(CommonUtil.nullChk((String) param.get("assetCatgNm"), ""));
            vo.setAssetAmt(CommonUtil.nullChk((String) param.get("assetAmt"), ""));
            vo.setAssetDividend(CommonUtil.nullChk((String) param.get("assetDividend"), ""));
            vo.setAssetPrice(CommonUtil.nullChk((String) param.get("assetPrice"), ""));
            vo.setAssetTotprice(CommonUtil.nullChk((String) param.get("assetTotprice"), ""));
            vo.setHistPeriodStart(CommonUtil.nullChk((String) param.get("histPeriodStart"), ""));
            vo.setHistPeriodEnd(CommonUtil.nullChk((String) param.get("histPeriodEnd"), ""));
            vo.setTrResult(CommonUtil.nullChk((String) param.get("trResult"), ""));
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
        vo.setAssetNm(CommonUtil.nullChk((String) param.get("assetNm"), ""));
        vo.setAssetCatgNm(CommonUtil.nullChk((String) param.get("assetCatgNm"), ""));
        vo.setAssetAmt(CommonUtil.nullChk((String) param.get("assetAmt"), ""));
        vo.setAssetDividend(CommonUtil.nullChk((String) param.get("assetDividend"), ""));
        vo.setAssetPrice(CommonUtil.nullChk((String) param.get("assetPrice"), ""));
        vo.setAssetTotprice(CommonUtil.nullChk((String) param.get("assetTotprice"), ""));
        vo.setHistPeriodStart(CommonUtil.nullChk((String) param.get("histPeriodStart"), ""));
        vo.setHistPeriodEnd(CommonUtil.nullChk((String) param.get("histPeriodEnd"), ""));
        vo.setTrResult(CommonUtil.nullChk((String) param.get("trResult"), ""));
        result = impl.updateTrHist(vo);
        resultMap.put("result", result);
        return resultMap;
    }

    @ResponseBody
    @PostMapping("/getTrHistInfo")
    public Map<String, Object> getTrHistInfo(@RequestBody Map<String, Object> param) {
        Map<String, Object> resultMap = new HashMap<>();
        MyAssetVo vo = new MyAssetVo();
        vo.setHistPeriodStart(CommonUtil.nullChk((String) param.get("histPeriodStart"), ""));
        vo.setHistPeriodEnd(CommonUtil.nullChk((String) param.get("histPeriodEnd"), ""));
        vo.setAssetNm(CommonUtil.nullChk((String) param.get("assetNm"), ""));
        List<MyAssetVo> voList = impl.selectTrHist(vo);

        resultMap.put("voList", voList);
        return resultMap;
    }

    @ResponseBody
    @PostMapping("/getTrHistEachInfo")
    public Map<String, Object> getTrHistEachInfo(@RequestBody Map<String, Object> param) {
        Map<String, Object> resultMap = new HashMap<>();
        MyAssetVo vo = new MyAssetVo();

        PaginationInfo pg = new PaginationInfo();
        int pageIndex = Integer.parseInt(CommonUtil.nullChk((String) param.get("pageIndex"), "1"));
        int recordCountPerPage = Integer.parseInt(CommonUtil.nullChk((String) param.get("pageUnit"), "20"));

        pg.setCurrentPageNo(pageIndex);
        pg.setRecordCountPerPage(recordCountPerPage);
        pg.setTotalRecordCount(Integer.parseInt(impl.getTrListCnt(vo)));
        pg.setPageSize(5);
        pg.setTotalPageCount(pg.getTotalPageCount());

        vo.setPageIndex(pg.getCurrentPageNo());
        vo.setRecordCountPerPage(pg.getRecordCountPerPage());
        vo.setAssetNm(CommonUtil.nullChk((String) param.get("assetNm"), ""));
        vo.setHistPeriodStart(CommonUtil.nullChk((String) param.get("histPeriodStart"), ""));
        vo.setHistPeriodEnd(CommonUtil.nullChk((String) param.get("histPeriodEnd"), ""));
        List<MyAssetVo> voList = impl.selectTrHistEach(vo);
        resultMap.put("voList", voList);
        return resultMap;
    }

    @ResponseBody
    @PostMapping("/getStockCode")
    public Map<String, Object> getStockCode(@RequestBody Map<String, Object> param) {
        Map<String, Object> resultMap = new HashMap<>();
        String cd = impl.selectStockCd(CommonUtil.nullChk((String) param.get("assetNm"), ""));
        resultMap.put("cd", cd);

        return resultMap;
    }

    @ResponseBody
    @PostMapping("/pushSise")
    public Map<String, Object> pushSise(@RequestBody Map<String, List<SiseVo>> param) {
        Map<String, Object> resultMap = new HashMap<>();
        List<SiseVo> paramList = param.get("list");
        for (SiseVo vo : paramList) {
            impl.insertSiseData(vo);
        }
        return resultMap;
    }

    @ResponseBody
    @PostMapping("/getLastSiseDay")
    public Map<String, Object> getLastSiseDay() {
        Map<String, Object> resultMap = new HashMap<>();
        String lastDay = impl.selectLastSiseDay();
        resultMap.put("lastDay", lastDay);
        return resultMap;
    }

    @ResponseBody
    @PostMapping("/getStockData")
    public Map<String, Object> getStockData(@RequestBody SiseVo param) {
        Map<String, Object> resultMap = new HashMap<>();
        List<SiseVo> result = impl.selectMonthSiseData(param);
        String lastDay = impl.selectLastSiseDay();
        resultMap.put("result", result);
        resultMap.put("lastDay", lastDay);
        return resultMap;
    }

    @ResponseBody
    @PostMapping("/setEachMonthData")
    public Map<String, Object> selectEachMonthTrDateByAssetNm(@RequestBody Map<String, List<String>> param) {
        Map<String, Object> resultMap = new HashMap<>();
        List<String> assetNms = param.get("assetNms");
        SummaryVo vo = new SummaryVo();
        for (String assetNm : assetNms) {
            vo.setAssetNm(assetNm);
            List<SummaryVo> list = impl.selectEachMonthTrDateByAssetNm(vo);
            for (SummaryVo svo : list) {
                impl.insertEachMonthData(svo);
            }
        }
//        vo = new SummaryVo();
////        List<SummaryVo> dividendList = impl.selectDividendData(vo);
////        for (SummaryVo svo : dividendList) {
////            impl.insertDividendData(svo);
////        }
        return resultMap;
    }

    @ResponseBody
    @PostMapping("/getEachMonthData")
    public Map<String, Object> selectEachMonthTrData(@RequestBody Map<String, String> param) {
        Map<String, Object> resultMap = new HashMap<>();
        SummaryVo vo = new SummaryVo();
        vo.setAssetNm(CommonUtil.nullChk(param.get("assetNm"), "a"));

        impl.insertEachMonthData(vo); // select하기 전 each_month_data 테이블 최신화
        List<SummaryVo> list = impl.selectEachMonthData(vo);

        resultMap.put("list", list);
        return resultMap;
    }

    @ResponseBody
    @PostMapping("/setMyassetMonthData")
    public Map<String, Object> setMyassetMonthData(@RequestBody Map<String, List<SummaryVo>> param) {
        Map<String, Object> resultMap = new HashMap<>();
        List<SummaryVo> summarys = param.get("list");
        for (SummaryVo vo : summarys) {
            impl.insertMyAssetChanges(vo);
        }
        return resultMap;
    }

    @ResponseBody
    @PostMapping("/getDataForPopup")
    public Map<String, Object> getDataForPopup(@RequestBody SummaryVo param) {
        Map<String, Object> resultMap = new HashMap<>();
        SummaryVo vo = param;
        List<SummaryVo> voList = impl.selectDataforPopupHist(vo);
        String totalDividend = impl.selectDividendData(vo);
        resultMap.put("list", voList);
        resultMap.put("totalDividend", totalDividend);
        return resultMap;
    }

    @ResponseBody
    @PostMapping("/selectDataForChart")
    public Map<String, Object> selectDataForChart(@RequestBody SummaryVo param) {
        Map<String, Object> resultMap = new HashMap<>();
        List<SummaryVo> voList = impl.selectEachMonthDataForChart(param);
        resultMap.put("list", voList);
        return resultMap;
    }
}