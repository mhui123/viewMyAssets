package com.myasset.myasset.vo;

import java.util.Date;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SiseVo {
    // /{assetNm=셀트리온, date=20200102, stPrice=168044, hPrice=169900, lPrice=163402,
    // edPrice=167118, trAmt=669762}
    private String assetNm;
    private String date;
    private int stPrice;
    private int hiPrice;
    private int loPrice;
    private int edPrice;
    private int trAmt;
}
