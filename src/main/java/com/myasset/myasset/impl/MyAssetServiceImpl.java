package com.myasset.myasset.impl;

import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.myasset.myasset.mapper.MyAssetMapper;
import com.myasset.myasset.service.MyAssetService;
import com.myasset.myasset.vo.MyAssetVo;
import com.myasset.myasset.vo.SiseVo;
import com.myasset.myasset.vo.SummaryVo;
import org.springframework.web.multipart.MultipartFile;

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
        mapper.insertCashHist(vo);
        if (vo.getAssetCatgNm().startsWith("배당금")) {
            int idx = vo.getTrDate().lastIndexOf("/");
            String date = vo.getTrDate().substring(0, idx);
            date = date.replace("/", "");
            vo.setTrDate(date);
            vo.setAssetCatgNm("주식");
            mapper.insertDividendData(vo);
        }
        return 1;
    }

    @Override
    public String selectDividendData(SummaryVo vo) {
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

    @Override
    public List<SiseVo> selectMonthSiseData(SiseVo vo) {
        return mapper.selectMonthSiseData(vo);
    }

    @Override
    public String selectLastSiseDay() {
        return mapper.selectLastSiseDay();
    }

    @Override
    public List<MyAssetVo> convertFileToVo(MultipartFile file) {
        List<MyAssetVo> voList = new ArrayList<>();
        try {
            InputStream inputStream = file.getInputStream();
            Workbook workbook = new XSSFWorkbook(inputStream);
            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rows = sheet.iterator();

            int rowIdx = 0;
            while (rows.hasNext()) {
                Row currntRow = rows.next();
                Iterator<Cell> cellsInRow = currntRow.iterator();
                int cellIdx = 0;
                MyAssetVo vo = new MyAssetVo();
                if (rowIdx > 0) {
                    while (cellsInRow.hasNext()) {
                        Cell currentCell = cellsInRow.next();
                        String contentString = currentCell.getCellType() == CellType.STRING
                                ? currentCell.getStringCellValue()
                                : null;
                        double contentDouble = currentCell.getCellType() == CellType.NUMERIC
                                ? currentCell.getNumericCellValue()
                                : 0;
                        if (currentCell.getCellType() == CellType.NUMERIC) {
                            contentString = String.valueOf(contentDouble).replace(".0", "");
                        }
                        vo.setAssetCatgNm("주식");
                        if (cellIdx == 0) {
                            vo.setTrDate(contentString);
                        } else if (cellIdx == 1) {
                            vo.setAssetNm(contentString);
                        } else if (cellIdx == 3) {
                            contentString = "01".equals(contentString) ? "매도" : "매수";
                            vo.setTrMethod(contentString);
                        } else if (cellIdx == 4) {
                            vo.setTrAmt(contentString);
                        } else if (cellIdx == 5) {
                            vo.setTrPrice(contentString);
                        } else if (cellIdx == 7 && "매도".equals(vo.getTrMethod())) {
                            vo.setTrTotprice(contentString);
                        } else if (cellIdx == 8 && "매수".equals(vo.getTrMethod())) {
                            vo.setTrTotprice(contentString);
                        } else if (cellIdx == 9) {
                            vo.setFee(contentString);
                        } else if (cellIdx == 10) {
                            vo.setTax(contentString);
                        } else if (cellIdx == 11) {
                            vo.setTrResult(contentString);
                        } else if (cellIdx == 12) {
                            int fee = vo.getFee() != null ? Integer.parseInt(vo.getFee()) : 0;
                            int tax = vo.getTax() != null ? Integer.parseInt(vo.getTax()) : 0;
                            int cost = fee + tax;
                            vo.setTrEarnrate(contentString);
                            vo.setTrCost(String.valueOf(cost));
                        }
                        cellIdx++;
                    }
                    voList.add(vo);
                }
                rowIdx++;
            }
            workbook.close();

        } catch (IOException e) {
            e.printStackTrace();
        }
        return voList;
    }

    @Override
    public List<SummaryVo> addDividendHist(MultipartFile file) {
        List<SummaryVo> voList = new ArrayList<>();
        try {
            InputStream inputStream = file.getInputStream();
            Workbook workbook = new XSSFWorkbook(inputStream);
            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rows = sheet.iterator();
            SummaryVo tempVo = new SummaryVo();
            int rowIdx = 0;
            while (rows.hasNext()) {
                Row currntRow = rows.next();
                Iterator<Cell> cellsInRow = currntRow.iterator();
                int cellIdx = 0;
                boolean rowIsOdd = rowIdx % 2 == 0;
                SummaryVo vo = null;
                if (rowIsOdd) {
                    vo = new SummaryVo();
                } else if (!voList.isEmpty()) {
                    vo = voList.get(voList.size() - 1);
                }
                if (rowIdx > 1) {
                    while (cellsInRow.hasNext()) {
                        Cell currentCell = cellsInRow.next();
                        String contentString = currentCell.getCellType() == CellType.STRING
                                ? currentCell.getStringCellValue()
                                : "0";
                        double contentDouble = currentCell.getCellType() == CellType.NUMERIC
                                ? currentCell.getNumericCellValue()
                                : 0;
                        if (currentCell.getCellType() == CellType.NUMERIC) {
                            contentString = String.valueOf(BigDecimal.valueOf(contentDouble)).replace(".0", "");
                        }

                        if (rowIsOdd) {
                            if (cellIdx == 0) {
                                vo.setTrDate(contentString);
                            } else if (cellIdx == 1) {
                                vo.setAssetCatgNm(contentString);
                                vo.setTrMethod(contentString);
                            } else if (cellIdx == 3) {
                                vo.setTrPrice(contentString);
                            } else if (cellIdx == 4) {
                                vo.setTrTotPrice(contentString);
                            } else if (cellIdx >= 5 && cellIdx < 9) {
                                if (!"".equals(contentString)) {
                                    int fee = Integer.parseInt(contentString);
                                    int temp = vo.getTotFee() != null ? Integer.parseInt(vo.getTotFee()) : 0;
                                    fee = fee + temp;
                                    contentString = String.valueOf(fee);
                                }
                                vo.setTotFee(contentString);
                            }

                        } else {
                            if (cellIdx == 1) {
                                vo.setAssetNm(contentString);
                            } else if (cellIdx >= 5 && cellIdx < 9) {
                                if (!"".equals(contentString)) {
                                    int fee = Integer.parseInt(contentString);
                                    int temp = vo.getTotFee() != null ? Integer.parseInt(vo.getTotFee()) : 0;
                                    fee = fee + temp;
                                    contentString = String.valueOf(fee);
                                }
                                vo.setTotFee(contentString);
                            } else if (cellIdx == 9) {
                                vo.setResultCash(contentString);
                            }
                        }
                        // System.out.print("[내용확인]" + contentString + "\t");
                        cellIdx++;
                    }
                    System.out.println();
                    if (rowIsOdd) {
                        voList.add(vo);
                    }

                }

                rowIdx++;
            }
            workbook.close();

        } catch (IOException e) {
            e.printStackTrace();
        }
        return voList;
    }

    @Override
    public int updateMyAssetInfo() {
        List<String> assetNms = mapper.selectAssetNms();
        int totPrintCnt = 0;
        for (String assetNm : assetNms) {
            SummaryVo vo = new SummaryVo();
            vo.setAssetNm(assetNm);
            List<SummaryVo> eachMonthData = mapper.selectEachMonthData(vo);
            eachMonthData = convertVoList(eachMonthData);
            // System.out.println(eachMonthData.get(0).getAssetNm() + "size : " +
            // eachMonthData.size());
            totPrintCnt++;
            for (SummaryVo svo : eachMonthData) {
                int accAmount = Integer.parseInt(svo.getAssetAmt());
                if (accAmount == 0) {
                    svo.setTrState("settle");
                } else {
                    svo.setTrState("having");
                }
                mapper.insertMyAssetChanges(svo);
            }
        }
        System.out.println("총 출력횟수 : " + totPrintCnt);
        return 0;
    }

    public List<SummaryVo> convertVoList(List<SummaryVo> list) {
        SummaryVo tempVo = null;
        int assetAmt = 0;
        int assetTotPrice = 0;
        int accResult = 0;
        for (int i = 0; i < list.size(); i++) {
            SummaryVo vo = list.get(i);
            vo.setIsLast("N");

            int voAmtChange = vo.getAmtChange() == null ? 0 : Integer.parseInt(vo.getAmtChange());
            int voTotChange = vo.getTotChange() == null ? 0 : Integer.parseInt(vo.getTotChange());
            int voTrResult = vo.getTrResult() == null ? 0 : Integer.parseInt(vo.getTrResult());
            int voPrice = voAmtChange != 0 && voTotChange != 0 ? (voTotChange / voAmtChange) : 0;
            assetAmt += voAmtChange;
            assetTotPrice += voTotChange;
            accResult += voTrResult;

            if (i == list.size() - 1) {
                vo.setIsLast("Y");
            }

            vo.setAssetAmt(String.valueOf(assetAmt));
            vo.setAssetTotPrice(String.valueOf(assetTotPrice));
            vo.setAccResult(String.valueOf((accResult)));
            vo.setAssetPrice(String.valueOf(voPrice));
        }
        return list;
    }
}
