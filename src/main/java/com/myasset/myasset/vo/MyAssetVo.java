package com.myasset.myasset.vo;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MyAssetVo {
    // 자산
    public String assetNm; // 자산이름
    public String assetCatgNm; // 자산유형
    public String assetCatgCd;
    public String assetAmt;
    public String assetPrice;
    public String assetTotprice;

    // 거래
    public String trMethod; // 거래유형
    public String trAmt;
    public String trPrice;
    public String trTotprice;
    public String trCost;
    public String trResult;
    public String trEarnrate;
    public String trDate;
    // 123
}
