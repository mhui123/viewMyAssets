package com.myasset.myasset.vo;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SummaryVo {
    private String trDate;
    private String assetNm;
    private String assetCatgNm;
    private String trMethod;
    private String trAmt;
    private String trPrice;
    private String trTotPrice;
    private String trCost;
    private String trResult;
    private String amtChange;
    private String priceChange;
    private String totChange;
    private String trState;

    private String needRecoverAmt;
    private String needRecoverTot;
    private String recoveredAmt;
    private String recoveredTot;
    private String recoverResult;
    private String recoverResultTot;

    private String isLast;

    // for Chart
    private String buyMethod;
    private String buyAmt;
    private String buyPrice;
    private String buyTot;
    private String buyResult;

    private String sellMethod;
    private String sellAmt;
    private String sellPrice;
    private String sellTot;
    private String sellResult;
}
