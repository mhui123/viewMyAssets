package com.myasset.myasset.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.myasset.myasset.vo.MyAssetVo;

@Mapper
public interface MyAssetMapper {
    List<MyAssetVo> selectAssetAllList(MyAssetVo vo);

    List<MyAssetVo> selectMyAssetInfo(MyAssetVo vo);
}
