package com.myasset.myasset.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.myasset.myasset.vo.MyAssetVo;
import com.myasset.myasset.vo.SiseVo;
import com.myasset.myasset.vo.SummaryVo;

@Mapper
public interface MyAssetMapper {
    List<MyAssetVo> selectTrList(MyAssetVo vo);

    List<MyAssetVo> selectMyAssetInfo(MyAssetVo vo);

    List<MyAssetVo> selectAssetCatgList(MyAssetVo vo);

    int insertTrRecord(MyAssetVo vo);

    int updateMyAsset(MyAssetVo vo);

    String selectTrListCnt(MyAssetVo vo);

    String selectNowTotal(MyAssetVo vo);

    int insertTrHist(MyAssetVo vo);

    int updateTrHist(MyAssetVo vo);

    List<MyAssetVo> selectTrHist(MyAssetVo vo);

    List<MyAssetVo> selectTrHistEach(MyAssetVo vo);

    String selectStockCd(String assetNm);

    int insertSiseData(SiseVo vo);

    SiseVo chkExistSiseData(SiseVo vo);

    List<SiseVo> selectStockData(SiseVo vo);

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
