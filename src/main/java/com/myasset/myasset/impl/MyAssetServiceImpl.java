package com.myasset.myasset.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.myasset.myasset.mapper.MyAssetMapper;
import com.myasset.myasset.service.MyAssetService;
import com.myasset.myasset.vo.MyAssetVo;
import com.myasset.myasset.vo.SiseVo;
import com.myasset.myasset.vo.SummaryVo;

@Service
public class MyAssetServiceImpl implements MyAssetService {
    @Autowired
    private MyAssetMapper mapper;

    @Override
    public List<MyAssetVo> getAssetAllList(MyAssetVo vo) {
        return mapper.selectTrList(vo);
    }

    @Override
    public List<MyAssetVo> getMyAssetInfo(MyAssetVo vo) {
        return mapper.selectMyAssetInfo(vo);

    }

    @Override
    public String getTrListCnt(MyAssetVo vo) {
        return mapper.selectTrListCnt(vo);
    }

    @Override
    public List<MyAssetVo> getAssetCatgList(MyAssetVo vo) {
        return mapper.selectAssetCatgList(vo);
    }

    @Override
    public int setTrRecord(MyAssetVo vo) {
        return mapper.insertTrRecord(vo);
    }

    @Override
    public int updateMyAsset(MyAssetVo vo) {
        return mapper.updateMyAsset(vo);
    }

    @Override
    public String selectNowTotal(MyAssetVo vo) {
        return mapper.selectNowTotal(vo).toString();
    }

    @Override
    public int insertTrHist(MyAssetVo vo) {
        return mapper.insertTrHist(vo);
    }

    @Override
    public List<MyAssetVo> selectTrHist(MyAssetVo vo) {
        return mapper.selectTrHist(vo);
    }

    @Override
    public List<MyAssetVo> selectTrHistEach(MyAssetVo vo) {
        return mapper.selectTrHistEach(vo);
    }

    @Override
    public int updateTrHist(MyAssetVo vo) {
        return mapper.updateMyAsset(vo);
    }

    @Override
    public String selectStockCd(String assetNm) {
        return mapper.selectStockCd(assetNm);
    }

    @Override
    public int insertSiseData(SiseVo vo) {
        return mapper.insertSiseData(vo);
    }

    @Override
    public SiseVo chkExistSiseData(SiseVo vo) {
        return mapper.chkExistSiseData(vo);
    }

    @Override
    public List<SiseVo> selectStockData(SiseVo vo) {
        return mapper.selectStockData(vo);
    }

    @Override
    public int insertEachMonthData(SummaryVo vo) {
        return mapper.insertEachMonthData(vo);
    }

    @Override
    public List<SummaryVo> selectEachMonthTrDateByAssetNm(SummaryVo vo) {
        return mapper.selectEachMonthTrDateByAssetNm(vo);
    }

    @Override
    public int insertDividendData(SummaryVo vo) {
        return mapper.insertDividendData(vo);
    }

    @Override
    public List<SummaryVo> selectDividendData(SummaryVo vo) {
        return mapper.selectDividendData(vo);
    }

    @Override
    public List<SummaryVo> selectEachMonthData(SummaryVo vo) {
        return mapper.selectEachMonthData(vo);
    }

    @Override
    public int insertMyAssetChanges(SummaryVo vo) {
        return mapper.insertMyAssetChanges(vo);
    }

    @Override
    public List<SummaryVo> selectDataforGridAssetInfo() {
        return mapper.selectDataforGridAssetInfo();
    }

    @Override
    public List<SummaryVo> selectDataforPopupHist(SummaryVo vo) {
        return mapper.selectDataforPopupHist(vo);
    }

    @Override
    public List<SummaryVo> selectEachMonthDataForChart(SummaryVo vo) {
        return mapper.selectEachMonthDataForChart(vo);
    }

}
