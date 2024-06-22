package com.myasset.myasset.web;

import com.myasset.myasset.impl.MyAssetServiceImpl;
import com.myasset.myasset.vo.MyAssetVo;
import com.myasset.myasset.vo.PaginationInfo;
import com.myasset.myasset.vo.SiseVo;
import com.myasset.myasset.vo.SummaryVo;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "https://api.finance.naver.com/")
@Controller
@RequestMapping("/file")
public class FileUploadController {
    @Autowired
    private MyAssetServiceImpl impl;
    @PostMapping("/upload/stock")
    public String writeStockTradeHist(@RequestParam("file") MultipartFile file,
                                   RedirectAttributes redirectAttributes) {

        if (file.isEmpty()) {
            redirectAttributes.addFlashAttribute("message", "Please select a file to upload");
            return "redirect:uploadStatus";
        }

        List<MyAssetVo> voList = impl.convertFileToVo(file);
        for(MyAssetVo vo : voList){
            int result = impl.setTrRecord(vo);
        }

        return "redirect:/uploadStatus";
    }

    @PostMapping("/upload/divid")
    public String writeDividendHist(@RequestParam("file") MultipartFile file,
                                   RedirectAttributes redirectAttributes) {

        if (file.isEmpty()) {
            redirectAttributes.addFlashAttribute("message", "Please select a file to upload");
            return "redirect:uploadStatus";
        }

        List<SummaryVo> voList = impl.addDividendHist(file);
        for(SummaryVo vo : voList){
            int result = impl.insertDividendData(vo);
        }

        return "redirect:/uploadStatus";
    }
}