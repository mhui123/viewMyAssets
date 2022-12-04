package com.myasset.myasset.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.myasset.myasset.vo.MyAssetVo;

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

    List<MyAssetVo> selectTrHist(MyAssetVo vo);

    List<MyAssetVo> selectTrHistEach(MyAssetVo vo);
}
