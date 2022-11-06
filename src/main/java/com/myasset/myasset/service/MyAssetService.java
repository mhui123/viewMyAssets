package com.myasset.myasset.service;

import java.util.List;

import com.myasset.myasset.vo.MyAssetVo;

public interface MyAssetService {
    List<MyAssetVo> getAssetAllList(MyAssetVo vo);

    List<MyAssetVo> getMyAssetInfo(MyAssetVo vo);

    // 123
}
