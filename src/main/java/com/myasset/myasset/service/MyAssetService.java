package com.myasset.myasset.service;

import java.util.List;

import com.myasset.myasset.vo.MyAssetVo;
import com.myasset.myasset.vo.SiseVo;
import com.myasset.myasset.vo.SummaryVo;

public interface MyAssetService {
    List<MyAssetVo> getAssetAllList(MyAssetVo vo);

    List<MyAssetVo> getMyAssetInfo(MyAssetVo vo);

    List<MyAssetVo> getAssetCatgList(MyAssetVo vo);

    int setTrRecord(MyAssetVo vo);

    int updateMyAsset(MyAssetVo vo);

    String getTrListCnt(MyAssetVo vo);

    String selectNowTotal(MyAssetVo vo);

    int insertTrHist(MyAssetVo vo);

    int updateTrHist(MyAssetVo vo);

    List<MyAssetVo> selectTrHist(MyAssetVo vo);

    List<MyAssetVo> selectTrHistEach(MyAssetVo vo);

    String selectStockCd(String assetNm);

    int insertSiseData(SiseVo vo);

    SiseVo chkExistSiseData(SiseVo vo);

    List<SiseVo> selectStockData(SiseVo vo);

    List<SiseVo> selectMonthSiseData(SiseVo vo);

    List<SummaryVo> selectEachMonthTrDateByAssetNm(SummaryVo vo);

    List<SummaryVo> selectEachMonthDataForChart(SummaryVo vo);

    int insertEachMonthData(SummaryVo vo);

    List<SummaryVo> selectDividendData(SummaryVo vo);

    int insertDividendData(SummaryVo vo);

    List<SummaryVo> selectEachMonthData(SummaryVo vo);

    int insertMyAssetChanges(SummaryVo vo);

    List<SummaryVo> selectDataforGridAssetInfo();

    List<SummaryVo> selectDataforPopupHist(SummaryVo vo);
}
