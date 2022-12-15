package com.myasset.myasset.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.myasset.myasset.mapper.MyAssetMapper;
import com.myasset.myasset.service.MyAssetService;
import com.myasset.myasset.vo.MyAssetVo;

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

}
