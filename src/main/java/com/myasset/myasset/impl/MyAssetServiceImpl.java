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

}
