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
    public String ersYn;
    public String assetNowTotal;
    public String assetNowAvg;

    // 거래
    public String trMethod; // 거래유형
    public String trAmt;
    public String trPrice;
    public String trTotprice;
    public String trCost;
    public String trResult;
    public String trEarnrate;
    public String trDate;
    public String histPeriodStart;
    public String histPeriodEnd;
    public String startDate;
    public String endDate;
    public String assetDividend;
    public String histNo;

    // pagination 관련
    public int pageIndex;
    public int recordCountPerPage;
    public int firstIndex;

    // 정렬관련
    public String sortType;
    public String sortNm;
}
